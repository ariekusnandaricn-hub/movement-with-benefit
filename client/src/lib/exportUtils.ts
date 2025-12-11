import * as XLSX from "xlsx";

export interface PaymentRecord {
  registrationNumber: string;
  fullName: string;
  email: string;
  whatsappNumber: string;
  category: string;
  province: string;
  invoiceId: string;
  invoiceAmount: number;
  paymentStatus: string;
  createdAt?: string;
}

/**
 * Export payment data to CSV format
 */
export function exportToCSV(data: PaymentRecord[], filename: string = "payment-report.csv") {
  const headers = [
    "Nomor Registrasi",
    "Nama Lengkap",
    "Email",
    "WhatsApp",
    "Kategori",
    "Provinsi",
    "Invoice ID",
    "Jumlah Pembayaran",
    "Status Pembayaran",
    "Tanggal Daftar",
  ];

  const rows = data.map((record) => [
    record.registrationNumber,
    record.fullName,
    record.email,
    record.whatsappNumber,
    record.category,
    record.province,
    record.invoiceId,
    `Rp ${record.invoiceAmount.toLocaleString("id-ID")}`,
    getStatusLabel(record.paymentStatus),
    record.createdAt ? new Date(record.createdAt).toLocaleDateString("id-ID") : "-",
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  // Add BOM for proper UTF-8 encoding in Excel
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

  downloadFile(blob, filename);
}

/**
 * Export payment data to Excel format
 */
export function exportToExcel(data: PaymentRecord[], filename: string = "payment-report.xlsx") {
  const headers = [
    "Nomor Registrasi",
    "Nama Lengkap",
    "Email",
    "WhatsApp",
    "Kategori",
    "Provinsi",
    "Invoice ID",
    "Jumlah Pembayaran",
    "Status Pembayaran",
    "Tanggal Daftar",
  ];

  const rows = data.map((record) => [
    record.registrationNumber,
    record.fullName,
    record.email,
    record.whatsappNumber,
    record.category,
    record.province,
    record.invoiceId,
    record.invoiceAmount,
    getStatusLabel(record.paymentStatus),
    record.createdAt ? new Date(record.createdAt).toLocaleDateString("id-ID") : "-",
  ]);

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Set column widths
  const columnWidths = [15, 20, 25, 15, 12, 15, 18, 18, 18, 15];
  worksheet["!cols"] = columnWidths.map((width) => ({ wch: width }));

  // Add header styling
  const headerStyle = {
    fill: { fgColor: { rgb: "FF1F77D1" } }, // Blue background
    font: { bold: true, color: { rgb: "FFFFFFFF" } }, // White text
    alignment: { horizontal: "center", vertical: "center" },
  };

  // Apply header style
  for (let i = 0; i < headers.length; i++) {
    const cellAddress = XLSX.utils.encode_col(i) + "1";
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = headerStyle;
    }
  }

  // Add alternating row colors
  const rowStyle = {
    fill: { fgColor: { rgb: "FFF0F0F0" } }, // Light gray
  };

  for (let i = 2; i <= rows.length + 1; i++) {
    if (i % 2 === 0) {
      for (let j = 0; j < headers.length; j++) {
        const cellAddress = XLSX.utils.encode_col(j) + i;
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = rowStyle;
        }
      }
    }
  }

  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Pembayaran");

  // Add metadata
  workbook.Props = {
    Title: "Laporan Pembayaran MWB 2026",
    Author: "Movement with Benefit",
    CreatedDate: new Date(),
  };

  // Write file
  XLSX.writeFile(workbook, filename);
}

/**
 * Export summary statistics to Excel
 */
export function exportSummaryToExcel(data: PaymentRecord[], filename: string = "payment-summary.xlsx") {
  const totalRecords = data.length;
  const totalAmount = data.reduce((sum, record) => sum + record.invoiceAmount, 0);
  const verifiedCount = data.filter((r) => r.paymentStatus === "verified").length;
  const pendingCount = data.filter((r) => r.paymentStatus === "pending_verification").length;
  const rejectedCount = data.filter((r) => r.paymentStatus === "rejected").length;

  // Category breakdown
  const categoryBreakdown: Record<string, number> = {};
  data.forEach((record) => {
    categoryBreakdown[record.category] = (categoryBreakdown[record.category] || 0) + 1;
  });

  // Province breakdown
  const provinceBreakdown: Record<string, number> = {};
  data.forEach((record) => {
    provinceBreakdown[record.province] = (provinceBreakdown[record.province] || 0) + 1;
  });

  // Create summary sheet
  const summaryData = [
    ["RINGKASAN LAPORAN PEMBAYARAN MWB 2026"],
    [],
    ["Statistik Umum"],
    ["Total Registrasi", totalRecords],
    ["Total Pembayaran", `Rp ${totalAmount.toLocaleString("id-ID")}`],
    [],
    ["Status Pembayaran"],
    ["Verified", verifiedCount],
    ["Pending", pendingCount],
    ["Rejected", rejectedCount],
    [],
    ["Breakdown per Kategori"],
    ...Object.entries(categoryBreakdown).map(([category, count]) => [category, count]),
    [],
    ["Breakdown per Provinsi"],
    ...Object.entries(provinceBreakdown).map(([province, count]) => [province, count]),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(summaryData);
  worksheet["!cols"] = [{ wch: 30 }, { wch: 20 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Ringkasan");

  XLSX.writeFile(workbook, filename);
}

/**
 * Download file helper
 */
function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Get status label in Indonesian
 */
function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    pending_verification: "Pending Verifikasi",
    verified: "Verified",
    rejected: "Ditolak",
  };
  return statusMap[status] || status;
}

/**
 * Format date for filename
 */
export function getFormattedDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}_${hours}-${minutes}`;
}
