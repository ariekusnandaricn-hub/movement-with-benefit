import { describe, it, expect } from "vitest";
import {
  generateInvoiceId,
  generatePaymentAmount,
  getProvinceCode,
  getCategoryCode,
  PROVINCE_CODES,
  CATEGORY_CODES,
} from "../utils/provinceCodeMapping";

describe("Invoice ID Generation", () => {
  it("should generate correct invoice ID format: MWB-[KATEGORI].[URUTAN].[KODE_PROVINSI]", () => {
    const invoiceId = generateInvoiceId("Vocal", 1, "DKI Jakarta");
    expect(invoiceId).toBe("MWB-V.250.0111");
  });

  it("should generate correct invoice ID for Acting category", () => {
    const invoiceId = generateInvoiceId("Acting", 1, "Jawa Barat");
    expect(invoiceId).toBe("MWB-A.250.0112");
  });

  it("should generate correct invoice ID for Model category", () => {
    const invoiceId = generateInvoiceId("Model", 2, "Aceh");
    expect(invoiceId).toBe("MWB-M.250.0201");
  });

  it("should pad sequence number to 2 digits", () => {
    const invoiceId = generateInvoiceId("Vocal", 5, "Sumatera Utara");
    expect(invoiceId).toBe("MWB-V.250.0502");
  });

  it("should generate correct payment amount from invoice ID", () => {
    const invoiceId = "MWB-V.250.0111";
    const paymentAmount = generatePaymentAmount(invoiceId);
    expect(paymentAmount).toBe(250010111);
  });

  it("should generate correct payment amount for different provinces", () => {
    const invoiceId = "MWB-A.250.0112";
    const paymentAmount = generatePaymentAmount(invoiceId);
    expect(paymentAmount).toBe(250010112);
  });

  it("should get correct province codes", () => {
    expect(getProvinceCode("DKI Jakarta")).toBe("11");
    expect(getProvinceCode("Aceh")).toBe("01");
    expect(getProvinceCode("Papua Pegunungan")).toBe("38");
  });

  it("should get correct category codes", () => {
    expect(getCategoryCode("Vocal")).toBe("V");
    expect(getCategoryCode("Acting")).toBe("A");
    expect(getCategoryCode("Model")).toBe("M");
  });

  it("should have 38 province codes", () => {
    expect(Object.keys(PROVINCE_CODES).length).toBe(38);
  });

  it("should have 3 category codes", () => {
    expect(Object.keys(CATEGORY_CODES).length).toBe(3);
  });

  it("should throw error for invalid category", () => {
    expect(() => generateInvoiceId("Invalid", 1, "DKI Jakarta")).toThrow();
  });

  it("should throw error for invalid province", () => {
    expect(() => generateInvoiceId("Vocal", 1, "Invalid Province")).toThrow();
  });

  it("should handle sequential numbering correctly", () => {
    const id1 = generateInvoiceId("Vocal", 1, "DKI Jakarta");
    const id2 = generateInvoiceId("Vocal", 2, "DKI Jakarta");
    const id3 = generateInvoiceId("Vocal", 10, "DKI Jakarta");

    expect(id1).toBe("MWB-V.250.0111");
    expect(id2).toBe("MWB-V.250.0211");
    expect(id3).toBe("MWB-V.250.1011");
  });
});
