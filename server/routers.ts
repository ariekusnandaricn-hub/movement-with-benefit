import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { registrations } from "../drizzle/schema";
import { getDb } from "./db";
import { storagePut } from "./storage";
import { like, eq, and } from "drizzle-orm";
import { generateInvoiceId, generatePaymentAmount, getCategoryCode } from "./utils/provinceCodeMapping";
import { sendPaymentVerificationEmail, sendPaymentReminderEmail } from "./utils/emailNotification";
import { sendPaymentVerificationWhatsApp, sendPaymentReminderWhatsApp } from "./utils/whatsappNotification";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  registration: router({
    list: publicProcedure
      .input(z.object({
        search: z.string().optional(),
        category: z.enum(["Acting", "Vocal", "Model"]).optional(),
        status: z.enum(["pending_verification", "verified", "rejected"]).optional(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        let whereConditions = [];
        
        if (input.search) {
          whereConditions.push(
            like(registrations.fullName, `%${input.search}%`)
          );
        }
        
        if (input.category) {
          whereConditions.push(eq(registrations.category, input.category));
        }
        
        if (input.status) {
          whereConditions.push(eq(registrations.paymentStatus, input.status));
        }

        if (whereConditions.length === 0) {
          return await db.select().from(registrations);
        }

        if (whereConditions.length === 1) {
          return await db.select().from(registrations).where(whereConditions[0]);
        }

        // For multiple conditions, use AND
        return await db.select().from(registrations).where(
          whereConditions.reduce((acc, cond) => acc && cond)
        );
      }),
    create: publicProcedure
      .input(z.object({
        fullName: z.string(),
        email: z.string().email(),
        address: z.string(),
        birthPlace: z.string(),
        birthDate: z.string(),
        whatsappNumber: z.string(),
        gender: z.enum(["Laki-laki", "Perempuan"]),
        profession: z.string(),
        province: z.string(),
        category: z.enum(["Acting", "Vocal", "Model"]),
        nik: z.string().optional().nullable(),
        kiaNumber: z.string().optional().nullable(),
        photoBase64: z.string(),
        photoMimeType: z.string(),
        parentalConsentBase64: z.string().optional().nullable(),
        parentalConsentMimeType: z.string().optional().nullable(),
        isMinor: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const registrationNumber = `MWB-${Date.now()}`;

        let photoLink = null;
        try {
          const parts = input.photoBase64.split(",");
          const buffer = Buffer.from(parts[1], "base64");
          const result = await storagePut(
            `registrations/${registrationNumber}-photo.jpg`,
            buffer,
            input.photoMimeType
          );
          photoLink = result.url;
        } catch (error) {
          console.error("Failed to upload photo:", error);
        }

        let parentalConsentLink = null;
        if (input.parentalConsentBase64) {
          try {
            const parts = input.parentalConsentBase64.split(",");
            const buffer = Buffer.from(parts[1], "base64");
            const result = await storagePut(
              `registrations/${registrationNumber}-parental-consent.pdf`,
              buffer,
              input.parentalConsentMimeType || "application/pdf"
            );
            parentalConsentLink = result.url;
          } catch (error) {
            console.error("Failed to upload parental consent:", error);
          }
        }

        await db.insert(registrations).values({
          registrationNumber,
          fullName: input.fullName,
          email: input.email,
          address: input.address,
          birthPlace: input.birthPlace,
          birthDate: input.birthDate,
          whatsappNumber: input.whatsappNumber,
          gender: input.gender,
          profession: input.profession,
          province: input.province,
          category: input.category,
          nik: input.nik || null,
          kiaNumber: input.kiaNumber || null,
          photoLink,
          parentalConsentUrl: parentalConsentLink,
          isMinor: input.isMinor || 0,
          paymentStatus: "pending",
        });

        // Generate invoice ID: MWB-[KATEGORI].[URUTAN].[KODE_PROVINSI]
        // Count registrations for this category to get sequential number
        const categoryRegistrations = await db
          .select()
          .from(registrations)
          .where(eq(registrations.category, input.category));
        
        const sequentialNumber = categoryRegistrations.length + 1;
        const invoiceId = generateInvoiceId(input.category, sequentialNumber, input.province);
        const paymentAmount = generatePaymentAmount(invoiceId);

        return {
          success: true,
          registrationNumber,
          invoiceId,
          paymentAmount,
          message: "Pendaftaran berhasil dibuat!"
        };
      }),
    uploadPaymentProof: publicProcedure
      .input(z.object({
        registrationNumber: z.string(),
        paymentProofBase64: z.string(),
        paymentProofMimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        let paymentProofLink = null;
        try {
          const parts = input.paymentProofBase64.split(",");
          const buffer = Buffer.from(parts[1], "base64");
          const result = await storagePut(
            `payments/${input.registrationNumber}-proof.jpg`,
            buffer,
            input.paymentProofMimeType
          );
          paymentProofLink = result.url;
        } catch (error) {
          console.error("Failed to upload payment proof:", error);
          throw new Error("Gagal mengupload bukti pembayaran");
        }

        // Update payment status
        await db.update(registrations)
          .set({
            paymentProofUrl: paymentProofLink,
            paymentStatus: "pending_verification",
          })
          .where(eq(registrations.registrationNumber, input.registrationNumber));

        return {
          success: true,
          message: "Bukti pembayaran berhasil diupload!"
        };
      }),
    verifyPayment: publicProcedure
      .input(z.object({
        registrationNumber: z.string(),
        isApproved: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const registration = await db
          .select()
          .from(registrations)
          .where(eq(registrations.registrationNumber, input.registrationNumber))
          .limit(1);

        if (!registration || registration.length === 0) {
          throw new Error("Registrasi tidak ditemukan");
        }

        const reg = registration[0];
        const newStatus = input.isApproved ? "verified" : "rejected";

        await db.update(registrations)
          .set({
            paymentStatus: newStatus,
          })
          .where(eq(registrations.registrationNumber, input.registrationNumber));

        if (input.isApproved) {
          try {
            await sendPaymentVerificationEmail(
              reg.email,
              reg.fullName,
              reg.category,
              reg.invoiceId || "",
              reg.registrationNumber
            );

            await sendPaymentVerificationWhatsApp(
              reg.whatsappNumber,
              reg.fullName,
              reg.category,
              reg.invoiceId || "",
              reg.registrationNumber
            );
          } catch (error) {
            console.error("Error sending notifications:", error);
          }
        }

        return {
          success: true,
          message: input.isApproved
            ? "Pembayaran diverifikasi dan notifikasi telah dikirim!"
            : "Pembayaran ditolak",
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
