/**
 * Email Notification Service
 * Mengirim email notifikasi kepada peserta setelah verifikasi pembayaran admin
 */

import nodemailer from "nodemailer";

// Email configuration
const emailConfig = {
  from: "info@movementwithbenefit.id",
  service: "gmail", // Menggunakan Gmail SMTP
  auth: {
    user: process.env.EMAIL_USER || "info@movementwithbenefit.id",
    pass: process.env.EMAIL_PASSWORD || "",
  },
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

/**
 * Generate email HTML template untuk notifikasi verifikasi pembayaran
 */
export function generatePaymentVerificationEmailTemplate(
  participantName: string,
  category: string,
  invoiceId: string,
  participantNumber: string
): string {
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
          
          <div class="important-text">
            ⚠️ <strong>Penting:</strong> Pembayaran harus dikonfirmasi dalam maksimal 1x24 jam. Jika pembayaran tidak dikonfirmasi, registrasi Anda akan dibatalkan.
          </div>
          
          <p style="line-height: 1.6; margin-top: 20px;">
            Terima kasih telah menjadi bagian dari Movement with Benefit 2026. Kami menantikan penampilan terbaik Anda di babak penyisihan!
          </p>
          
          <p style="margin-top: 30px; color: #888;">
            Salam,<br>
            <strong>Tim Movement with Benefit</strong>
          </p>
        </div>
        
        <div class="footer">
          <div class="contact-info">
            📧 info@movementwithbenefit.id<br>
            📱 082315660007<br>
            <a href="https://movementwithbenefit.manus.space">www.movementwithbenefit.id</a>
          </div>
          <p style="margin-top: 15px;">
            © 2026 Movement with Benefit. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send payment verification email
 */
export async function sendPaymentVerificationEmail(
  recipientEmail: string,
  participantName: string,
  category: string,
  invoiceId: string,
  participantNumber: string
): Promise<boolean> {
  try {
    const htmlContent = generatePaymentVerificationEmailTemplate(
      participantName,
      category,
      invoiceId,
      participantNumber
    );

    const mailOptions = {
      from: emailConfig.from,
      to: recipientEmail,
      subject: `Selamat! Anda Terdaftar di Movement with Benefit 2026 - ${category}`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email berhasil dikirim ke ${recipientEmail}`);
    return true;
  } catch (error) {
    console.error("Gagal mengirim email:", error);
    return false;
  }
}

/**
 * Send payment reminder email (24 jam deadline)
 */
export async function sendPaymentReminderEmail(
  recipientEmail: string,
  participantName: string,
  invoiceId: string
): Promise<boolean> {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Inter', Arial, sans-serif; background-color: #0f1419; color: #e0e0e0; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1f2e 0%, #16213e 100%); border: 1px solid rgba(255, 0, 110, 0.3); border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(90deg, #ff006e 0%, #00d9ff 100%); padding: 30px 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .warning { background: rgba(255, 190, 11, 0.1); border-left: 4px solid #ffbe0b; padding: 15px; margin: 20px 0; border-radius: 4px; color: #ffbe0b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div style="font-size: 24px; font-weight: bold; color: white;">⏰ REMINDER PEMBAYARAN</div>
          </div>
          <div class="content">
            <p>Halo ${participantName},</p>
            <div class="warning">
              <strong>⚠️ PENTING:</strong> Waktu pembayaran Anda akan segera berakhir dalam 24 jam!<br>
              Invoice ID: <strong>${invoiceId}</strong>
            </div>
            <p>Jika pembayaran tidak dikonfirmasi dalam waktu yang ditentukan, registrasi Anda akan dibatalkan.</p>
            <p>Hubungi kami jika ada pertanyaan: info@movementwithbenefit.id</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: emailConfig.from,
      to: recipientEmail,
      subject: `⏰ REMINDER: Deadline Pembayaran Movement with Benefit 2026 - ${invoiceId}`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email reminder berhasil dikirim ke ${recipientEmail}`);
    return true;
  } catch (error) {
    console.error("Gagal mengirim email reminder:", error);
    return false;
  }
}
