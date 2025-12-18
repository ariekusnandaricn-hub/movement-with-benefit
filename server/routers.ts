import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { registrations } from "../drizzle/schema";
import { getDb } from "./db";
import { storagePut } from "./storage";
import { like, eq, and, desc, count } from "drizzle-orm";
import { generateInvoiceId, generatePaymentAmount, getCategoryCode, generateParticipantNumber } from "./utils/provinceCodeMapping";
import { sendPaymentVerificationEmail, sendPaymentReminderEmail } from "./utils/emailNotification";
import { sendPaymentVerificationWhatsApp, sendPaymentReminderWhatsApp } from "./utils/whatsappNotification";
import { sendPaymentVerificationEmailViaResend } from "./utils/resendEmailService";
import { broadcastNewRegistration, broadcastPaymentStatusUpdate } from "./_core/websocket";
import { getParticipantCountFromTidb } from "./tidb-connection";

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
        status: z.enum(["pending", "paid", "failed"]).optional(),
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

        const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

        const results = await db
          .select()
          .from(registrations)
          .where(whereClause)
          .orderBy(desc(registrations.createdAt))
          .limit(100);

        return results;
      }),

    create: publicProcedure
      .input(z.object({
        fullName: z.string(),
        email: z.string().email(),
        whatsappNumber: z.string(),
        address: z.string(),
        birthPlace: z.string(),
        birthDate: z.string(),
        gender: z.enum(["Laki-laki", "Perempuan"]),
        profession: z.string(),
        province: z.string(),
        category: z.enum(["Acting", "Vocal", "Model"]),
        photoUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const registrationNumber = `MWB-${Date.now()}`;
        const invoiceId = generateInvoiceId(input.category, input.province);
        const invoiceAmount = generatePaymentAmount(input.category);
        const participantNumber = generateParticipantNumber(input.category, input.province);

        const result = await db.insert(registrations).values({
          registrationNumber,
          fullName: input.fullName,
          email: input.email,
          whatsappNumber: input.whatsappNumber,
          address: input.address,
          birthPlace: input.birthPlace,
          birthDate: input.birthDate,
          gender: input.gender,
          profession: input.profession,
          province: input.province,
          category: input.category,
          invoiceId,
          invoiceAmount,
          participantNumber,
          paymentStatus: "pending",
          photoLink: input.photoUrl,
        });

        try {
          broadcastNewRegistration({
            registrationNumber,
            fullName: input.fullName,
            category: input.category,
            province: input.province,
            createdAt: new Date(),
          });
        } catch (error) {
          console.error("Failed to broadcast new registration:", error);
        }

        return {
          success: true,
          registrationNumber,
          invoiceId,
          invoiceAmount,
          participantNumber,
        };
      }),
  }),

  admin: router({
    getRegistrations: publicProcedure
      .input(z.object({
        search: z.string().optional(),
        category: z.enum(["Acting", "Vocal", "Model"]).optional(),
        province: z.string().optional(),
        paymentStatus: z.enum(["pending", "paid", "failed"]).optional(),
      }))
      .query(async ({ input }) => {
        // In production, implement proper role-based access control
        if (!input) {
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

        const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

        const results = await db
          .select()
          .from(registrations)
          .where(whereClause)
          .orderBy(desc(registrations.createdAt));

        const totalResult = await db
          .select({ total: count() })
          .from(registrations);

        const paidResult = await db
          .select({ total: count() })
          .from(registrations)
          .where(eq(registrations.paymentStatus, "paid"));

        const pendingResult = await db
          .select({ total: count() })
          .from(registrations)
          .where(eq(registrations.paymentStatus, "pending"));

        const failedResult = await db
          .select({ total: count() })
          .from(registrations)
          .where(eq(registrations.paymentStatus, "failed"));

        return {
          registrations: results,
          stats: {
            total: totalResult[0]?.total || 0,
            paid: paidResult[0]?.total || 0,
            pending: pendingResult[0]?.total || 0,
            failed: failedResult[0]?.total || 0,
          },
        };
      }),

    updatePaymentStatus: publicProcedure
      .input(z.object({
        registrationId: z.string(),
        paymentStatus: z.enum(["pending", "paid", "failed"]),
      }))
      .mutation(async ({ input, ctx }) => {
        // In production, implement proper role-based access control
        if (!ctx.user) {
          throw new Error("Unauthorized - Please login first");
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

  public: router({
    getParticipantCount: publicProcedure.query(async () => {
      try {
        const tidbCount = await getParticipantCountFromTidb();
        return {
          count: typeof tidbCount === 'number' ? tidbCount : parseInt(String(tidbCount), 10),
        };
      } catch (error) {
        console.error("Error fetching from TiDB:", error);
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const result = await db.select({ total: count() }).from(registrations);
        const total = result[0]?.total || 0;
        return {
          count: typeof total === 'number' ? total : parseInt(String(total), 10),
        };
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
