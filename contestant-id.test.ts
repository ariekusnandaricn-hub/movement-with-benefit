import { describe, it, expect } from "vitest";
import { generateContestantNumber, generateRegistrationReceiptNumber } from "./db";
import { getProvinceCode } from "../shared/provinceMapping";

describe("Contestant Number Generation", () => {
  it("should generate contestant number with correct format", async () => {
    const contestantNumber = await generateContestantNumber("DKI Jakarta");
    
    expect(contestantNumber).toBeDefined();
    expect(contestantNumber).toMatch(/^\d{3}-\d{3}$/); // Format: XXX-XXX
  });

  it("should use correct province code for DKI Jakarta", async () => {
    const contestantNumber = await generateContestantNumber("DKI Jakarta");
    
    expect(contestantNumber).toContain("011-"); // DKI Jakarta code is 011
  });

  it("should use correct province code for Jawa Barat", async () => {
    const contestantNumber = await generateContestantNumber("Jawa Barat");
    
    expect(contestantNumber).toContain("012-"); // Jawa Barat code is 012
  });

  it("should increment sequential number for same province", async () => {
    const number1 = await generateContestantNumber("Bali");
    const number2 = await generateContestantNumber("Bali");
    
    // Extract sequential numbers
    const seq1 = parseInt(number1.split("-")[1]);
    const seq2 = parseInt(number2.split("-")[1]);
    
    // Second number should be greater than first
    expect(seq2).toBeGreaterThan(seq1);
  });

  it("should throw error for invalid province", async () => {
    await expect(generateContestantNumber("Invalid Province")).rejects.toThrow();
  });

  it("should pad sequential number with zeros", async () => {
    const contestantNumber = await generateContestantNumber("Papua");
    
    // Sequential number should be 3 digits
    const seqNumber = contestantNumber.split("-")[1];
    expect(seqNumber.length).toBe(3);
  });
});

describe("Province Code Mapping", () => {
  it("should return correct code for all 38 provinces", () => {
    expect(getProvinceCode("Aceh")).toBe("001");
    expect(getProvinceCode("Sumatera Utara")).toBe("002");
    expect(getProvinceCode("DKI Jakarta")).toBe("011");
    expect(getProvinceCode("Jawa Barat")).toBe("012");
    expect(getProvinceCode("Bali")).toBe("017");
    expect(getProvinceCode("Papua")).toBe("034");
    expect(getProvinceCode("Papua Barat Daya")).toBe("038");
  });

  it("should return null for invalid province", () => {
    expect(getProvinceCode("Invalid Province")).toBeNull();
  });

  it("should be case-sensitive", () => {
    expect(getProvinceCode("dki jakarta")).toBeNull(); // lowercase
    expect(getProvinceCode("DKI Jakarta")).toBe("011"); // correct case
  });
});

describe("Registration Receipt Number Generation", () => {
  it("should generate receipt number with correct format", async () => {
    const receiptNumber = await generateRegistrationReceiptNumber();
    
    expect(receiptNumber).toBeDefined();
    expect(receiptNumber).toMatch(/^250\.\d{3}$/); // Format: 250.XXX
  });

  it("should start with 250 prefix", async () => {
    const receiptNumber = await generateRegistrationReceiptNumber();
    
    expect(receiptNumber).toContain("250.");
  });

  it("should increment sequential number", async () => {
    const receipt1 = await generateRegistrationReceiptNumber();
    const receipt2 = await generateRegistrationReceiptNumber();
    
    // Extract sequential numbers
    const seq1 = parseInt(receipt1.split(".")[1]);
    const seq2 = parseInt(receipt2.split(".")[1]);
    
    // Second number should be greater than first
    expect(seq2).toBeGreaterThan(seq1);
  });

  it("should pad sequential number with zeros", async () => {
    const receiptNumber = await generateRegistrationReceiptNumber();
    
    // Sequential number should be 3 digits
    const seqNumber = receiptNumber.split(".")[1];
    expect(seqNumber.length).toBe(3);
  });

  it("should generate unique receipt numbers", async () => {
    const receipts = await Promise.all([
      generateRegistrationReceiptNumber(),
      generateRegistrationReceiptNumber(),
      generateRegistrationReceiptNumber(),
    ]);
    
    // All receipts should be unique
    const uniqueReceipts = new Set(receipts);
    expect(uniqueReceipts.size).toBe(receipts.length);
  });
});
