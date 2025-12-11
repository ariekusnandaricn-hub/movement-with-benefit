/**
 * WhatsApp Notification Service
 * Mengirim notifikasi WhatsApp kepada peserta setelah verifikasi pembayaran admin
 * Menggunakan Manus built-in WhatsApp integration
 */

/**
 * Format nomor WhatsApp ke format internasional
 * Contoh: 082315660007 -> 6282315660007
 */
export function formatWhatsAppNumber(phoneNumber: string): string {
  // Remove leading 0 if exists
  let formatted = phoneNumber.replace(/^0/, "");
  // Add country code 62 (Indonesia)
  if (!formatted.startsWith("62")) {
    formatted = "62" + formatted;
  }
  return formatted;
}

/**
 * Generate WhatsApp message untuk notifikasi verifikasi pembayaran
 */
export function generatePaymentVerificationMessage(
  participantName: string,
  category: string,
  invoiceId: string,
  participantNumber: string
): string {
  return `Selamat ${participantName}! 🎉

Anda telah terdaftar sebagai peserta audisi *${category}* di Movement with Benefit 2026.

*Nomor Peserta:* ${participantNumber}
*Invoice ID:* ${invoiceId}

Simpan nomor peserta ini sebagai nomor registrasi ulang ketika babak penyisihan.

⏰ Pembayaran harus dikonfirmasi dalam maksimal 1x24 jam.

Terima kasih telah menjadi bagian dari Movement with Benefit 2026! 🎭

Hubungi kami: info@movementwithbenefit.id
📱 082315660007`;
}

/**
 * Generate WhatsApp message untuk payment reminder
 */
export function generatePaymentReminderMessage(
  participantName: string,
  invoiceId: string
): string {
  return `⏰ REMINDER PEMBAYARAN

Halo ${participantName},

Waktu pembayaran Anda akan segera berakhir dalam 24 jam!

*Invoice ID:* ${invoiceId}

Jika pembayaran tidak dikonfirmasi dalam waktu yang ditentukan, registrasi Anda akan dibatalkan.

Hubungi kami jika ada pertanyaan:
📧 info@movementwithbenefit.id
📱 082315660007`;
}

/**
 * Send WhatsApp notification via Manus API
 * Menggunakan Manus built-in WhatsApp integration
 */
export async function sendWhatsAppNotification(
  phoneNumber: string,
  message: string
): Promise<boolean> {
  try {
    // Format phone number to international format
    const formattedPhone = formatWhatsAppNumber(phoneNumber);

    // Call Manus WhatsApp API
    // Endpoint: POST /api/whatsapp/send
    const response = await fetch(
      `${process.env.MANUS_API_URL || "http://localhost:3000"}/api/whatsapp/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MANUS_API_KEY}`,
        },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          message: message,
        }),
      }
    );

    if (!response.ok) {
      console.error(
        `Gagal mengirim WhatsApp ke ${formattedPhone}:`,
        response.statusText
      );
      return false;
    }

    console.log(`WhatsApp berhasil dikirim ke ${formattedPhone}`);
    return true;
  } catch (error) {
    console.error("Error mengirim WhatsApp notification:", error);
    return false;
  }
}

/**
 * Send payment verification notification via WhatsApp
 */
export async function sendPaymentVerificationWhatsApp(
  phoneNumber: string,
  participantName: string,
  category: string,
  invoiceId: string,
  participantNumber: string
): Promise<boolean> {
  const message = generatePaymentVerificationMessage(
    participantName,
    category,
    invoiceId,
    participantNumber
  );
  return sendWhatsAppNotification(phoneNumber, message);
}

/**
 * Send payment reminder notification via WhatsApp
 */
export async function sendPaymentReminderWhatsApp(
  phoneNumber: string,
  participantName: string,
  invoiceId: string
): Promise<boolean> {
  const message = generatePaymentReminderMessage(participantName, invoiceId);
  return sendWhatsAppNotification(phoneNumber, message);
}
