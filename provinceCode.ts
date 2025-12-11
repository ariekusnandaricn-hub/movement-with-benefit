/**
 * Province code mapping for Indonesia (38 provinces)
 * Used to generate unique invoice IDs
 * Format: 001-038
 */
export const PROVINCE_CODES: Record<string, string> = {
  "Aceh": "001",
  "Sumatera Utara": "002",
  "Sumatera Barat": "003",
  "Riau": "004",
  "Kepulauan Riau": "005",
  "Jambi": "006",
  "Sumatera Selatan": "007",
  "Bangka Belitung": "008",
  "Bengkulu": "009",
  "Lampung": "010",
  "Banten": "011",
  "DKI Jakarta": "012",
  "Jawa Barat": "013",
  "Jawa Tengah": "014",
  "DI Yogyakarta": "015",
  "Jawa Timur": "016",
  "Bali": "017",
  "Nusa Tenggara Barat": "018",
  "Nusa Tenggara Timur": "019",
  "Kalimantan Barat": "020",
  "Kalimantan Tengah": "021",
  "Kalimantan Selatan": "022",
  "Kalimantan Timur": "023",
  "Kalimantan Utara": "024",
  "Sulawesi Utara": "025",
  "Gorontalo": "026",
  "Sulawesi Tengah": "027",
  "Sulawesi Barat": "028",
  "Sulawesi Selatan": "029",
  "Sulawesi Tenggara": "030",
  "Maluku": "031",
  "Maluku Utara": "032",
  "Papua": "033",
  "Papua Barat": "034",
  "Papua Tengah": "035",
  "Papua Pegunungan": "036",
  "Papua Selatan": "037",
  "Papua Barat Daya": "038",
};

/**
 * Get province code by province name
 */
export function getProvinceCode(province: string): string {
  return PROVINCE_CODES[province] || "000";
}

/**
 * Generate unique invoice ID
 * Format: sequenceNumber (3 digits) + provinceCode (3 digits)
 * Example: 001001 (first peserta from Aceh)
 */
export function generateInvoiceId(sequenceNumber: number, province: string): string {
  const seq = String(sequenceNumber).padStart(3, "0");
  const prov = getProvinceCode(province);
  return `${seq}${prov}`;
}

/**
 * Calculate dynamic invoice amount
 * Formula: 250000 + invoiceId (as number)
 * Example: 250000 + 1001 = 251001
 */
export function calculateInvoiceAmount(invoiceId: string): number {
  const idNum = parseInt(invoiceId, 10);
  return 250000 + idNum;
}
