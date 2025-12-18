import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { registrations } from "../drizzle/schema";
import { getDb } from "./db";
import { storagePut } from "./storage";
import { like, eq, and, desc } from "drizzle-orm";
import { generateInvoiceId, generatePaymentAmount, getCategoryCode, generateParticipantNumber } from "./utils/provinceCodeMapping";
import { sendPaymentVerificationEmail, sendPaymentReminderEmail } from "./utils/emailNotification";
import { sendPaymentVerificationWhatsApp, sendPaymentReminderWhatsApp } from "./utils/whatsappNotification";
import { sendPaymentVerificationEmailViaResend } from "./utils/resendEmailService";
import { broadcastNewRegistration, broadcastPaymentStatusUpdate } from "./_core/websocket";

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
          participantNumber: "", // Will be updated after counting
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
        const participantNumber = generateParticipantNumber(input.category, sequentialNumber, input.province);

        // Update registration with participant number and invoice details
        await db.update(registrations)
          .set({
            participantNumber,
            invoiceId,
            invoiceAmount: paymentAmount,
          })
          .where(eq(registrations.registrationNumber, registrationNumber));

        // Send automatic notifications for testing
        try {
          // Try to send via Resend first
          const emailSent = await sendPaymentVerificationEmailViaResend(
            input.email,
            input.fullName,
            input.category,
            invoiceId,
            participantNumber,
            paymentAmount
          );
          
          // Fallback to local email service if Resend fails
          if (!emailSent) {
            await sendPaymentVerificationEmail(
              input.email,
              input.fullName,
              input.category,
              participantNumber,
              invoiceId,
              paymentAmount
            );
          }
          
          await sendPaymentVerificationWhatsApp(
            input.whatsappNumber,
            input.fullName,
            input.category,
            participantNumber,
            invoiceId,
            paymentAmount
          );
        } catch (error) {
          console.error("Failed to send notifications:", error);
        }

        // Broadcast new registration to admin dashboard
        try {
          broadcastNewRegistration({
            registrationNumber,
            fullName: input.fullName,
            category: input.category,
            province: input.province,
            email: input.email,
            participantNumber,
            paymentStatus: "pending",
            createdAt: new Date(),
          });
        } catch (error) {
          console.error("Failed to broadcast registration:", error);
        }

        return {
          success: true,
          registrationNumber,
          participantNumber,
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
          // Extract base64 data more safely
          let base64Data = input.paymentProofBase64;
          if (base64Data.includes(",")) {
            base64Data = base64Data.split(",")[1];
          }
          
          if (!base64Data) {
            throw new Error("Data bukti pembayaran tidak valid");
          }
          
          const buffer = Buffer.from(base64Data, "base64");
          
          if (buffer.length === 0) {
            throw new Error("File bukti pembayaran kosong");
          }
          
          const result = await storagePut(
            `payments/${input.registrationNumber}-proof.jpg`,
            buffer,
            input.paymentProofMimeType
          );
          paymentProofLink = result.url;
        } catch (error) {
          console.error("Failed to upload payment proof:", error);
          const errorMsg = error instanceof Error ? error.message : "Unknown error";
          throw new Error(`Gagal mengupload bukti pembayaran: ${errorMsg}`);
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
              reg.participantNumber || reg.registrationNumber,
              reg.invoiceAmount || undefined
            );

            await sendPaymentVerificationWhatsApp(
              reg.whatsappNumber,
              reg.fullName,
              reg.category,
              reg.invoiceId || "",
              reg.participantNumber || reg.registrationNumber,
              reg.invoiceAmount || undefined
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

  admin: router({
    getRegistrations: publicProcedure
      .input(z.object({
        search: z.string().optional(),
        category: z.enum(["Acting", "Vocal", "Model"]).optional(),
        province: z.string().optional(),
        paymentStatus: z.enum(["pending", "pending_verification", "verified", "rejected", "paid", "failed"]).optional(),
      }))
      .query(async ({ input, ctx }) => {
        // Check if user is admin
        if (!ctx.user || ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }

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
        
        if (input.province) {
          whereConditions.push(eq(registrations.province, input.province));
        }
        
        if (input.paymentStatus) {
          whereConditions.push(eq(registrations.paymentStatus, input.paymentStatus));
        }

        if (whereConditions.length === 0) {
          return await db.select().from(registrations);
        }

        if (whereConditions.length === 1) {
          return await db.select().from(registrations).where(whereConditions[0]);
        }

        return await db.select().from(registrations).where(
          and(...whereConditions)
        );
      }),

    updatePaymentStatus: publicProcedure
      .input(z.object({
        registrationId: z.string(),
        paymentStatus: z.enum(["pending", "pending_verification", "verified", "rejected", "paid", "failed"]),
      }))
      .mutation(async ({ input, ctx }) => {
        // Check if user is admin
        if (!ctx.user || ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }

        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const registrationId = parseInt(input.registrationId, 10);
        if (isNaN(registrationId)) {
          throw new Error("Invalid registration ID");
        }

        const reg = await db
          .select()
          .from(registrations)
          .where(eq(registrations.id, registrationId))
          .limit(1);

        await db.update(registrations)
          .set({
            paymentStatus: input.paymentStatus,
          })
          .where(eq(registrations.id, registrationId));

        try {
          if (reg && reg.length > 0) {
            broadcastPaymentStatusUpdate({
              registrationId: reg[0].id,
              registrationNumber: reg[0].registrationNumber,
              fullName: reg[0].fullName,
              paymentStatus: input.paymentStatus,
              updatedAt: new Date(),
            });
          }
        } catch (error) {
          console.error("Failed to broadcast payment status:", error);
        }

        return {
          success: true,
          message: "Status pembayaran berhasil diupdate",
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
