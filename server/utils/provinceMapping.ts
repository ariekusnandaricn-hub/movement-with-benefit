/**
 * Province mapping with unique codes (001-038)
 * Used for generating contestant numbers: [Province Code]-[Sequential Number]
 */

export const PROVINCE_CODES: Record<string, string> = {
  "Aceh": "001",
  "Sumatera Utara": "002",
  "Sumatera Barat": "003",
  "Riau": "004",
  "Jambi": "005",
  "Sumatera Selatan": "006",
  "Bengkulu": "007",
  "Lampung": "008",
  "Kepulauan Bangka Belitung": "009",
  "Kepulauan Riau": "010",
  "DKI Jakarta": "011",
  "Jawa Barat": "012",
  "Jawa Tengah": "013",
  "DI Yogyakarta": "014",
  "Jawa Timur": "015",
  "Banten": "016",
  "Bali": "017",
  "Nusa Tenggara Barat": "018",
  "Nusa Tenggara Timur": "019",
  "Kalimantan Barat": "020",
  "Kalimantan Tengah": "021",
  "Kalimantan Selatan": "022",
  "Kalimantan Timur": "023",
  "Kalimantan Utara": "024",
  "Sulawesi Utara": "025",
  "Sulawesi Tengah": "026",
  "Sulawesi Selatan": "027",
  "Sulawesi Tenggara": "028",
  "Gorontalo": "029",
  "Sulawesi Barat": "030",
  "Maluku": "031",
  "Maluku Utara": "032",
  "Papua Barat": "033",
  "Papua": "034",
  "Papua Tengah": "035",
  "Papua Pegunungan": "036",
  "Papua Selatan": "037",
  "Papua Barat Daya": "038",
};

/**
 * Get province code by province name
 */
export function getProvinceCode(provinceName: string): string | null {
  return PROVINCE_CODES[provinceName] || null;
}

/**
 * Get all provinces with their codes
 */
export function getAllProvinces(): Array<{ name: string; code: string }> {
  return Object.entries(PROVINCE_CODES).map(([name, code]) => ({
    name,
    code,
  }));
}
