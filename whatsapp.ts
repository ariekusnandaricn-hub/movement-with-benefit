/**
 * WhatsApp notification helper
 * 
 * SETUP REQUIRED:
 * 1. Sign up at https://fonnte.com (popular WhatsApp API for Indonesia)
 * 2. Get API key from dashboard
 * 3. Add FONNTE_API_KEY to environment variables
 * 4. Verify phone number for sending
 * 
 * Alternative services:
 * - Twilio: https://www.twilio.com
 * - MessageBird: https://www.messagebird.com
 * - Manus Forge API (if WhatsApp endpoint becomes available)
 */

interface SendWhatsAppParams {
  to: string;
  message: string;
  isGroup?: boolean;
}

interface SendWhatsAppResponse {
  success: boolean;
  status?: string;
  message?: string;
  detail?: string;
  messageId?: string;
}

/**
 * Send WhatsApp message
 * @param params WhatsApp parameters
 * @returns Promise with success status
 * 
 * NOTE: Currently returns mock response
 * TODO: Integrate with Fonnte API when credentials are available
 */
export async function sendWhatsAppMessage(
  params: SendWhatsAppParams
): Promise<SendWhatsAppResponse> {
  try {
    // Normalize phone number to include country code
    let phoneNumber = params.to.trim();
    
    // Remove leading 0 and add +62 if needed
    if (phoneNumber.startsWith("0")) {
      phoneNumber = "+62" + phoneNumber.substring(1);
    } else if (phoneNumber.startsWith("62")) {
      phoneNumber = "+" + phoneNumber;
    } else if (!phoneNumber.startsWith("+")) {
      phoneNumber = "+62" + phoneNumber;
    }
    
    console.log("[WhatsApp] Would send message to:", phoneNumber);
    console.log("[WhatsApp] Setup required: Add FONNTE_API_KEY environment variable");
    console.log("[WhatsApp] See documentation for Fonnte integration setup");
    
    // Return success to not block registration
    return { 
      success: true, 
      status: "queued",
      messageId: "mock-" + Date.now(),
      message: "WhatsApp service not configured - see setup documentation"
    };
  } catch (error) {
    console.error("[WhatsApp] Error sending WhatsApp message:", error);
    return { 
      success: false, 
      message: "Error sending WhatsApp message",
      detail: String(error)
    };
  }
}

/**
 * Generate registration confirmation WhatsApp message
 */
export function generateRegistrationWhatsAppMessage(params: {
  name: string;
  registrationNumber: string;
  category: string;
  province: string;
  saweriaLink?: string;
  invoiceId?: string;
  invoiceAmount?: number;
}): string {
  const amount = params.invoiceAmount || 250000;
  return `*KONFIRMASI PENDAFTARAN*

Halo *${params.name}*! 👋

Terima kasih telah mendaftar di Movement with Benefit - Audisi! 🎉

📋 *Detail Pendaftaran:*
• Nomor Registrasi: *${params.registrationNumber}*
• Kategori: *${params.category}*
• Provinsi: *${params.province}*
• Invoice ID: ${params.invoiceId || "-"}

💰 *Pembayaran:*
Silakan transfer *Rp 250.000* ke:
Bank DKI Jakarta
No. Rek: 4370800102
Atas Nama: PT PANDAWA KREASINDO ORGANIZER

Link Pembayaran Saweria:
${params.saweriaLink}

⚠️ *PENTING:*
Batas pembayaran: 2x24 jam dari sekarang

📅 *Timeline Audisi:*
• Pendaftaran Online: Sampai 31 Jan 2026
• Audisi Regional: Feb - Mar 2026
• Semi Final: Maret 2026
• Grand Final: April 2026
• 07 Feb 2026: Pengumuman hasil audisi

📞 *Hubungi Kami:*
WhatsApp: 082315660007
Email: info@movementwithbenefit.id

Terima kasih! 🙏`;
}

/**
 * Generate admin payment notification WhatsApp message
 */
export function generateAdminPaymentNotificationWhatsApp(params: {
  pesertaName: string;
  pesertaPhone: string;
  invoiceId: string;
  amount: number;
  category: string;
  province: string;
}): string {
  return `🔔 Pembayaran Baru!

Peserta: ${params.pesertaName}
WhatsApp: ${params.pesertaPhone}
Invoice: ${params.invoiceId}
Kategori: ${params.category}
Provinsi: ${params.province}
Jumlah: Rp ${params.amount.toLocaleString("id-ID")}

Status: ⏳ Menunggu Verifikasi

Silakan verifikasi bukti pembayaran di admin dashboard.`;
}

/**
 * Generate auto-reply WhatsApp message for customer support
 * Supports flexible keyword matching for natural language queries
 */
export function generateAutoReplyMessage(keyword: string): string {
  const normalizedKeyword = keyword.toLowerCase().trim();
  
  // Keyword mapping for flexible matching
  const keywordMap: Record<string, string> = {
    daftar: "daftar",
    registrasi: "daftar",
    cara: "daftar",
    biaya: "biaya",
    harga: "biaya",
    bayar: "biaya",
    kategori: "kategori",
    audisi: "kategori",
    jenis: "kategori",
    syarat: "syarat",
    persyaratan: "syarat",
    umur: "syarat",
    ketentuan: "syarat",
    timeline: "timeline",
    jadwal: "timeline",
    kapan: "timeline",
    hadiah: "hadiah",
    juara: "hadiah",
    pemenang: "hadiah",
    prize: "hadiah",
    kontak: "kontak",
    hubungi: "kontak",
    cs: "kontak",
    menu: "menu",
  };
  
  // Find matching keyword
  let matchedKey = keywordMap[normalizedKeyword];
  
  // If no exact match, try to find partial matches
  // Sort by key length (longest first) to prioritize more specific keywords
  if (!matchedKey) {
    const sortedKeys = Object.keys(keywordMap).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
      if (normalizedKeyword.includes(key)) {
        matchedKey = keywordMap[key];
        break;
      }
    }
  }
  
  const responses: Record<string, string> = {
    menu: `*MENU BANTUAN* 📋

Ketik salah satu keyword di bawah untuk info lebih lanjut:

🎭 *daftar* - Cara mendaftar audisi
💰 *biaya* - Informasi biaya pendaftaran
📂 *kategori* - Daftar kategori audisi
📋 *syarat* - Syarat dan ketentuan
📅 *jadwal* - Jadwal audisi
🏆 *hadiah* - Informasi hadiah
📞 *kontak* - Hubungi kami

Atau langsung hubungi kami 📱: 082315660007`,

    biaya: `💰 *BIAYA PENDAFTARAN*

Biaya pendaftaran: *Rp 250.000*

Transfer ke:
🏦 Bank: Bank DKI Jakarta
🔢 No. Rek: 4370800102
👤 Atas Nama: PT PANDAWA KREASINDO ORGANIZER

Link Pembayaran Saweria:
https://saweria.co/movementwithbenefit

⏰ Batas pembayaran: 2x24 jam setelah mendaftar

Setelah transfer, tim kami akan verifikasi dalam 2x24 jam.`,

    kategori: `📂 *KATEGORI AUDISI*

Ada 3 kategori audisi yang bisa Anda pilih:

🎭 *Acting* - Untuk aktor/aktris
🎤 *Vocal* - Untuk penyanyi
📸 *Model* - Untuk model

Pilih kategori sesuai dengan bakat Anda saat mendaftar!

Daftar sekarang: https://audisi.movementwithbenefit.id`,

    syarat: `📋 *SYARAT PENDAFTARAN*

✅ Persyaratan Peserta:
• Warga Negara Indonesia
• Berusia minimal 16 tahun
• Belum pernah menang di audisi sejenis
• Bersedia mengikuti seluruh proses audisi
• Berasal dari 38 provinsi di Indonesia

📄 Dokumen yang Diperlukan:
• Foto terbaru (JPG/PNG, Max 5MB)
• KTP/NIK (16 digit)
• Untuk peserta di bawah 17 tahun: Surat izin orang tua

💳 Biaya Pendaftaran:
• Rp 250.000 (tidak dapat dikembalikan)

Untuk info lebih lanjut, hubungi: 082315660007`,

    timeline: `📅 *TIMELINE AUDISI*

📝 Pendaftaran Online:
• Dibuka: Sekarang
• Ditutup: 31 Januari 2026

🎤 Audisi Regional:
• Februari - Maret 2026
• Di 38 Provinsi Indonesia

🏅 Semi Final:
• Maret 2026

🏆 Grand Final:
• April 2026

📢 Pengumuman Hasil:
• 7 Februari 2026

Jangan lewatkan kesempatan ini! Daftar sekarang!`,

    hadiah: `🏆 *HADIAH PEMENANG*

💰 Total Prize Pool: Rp 500 Juta+

🥇 Juara 1:
• Uang tunai Rp 200 Juta
• Kontrak talent management 1 Tahun

🥈 Juara 2:
• Uang tunai Rp 150 Juta
• Kontrak talent management 6 Bulan

🥉 Juara 3:
• Uang tunai Rp 100 Juta
• Kontrak talent management 3 Bulan

Plus berbagai hadiah menarik lainnya!

Daftar sekarang dan tunjukkan bakat Anda!`,

    daftar: `🎭 *CARA PENDAFTARAN*

Langkah-langkah mendaftar di movementwithbenefit.id:

1️⃣ Kunjungi website: https://audisi.movementwithbenefit.id
2️⃣ Klik tombol "Daftar Sekarang"
3️⃣ Isi form dengan data lengkap
4️⃣ Upload foto terbaru (JPG/PNG)
5️⃣ Upload KTP/NIK
6️⃣ Lakukan pembayaran Rp 250.000
7️⃣ Tunggu konfirmasi dari tim kami

⏰ Batas pendaftaran: 31 Januari 2026

Butuh bantuan? Hubungi: 082315660007`,

    kontak: `📞 *HUBUNGI KAMI*

Untuk pertanyaan dan informasi lebih lanjut:

📱 WhatsApp: 082315660007
📧 Email: info@movementwithbenefit.id
🌐 Website: https://audisi.movementwithbenefit.id

⏰ Jam Operasional:
Senin - Jumat: 09:00 - 17:00 WIB
Sabtu: 10:00 - 16:00 WIB

Tim kami siap membantu Anda! 😊`,
  };

  return responses[matchedKey || normalizedKeyword] || `Maaf, keyword tidak dikenali. 

Kami adalah asisten otomatis Movement with Benefit. 

Silakan ketik *menu* untuk melihat daftar keyword yang tersedia, atau kunjungi https://audisi.movementwithbenefit.id`;
}
