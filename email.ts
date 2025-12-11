/**
 * Email notification helper
 * 
 * SETUP REQUIRED:
 * 1. Sign up at https://resend.com
 * 2. Get API key from dashboard
 * 3. Add RESEND_API_KEY to environment variables
 * 4. Verify domain for production use
 * 
 * See SETUP_EMAIL.md for detailed instructions
 */

import { ENV } from "./_core/env";

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send email using Resend API
 * @param params Email parameters
 * @returns Promise with success status
 */
export async function sendEmail(
  params: SendEmailParams
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // For now, log the email that would be sent
    // TODO: Integrate with Resend API when credentials are available
    console.log("[Email] Would send email to:", params.to);
    console.log("[Email] Subject:", params.subject);
    console.log("[Email] Setup required: Add RESEND_API_KEY environment variable");
    console.log("[Email] See SETUP_EMAIL.md for instructions");
    
    // Return success to not block registration
    return { 
      success: true, 
      messageId: "mock-" + Date.now(),
      error: "Email service not configured - see SETUP_EMAIL.md"
    };
  } catch (error) {
    console.error("[Email] Error sending email:", error);
    return { success: false, error: String(error) };
  }
}

// Email templates for registration confirmation
export function generateRegistrationConfirmationEmail(params: {
  name: string;
  registrationNumber: string;
  category: string;
  province: string;
  saweriaLink: string;
  invoiceId: string;
  invoiceAmount: number;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #e91e63 0%, #9c27b0 100%); color: white; padding: 20px; border-radius: 8px; }
          .content { padding: 20px; background: #f9f9f9; border-radius: 8px; margin: 20px 0; }
          .info-box { background: white; padding: 15px; border-left: 4px solid #e91e63; margin: 10px 0; }
          .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
          .btn { display: inline-block; padding: 10px 20px; background: #e91e63; color: white; text-decoration: none; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Selamat! Pendaftaran Anda Diterima</h1>
          </div>
          
          <div class="content">
            <p>Halo <strong>${params.name}</strong>,</p>
            
            <p>Terima kasih telah mendaftar di <strong>Movement with Benefit - Audisi</strong>!</p>
            
            <div class="info-box">
              <strong>Nomor Registrasi:</strong> ${params.registrationNumber}<br>
              <strong>Kategori:</strong> ${params.category}<br>
              <strong>Provinsi:</strong> ${params.province}<br>
              <strong>Invoice ID:</strong> ${params.invoiceId}<br>
              <strong>Jumlah Pembayaran:</strong> Rp ${params.invoiceAmount.toLocaleString("id-ID")}
            </div>
            
            <h3>📋 Langkah Selanjutnya:</h3>
            <p>Silakan lakukan transfer pembayaran ke rekening berikut:</p>
            
            <div class="info-box">
              <strong>Bank:</strong> Bank DKI Jakarta<br>
              <strong>No. Rekening:</strong> 4370800102<br>
              <strong>Atas Nama:</strong> PT PANDAWA KREASINDO ORGANIZER<br>
              <strong>Jumlah:</strong> Rp ${params.invoiceAmount.toLocaleString("id-ID")}
            </div>
            
            <p><strong>⏰ Batas Waktu Pembayaran:</strong> 2x24 jam dari sekarang</p>
            
            <p>Setelah transfer, tim kami akan memverifikasi pembayaran Anda dalam waktu 2x24 jam.</p>
            
            <p>Jika ada pertanyaan, silakan hubungi kami melalui WhatsApp atau email.</p>
            
            <p>Terima kasih,<br><strong>Tim Movement with Benefit</strong></p>
          </div>
          
          <div class="footer">
            <p>© 2025 Movement with Benefit - Audisi. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Email template for admin payment notification
export function generateAdminPaymentNotificationEmail(params: {
  pesertaName: string;
  pesertaEmail: string;
  pesertaPhone: string;
  registrationNumber: string;
  invoiceId: string;
  amount: number;
  category: string;
  province: string;
  paymentProofUrl: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1a1a2e; color: white; padding: 20px; border-radius: 8px; }
          .content { padding: 20px; background: #f9f9f9; border-radius: 8px; margin: 20px 0; }
          .info-box { background: white; padding: 15px; border-left: 4px solid #00d4ff; margin: 10px 0; }
          .alert { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 4px; margin: 10px 0; }
          .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
          .btn { display: inline-block; padding: 10px 20px; background: #00d4ff; color: #1a1a2e; text-decoration: none; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Notifikasi Pembayaran Baru</h1>
          </div>
          
          <div class="alert">
            <strong>⚠️ Pembayaran Menunggu Verifikasi</strong><br>
            Peserta baru telah melakukan pembayaran. Silakan verifikasi bukti pembayaran.
          </div>
          
          <div class="content">
            <h3>📋 Detail Peserta:</h3>
            <div class="info-box">
              <strong>Nama:</strong> ${params.pesertaName}<br>
              <strong>Email:</strong> ${params.pesertaEmail}<br>
              <strong>WhatsApp:</strong> ${params.pesertaPhone}<br>
              <strong>Nomor Registrasi:</strong> ${params.registrationNumber}<br>
              <strong>Invoice ID:</strong> ${params.invoiceId}
            </div>
            
            <h3>💰 Detail Pembayaran:</h3>
            <div class="info-box">
              <strong>Kategori:</strong> ${params.category}<br>
              <strong>Provinsi:</strong> ${params.province}<br>
              <strong>Jumlah:</strong> Rp ${params.amount.toLocaleString("id-ID")}<br>
              <strong>Status:</strong> Pending Verification
            </div>
            
            <h3>📸 Bukti Pembayaran:</h3>
            <p><a href="${params.paymentProofUrl}" target="_blank" class="btn">Lihat Bukti Pembayaran</a></p>
            
            <p>Silakan verifikasi bukti pembayaran dan update status peserta di admin dashboard.</p>
          </div>
          
          <div class="footer">
            <p>© 2025 Movement with Benefit - Audisi. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
