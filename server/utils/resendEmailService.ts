/**
 * Resend Email Service
 * Sends emails using Resend API (https://resend.com)
 */

import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn('⚠️  RESEND_API_KEY is not set. Email notifications will not be sent.');
}

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send email using Resend
 */
export async function sendEmailViaResend(options: EmailOptions): Promise<boolean> {
  try {
    if (!resend) {
      console.error('❌ Resend is not configured. Please set RESEND_API_KEY environment variable.');
      return false;
    }

    const { to, subject, html, from = 'Movement with Benefit <noreply@movementwithbenefit.id>' } = options;

    console.log(`📧 Sending email to ${to}...`);

    const response = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (response.error) {
      console.error(`❌ Failed to send email: ${response.error.message}`);
      return false;
    }

    console.log(`✅ Email sent successfully to ${to}`);
    console.log(`   Email ID: ${response.data?.id}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email via Resend:', error);
    return false;
  }
}

/**
 * Send payment verification email
 */
export async function sendPaymentVerificationEmailViaResend(
  recipientEmail: string,
  participantName: string,
  category: string,
  invoiceId: string,
  participantNumber: string,
  paymentAmount?: number
): Promise<boolean> {
  const htmlContent = generatePaymentVerificationEmailTemplate(
    participantName,
    category,
    invoiceId,
    participantNumber,
    paymentAmount
  );

  return sendEmailViaResend({
    to: recipientEmail,
    subject: `Selamat! Anda Terdaftar di Movement with Benefit 2026 - ${category}`,
    html: htmlContent,
  });
}

/**
 * Generate payment verification email template
 */
function generatePaymentVerificationEmailTemplate(
  participantName: string,
  category: string,
  invoiceId: string,
  participantNumber: string,
  paymentAmount?: number
): string {
  const formattedAmount = paymentAmount
    ? new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(paymentAmount)
    : 'Rp -';

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Inter', Arial, sans-serif;
          background-color: #0f1419;
          color: #e0e0e0;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: linear-gradient(135deg, #1a1f2e 0%, #16213e 100%);
          border: 1px solid rgba(255, 0, 110, 0.3);
          border-radius: 12px;
          overflow: hidden;
        }
        .header {
          background: linear-gradient(90deg, #ff006e 0%, #00d9ff 100%);
          padding: 30px 20px;
          text-align: center;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: white;
          margin-bottom: 10px;
        }
        .content {
          padding: 30px 20px;
        }
        .greeting {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #ff006e;
        }
        .info-box {
          background: rgba(255, 0, 110, 0.1);
          border-left: 4px solid #ff006e;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .info-label {
          font-size: 12px;
          color: #00d9ff;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 5px;
        }
        .info-value {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          font-family: 'Courier New', monospace;
        }
        .category-badge {
          display: inline-block;
          background: linear-gradient(90deg, #ff006e 0%, #00d9ff 100%);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 20px;
        }
        .important-text {
          background: rgba(255, 190, 11, 0.1);
          border-left: 4px solid #ffbe0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
          color: #ffbe0b;
          font-weight: 500;
        }
        .footer {
          background: rgba(0, 0, 0, 0.3);
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #888;
          border-top: 1px solid rgba(255, 0, 110, 0.2);
        }
        .contact-info {
          margin-top: 15px;
          font-size: 13px;
        }
        .contact-info a {
          color: #00d9ff;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🎭 MOVEMENT WITH BENEFIT</div>
          <div style="color: white; font-size: 14px;">Audisi Nasional 2026</div>
        </div>
        
        <div class="content">
          <div class="greeting">Selamat, ${participantName}! 🎉</div>
          
          <p style="line-height: 1.6;">
            Kami dengan bangga mengumumkan bahwa Anda telah berhasil terdaftar sebagai peserta audisi <strong>${category}</strong> di <strong>Movement with Benefit 2026</strong>.
          </p>
          
          <div class="category-badge">${category.toUpperCase()}</div>
          
          <div class="info-box">
            <div class="info-label">📋 Nomor Peserta (Nomor Registrasi Ulang)</div>
            <div class="info-value">${participantNumber}</div>
            <p style="margin-top: 10px; font-size: 12px; color: #aaa;">
              Simpan nomor ini sebagai nomor registrasi ulang ketika babak penyisihan
            </p>
          </div>
          
          <div class="info-box">
            <div class="info-label">💳 Invoice ID</div>
            <div class="info-value">${invoiceId}</div>
          </div>
          
          <div class="info-box">
            <div class="info-label">💰 Jumlah Pembayaran</div>
            <div class="info-value">${formattedAmount}</div>
          </div>
          
          <div class="important-text">
            <strong>⚠️ PENTING:</strong> Pembayaran harus dikonfirmasi dalam maksimal <strong>1x24 jam</strong>. Jika pembayaran tidak dikonfirmasi dalam waktu yang ditentukan, registrasi Anda akan dibatalkan.
          </div>
          
          <p style="line-height: 1.6; color: #ccc;">
            Terima kasih telah menjadi bagian dari Movement with Benefit 2026! Kami tunggu Anda di panggung audisi. 🎭
          </p>
        </div>
        
        <div class="footer">
          <p style="margin: 0;">Movement with Benefit 2026</p>
          <div class="contact-info">
            📧 <a href="mailto:info@movementwithbenefit.id">info@movementwithbenefit.id</a><br>
            📱 <a href="https://wa.me/6282315660007">082315660007</a><br>
            🌐 www.movementwithbenefit.id
          </div>
          <p style="margin-top: 15px; color: #666; font-size: 11px;">
            © 2026 Movement with Benefit. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
