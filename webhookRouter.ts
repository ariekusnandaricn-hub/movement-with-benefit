import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { sendWhatsAppMessage, generateAutoReplyMessage } from "./whatsapp";
import { getRegistrationById, updateRegistrationPaymentStatus } from "./db";
import { sendEmail } from "./email";
import crypto from "crypto";

/**
 * Webhook router untuk handle incoming messages dari Fonnte
 * 
 * Setup webhook di Fonnte dashboard:
 * 1. Login ke https://fonnte.com
 * 2. Go to Settings → Webhook
 * 3. Set webhook URL: https://your-domain.com/api/trpc/webhook.whatsappIncoming
 * 4. Enable webhook untuk incoming messages
 */

export const webhookRouter = router({
  /**
   * Handle incoming WhatsApp messages from Fonnte
   * 
   * Fonnte webhook payload structure:
   * {
   *   "device": "device_id",
   *   "sender": "6281234567890",
   *   "message": "user message text",
   *   "member": "group_member_id", // only for group messages
   *   "name": "Sender Name",
   *   "location": null,
   *   "url": "media_url", // if message contains media
   *   "isGroup": false,
   *   "isOwner": false
   * }
   */
  whatsappIncoming: publicProcedure
    .input(z.object({
      device: z.string().optional(),
      sender: z.string(),
      message: z.string(),
      name: z.string().optional(),
      isGroup: z.boolean().optional(),
      url: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      console.log("[Webhook] Received WhatsApp message:", {
        from: input.sender,
        name: input.name,
        message: input.message.substring(0, 50) + "...",
      });

      // Skip group messages (optional - remove if you want to handle groups)
      if (input.isGroup) {
        console.log("[Webhook] Skipping group message");
        return { success: true, message: "Group messages are not processed" };
      }

      // Skip media messages (optional - handle if needed)
      if (input.url) {
        console.log("[Webhook] Skipping media message");
        return { success: true, message: "Media messages are not processed" };
      }

      // Generate auto-reply based on message content
      const replyMessage = generateAutoReplyMessage(input.message);

      if (!replyMessage) {
        console.log("[Webhook] No auto-reply generated for message");
        return { success: true, message: "No auto-reply needed" };
      }

      // Send auto-reply
      try {
        const result = await sendWhatsAppMessage({
          to: input.sender,
          message: replyMessage,
        });

        if (result.success) {
          console.log("[Webhook] Auto-reply sent successfully to", input.sender);
          return { success: true, message: "Auto-reply sent" };
        } else {
          console.error("[Webhook] Failed to send auto-reply:", result.message);
          return { success: false, message: result.message };
        }
      } catch (error) {
        console.error("[Webhook] Error sending auto-reply:", error);
        return {
          success: false,
          message: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Test endpoint untuk verify webhook connection
   */
  whatsappTest: publicProcedure
    .input(z.object({
      phoneNumber: z.string(),
      message: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const testMessage = input.message || "🧪 Test message dari Movement with Benefit!\n\nJika Anda menerima pesan ini, berarti WhatsApp API sudah terhubung dengan baik.\n\nKetik *menu* untuk melihat daftar bantuan.";

      const result = await sendWhatsAppMessage({
        to: input.phoneNumber,
        message: testMessage,
      });

      return result;
    }),

  /**
   * Handle payment notifications from Saweria
   * 
   * Saweria webhook payload structure:
   * {
   *   "id": "donation_id",
   *   "amount": 250000,
   *   "amount_raw": 250000,
   *   "donator_name": "John Doe",
   *   "donator_email": "john@example.com",
   *   "message": "Pendaftaran Audisi - John Doe - Acting",
   *   "created_at": "2025-01-21T10:30:00Z",
   *   "status": "success"
   * }
   * 
   * Setup webhook di Saweria:
   * 1. Login ke https://saweria.co
   * 2. Go to Settings → Webhook
   * 3. Set webhook URL: https://your-domain.manus.space/api/trpc/webhook.saweriaPayment
   * 4. Set webhook secret untuk signature validation
   */
  saweriaPayment: publicProcedure
    .input(z.object({
      id: z.string(),
      amount: z.number(),
      amount_raw: z.number().optional(),
      donator_name: z.string().optional(),
      donator_email: z.string().optional(),
      message: z.string(),
      created_at: z.string(),
      status: z.string(),
      // Saweria signature for validation
      signature: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      console.log("[Webhook] Received Saweria payment notification:", {
        id: input.id,
        amount: input.amount,
        message: input.message,
        status: input.status,
      });

      // Validate webhook signature (if configured)
      const webhookSecret = process.env.SAWERIA_WEBHOOK_SECRET;
      if (webhookSecret && input.signature) {
        const payload = JSON.stringify({
          id: input.id,
          amount: input.amount,
          message: input.message,
          created_at: input.created_at,
        });
        const expectedSignature = crypto
          .createHmac("sha256", webhookSecret)
          .update(payload)
          .digest("hex");

        if (input.signature !== expectedSignature) {
          console.error("[Webhook] Invalid Saweria signature");
          return { success: false, message: "Invalid signature" };
        }
      }

      // Only process successful payments
      if (input.status !== "success") {
        console.log("[Webhook] Payment status not success:", input.status);
        return { success: true, message: "Payment not successful" };
      }

      // Validate amount (should be 250000)
      if (input.amount < 250000) {
        console.warn("[Webhook] Payment amount less than required:", input.amount);
        return { success: false, message: "Insufficient payment amount" };
      }

      try {
        // Check if this is a voting payment or registration payment
        const isVotingPayment = input.message.match(/Vote untuk (.+) \((.+)\) - (\d+) vote/);
        const isRegistrationPayment = input.message.match(/Pendaftaran Audisi - (.+) - (.+)/);

        if (isVotingPayment) {
          // Handle voting payment
          return await handleVotingPayment(input);
        } else if (isRegistrationPayment) {
          // Handle registration payment
          return await handleRegistrationPayment(input);
        } else {
          console.error("[Webhook] Unknown payment type:", input.message);
          return { success: false, message: "Unknown payment type" };
        }
      } catch (error) {
        console.error("[Webhook] Error processing Saweria payment:", error);
        return {
          success: false,
          message: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),
});

/**
 * Handle voting payment from Saweria
 */
async function handleVotingPayment(input: any) {
  const { createVote, getContestantById, updateContestantVoteCount, generateReceiptNumber } = await import("./db");
  
  // Parse voting info from message
  // Expected format: "Vote untuk [Name] ([Number]) - [X] vote(s)"
  const match = input.message.match(/Vote untuk (.+) \((.+)\) - (\d+) vote/);
  if (!match) {
    console.error("[Webhook] Cannot parse voting info from message:", input.message);
    return { success: false, message: "Invalid voting message format" };
  }

  const [, contestantName, contestantNumber, voteQuantityStr] = match;
  const voteQuantity = parseInt(voteQuantityStr);

  // Find contestant by number
  const db = await import("./db").then(m => m.getDb());
  if (!db) {
    console.error("[Webhook] Database not available");
    return { success: false, message: "Database error" };
  }

  const { contestants } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  const results = await db
    .select()
    .from(contestants)
    .where(eq(contestants.contestantNumber, contestantNumber.trim()))
    .limit(1);

  if (results.length === 0) {
    console.error("[Webhook] Contestant not found:", contestantNumber);
    return { success: false, message: "Contestant not found" };
  }

  const contestant = results[0];

  // Generate receipt number
  const receiptNumber = await generateReceiptNumber();

  // Create vote record
  await createVote({
    receiptNumber,
    contestantId: contestant.id,
    voterName: input.donator_name || null,
    voterEmail: input.donator_email || null,
    amount: input.amount,
    voteQuantity,
    saweriaTransactionId: input.id,
    paymentStatus: "paid",
    message: input.message,
  });

  // Update contestant vote count
  await updateContestantVoteCount(contestant.id, voteQuantity);

  console.log("[Webhook] Vote recorded for contestant:", contestant.name, "Votes:", voteQuantity, "Receipt:", receiptNumber);

  return {
    success: true,
    message: "Vote recorded successfully",
    contestantName: contestant.name,
    voteQuantity,
    receiptNumber,
  };
}

/**
 * Handle registration payment from Saweria
 */
async function handleRegistrationPayment(input: any) {
  const { updateRegistrationPaymentStatus } = await import("./db");
  const { sendEmail } = await import("./email");
  const { sendWhatsAppMessage } = await import("./whatsapp");
  
  // Validate amount (should be 250000)
  if (input.amount < 250000) {
    console.warn("[Webhook] Payment amount less than required:", input.amount);
    return { success: false, message: "Insufficient payment amount" };
  }

  // Extract registration info from message
  // Expected format: "Pendaftaran Audisi - [Name] - [Category] - Invoice: [invoiceId]"
  const messageMatch = input.message.match(/Pendaftaran Audisi - (.+) - (.+) - Invoice: (\d{6})/);
  
  if (!messageMatch) {
    console.error("[Webhook] Cannot parse registration info from message:", input.message);
    return { success: false, message: "Invalid message format" };
  }

  const [, fullName, category, invoiceId] = messageMatch;

  // Find registration by name and category
  const db = await import("./db").then(m => m.getDb());
  if (!db) {
    console.error("[Webhook] Database not available");
    return { success: false, message: "Database error" };
  }

  const { registrations } = await import("../drizzle/schema");
  const { eq, and } = await import("drizzle-orm");
  
  const results = await db
    .select()
    .from(registrations)
    .where(
      and(
        eq(registrations.invoiceId, invoiceId.trim()),
        eq(registrations.paymentStatus, "pending")
      )
    )
    .limit(1);

  if (results.length === 0) {
    console.error("[Webhook] Registration not found for invoice:", invoiceId);
    return { success: false, message: "Registration not found" };
  }

  const registration = results[0];

  // Update payment status
  await updateRegistrationPaymentStatus(
    registration.id,
    "paid",
    input.id
  );

  console.log("[Webhook] Payment status updated for registration:", registration.registrationNumber);

  // Send payment confirmation email
  if (registration.email) {
    sendEmail({
            to: registration.email,
            subject: `Pembayaran Berhasil - ${registration.registrationNumber}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #FF1493;">✅ Pembayaran Berhasil!</h2>
                <p>Halo <strong>${registration.fullName}</strong>,</p>
                <p>Pembayaran Anda untuk pendaftaran audisi Movement with Benefit telah berhasil dikonfirmasi.</p>
                
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Detail Pembayaran</h3>
                  <p><strong>Nomor Registrasi:</strong> ${registration.registrationNumber}</p>
                  <p><strong>Kategori:</strong> ${registration.category}</p>
                  <p><strong>Provinsi:</strong> ${registration.province}</p>
                  <p><strong>Jumlah:</strong> Rp ${input.amount.toLocaleString('id-ID')}</p>
                  <p><strong>ID Transaksi:</strong> ${input.id}</p>
                  <p><strong>Status:</strong> <span style="color: #10B981;">LUNAS</span></p>
                </div>

                <p>Pendaftaran Anda telah dikonfirmasi. Kami akan menghubungi Anda lebih lanjut mengenai jadwal dan lokasi audisi regional di provinsi Anda.</p>

                <p><strong>Timeline Audisi:</strong></p>
                <ul>
                  <li>Audisi Regional: Des 2025 - Jan 2026</li>
                  <li>Semi Final: Feb 2026 - Jakarta</li>
                  <li>Grand Final: 07 Feb 2026 - Jakarta</li>
                </ul>

                <p>Jika ada pertanyaan, hubungi kami:</p>
                <p>
                  📞 WhatsApp: 082315660007<br>
                  📧 Email: info@movementwithbenefit.id
                </p>

                <p>Terima kasih dan semoga sukses!</p>
                <p><strong>Tim Movement with Benefit</strong></p>
              </div>
            `,
          }).catch(error => {
            console.error("[Webhook] Failed to send payment confirmation email:", error);
          });
        }

        // Send payment confirmation WhatsApp
        if (registration.whatsappNumber) {
          sendWhatsAppMessage({
            to: registration.whatsappNumber,
            message: `✅ *PEMBAYARAN BERHASIL!*
*Movement with Benefit - Audisi Nasional*

Halo *${registration.fullName}*! 🎉

Pembayaran Anda telah berhasil dikonfirmasi!

📋 *Detail Pembayaran:*
• Nomor Registrasi: *${registration.registrationNumber}*
• Kategori: *${registration.category}*
• Provinsi: *${registration.province}*
• Jumlah: *Rp ${input.amount.toLocaleString('id-ID')}*
• ID Transaksi: ${input.id}
• Status: *LUNAS* ✅

🎭 *Pendaftaran Anda Telah Dikonfirmasi!*

Kami akan menghubungi Anda lebih lanjut mengenai:
• Jadwal audisi regional di provinsi Anda
• Lokasi dan waktu audisi
• Persyaratan yang perlu disiapkan

📅 *Timeline Audisi:*
• Audisi Regional: Des 2025 - Jan 2026
• Semi Final: Feb 2026 - Jakarta
• Grand Final: 07 Feb 2026 - Jakarta

📞 *Butuh Bantuan?*
WhatsApp: 082315660007
Email: info@movementwithbenefit.id

Terima kasih dan semoga sukses! 🌟

---
*Movement with Benefit*
_Discover Your Talent, Inspire the Nation_`,
          }).catch(error => {
            console.error("[Webhook] Failed to send payment confirmation WhatsApp:", error);
          });
        }

  return {
    success: true,
    message: "Payment processed successfully",
    registrationNumber: registration.registrationNumber,
  };
}
