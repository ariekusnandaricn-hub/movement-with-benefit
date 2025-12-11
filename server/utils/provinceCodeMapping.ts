/**
 * Province Code Mapping (01-38)
 * Digunakan untuk generate invoice ID dengan format: MWB-[KATEGORI].[URUTAN].[KODE_PROVINSI]
 */

export const PROVINCE_CODES: Record<string, string> = {
  "Aceh": "01",
  "Sumatera Utara": "02",
  "Sumatera Barat": "03",
  "Riau": "04",
  "Jambi": "05",
  "Sumatera Selatan": "06",
  "Bengkulu": "07",
  "Lampung": "08",
  "Kepulauan Bangka Belitung": "09",
  "Kepulauan Riau": "10",
  "DKI Jakarta": "11",
  "Jawa Barat": "12",
  "Jawa Tengah": "13",
  "DI Yogyakarta": "14",
  "Jawa Timur": "15",
  "Banten": "16",
  "Bali": "17",
  "Nusa Tenggara Barat": "18",
  "Nusa Tenggara Timur": "19",
  "Kalimantan Barat": "20",
  "Kalimantan Tengah": "21",
  "Kalimantan Selatan": "22",
  "Kalimantan Timur": "23",
  "Kalimantan Utara": "24",
  "Sulawesi Utara": "25",
  "Sulawesi Tengah": "26",
  "Sulawesi Selatan": "27",
  "Sulawesi Tenggara": "28",
  "Gorontalo": "29",
  "Sulawesi Barat": "30",
  "Maluku": "31",
  "Maluku Utara": "32",
  "Papua": "33",
  "Papua Barat": "34",
  "Papua Barat Daya": "35",
  "Papua Selatan": "36",
  "Papua Tengah": "37",
  "Papua Pegunungan": "38",
};

export const CATEGORY_CODES: Record<string, string> = {
  "Acting": "A",
  "Vocal": "V",
  "Model": "M",
};

/**
 * Get province code by province name
 */
export function getProvinceCode(province: string): string | null {
  return PROVINCE_CODES[province] || null;
}

/**
 * Get category code by category name
 */
export function getCategoryCode(category: string): string | null {
  return CATEGORY_CODES[category] || null;
}

/**
 * Generate invoice ID with format: MWB-[KATEGORI].[URUTAN].[KODE_PROVINSI]
 * Example: MWB-V.250.0111 (Vocal, urutan 01, Jakarta)
 */
export function generateInvoiceId(
  category: string,
  sequenceNumber: number,
  province: string
): string {
  const categoryCode = getCategoryCode(category);
  const provinceCode = getProvinceCode(province);

  if (!categoryCode || !provinceCode) {
    throw new Error(`Invalid category or province: ${category}, ${province}`);
  }

  const paddedSequence = String(sequenceNumber).padStart(2, "0");
  return `MWB-${categoryCode}.250.${paddedSequence}${provinceCode}`;
}

/**
 * Generate payment amount from invoice ID
 * Example: MWB-V.250.0111 -> 250010111
 */
export function generatePaymentAmount(invoiceId: string): number {
  // Format: MWB-V.250.0111
  // Extract using regex: MWB-[CATEGORY].[BASE].[SEQUENCE+PROVINCE]
  const match = invoiceId.match(/MWB-[A-Z]\.(250)\.(\d{4})/);
  if (!match) {
    throw new Error("Invalid invoice ID format");
  }

  const baseAmount = match[1]; // "250"
  const sequenceAndProvince = match[2]; // "0111"

  // Combine: 250 + 01 + 11 = 250010111
  const sequenceNumber = sequenceAndProvince.substring(0, 2); // "01"
  const provinceCode = sequenceAndProvince.substring(2); // "11"

  return parseInt(`${baseAmount}${sequenceNumber}${provinceCode}`, 10);
}

/**
 * Get all province names
 */
export function getAllProvinces(): string[] {
  return Object.keys(PROVINCE_CODES);
}
