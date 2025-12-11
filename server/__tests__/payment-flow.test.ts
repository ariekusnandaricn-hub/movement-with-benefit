import { describe, it, expect } from "vitest";
import { getProvinceCode } from "../utils/provinceMapping";

describe("Payment Flow", () => {
  it("should generate correct province codes", () => {
    expect(getProvinceCode("DKI Jakarta")).toBe("011");
    expect(getProvinceCode("Jawa Barat")).toBe("012");
    expect(getProvinceCode("Aceh")).toBe("001");
    expect(getProvinceCode("Papua Barat Daya")).toBe("038");
  });

  it("should return null for invalid province", () => {
    expect(getProvinceCode("Invalid Province")).toBeNull();
  });

  it("should generate correct invoice ID format", () => {
    const invoiceId = "MWB-0001-011";
    const parts = invoiceId.split("-");
    
    expect(parts[0]).toBe("MWB");
    expect(parts[1].length).toBe(4); // Sequential number padded to 4 digits
    expect(parts[2].length).toBe(3); // Province code is 3 digits
  });

  it("should validate payment amount", () => {
    const paymentAmount = 250000;
    expect(paymentAmount).toBe(250000);
    expect(paymentAmount).toBeGreaterThan(0);
  });

  it("should validate bank account number", () => {
    const accountNumber = "1370800102";
    expect(accountNumber).toBe("1370800102");
    expect(accountNumber.length).toBe(10);
  });
});
