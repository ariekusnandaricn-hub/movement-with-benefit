import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "../db";
import { registrations } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Admin Payment Verification", () => {
  let db: any;
  const testRegistrations = [
    {
      registrationNumber: "TEST-ADMIN-001",
      fullName: "Admin Test User 1",
      email: "admin1@example.com",
      address: "Test Address 1",
      birthPlace: "Test City 1",
      birthDate: "2000-01-01",
      whatsappNumber: "082315660007",
      gender: "Laki-laki",
      profession: "Student",
      province: "DKI Jakarta",
      category: "Vocal",
      paymentStatus: "pending_verification" as const,
      invoiceId: "MWB-V.250.0111",
      invoiceAmount: 250010111,
    },
    {
      registrationNumber: "TEST-ADMIN-002",
      fullName: "Admin Test User 2",
      email: "admin2@example.com",
      address: "Test Address 2",
      birthPlace: "Test City 2",
      birthDate: "2001-01-01",
      whatsappNumber: "082315660008",
      gender: "Perempuan",
      profession: "Professional",
      province: "Jawa Barat",
      category: "Acting",
      paymentStatus: "pending_verification" as const,
      invoiceId: "MWB-A.250.0112",
      invoiceAmount: 250010112,
    },
  ];

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create test registrations
    for (const reg of testRegistrations) {
      await db.insert(registrations).values(reg);
    }
  });

  afterAll(async () => {
    // Cleanup
    if (db) {
      for (const reg of testRegistrations) {
        await db
          .delete(registrations)
          .where(eq(registrations.registrationNumber, reg.registrationNumber));
      }
    }
  });

  it("should retrieve all pending payments", async () => {
    const pendingPayments = await db
      .select()
      .from(registrations)
      .where(eq(registrations.paymentStatus, "pending_verification"));

    expect(pendingPayments.length).toBeGreaterThanOrEqual(2);
    expect(pendingPayments.some((p: any) => p.registrationNumber === "TEST-ADMIN-001")).toBe(true);
    expect(pendingPayments.some((p: any) => p.registrationNumber === "TEST-ADMIN-002")).toBe(true);
  });

  it("should filter payments by status", async () => {
    const pendingPayments = await db
      .select()
      .from(registrations)
      .where(eq(registrations.paymentStatus, "pending_verification"));

    expect(pendingPayments.every((p: any) => p.paymentStatus === "pending_verification")).toBe(true);
  });

  it("should filter payments by category", async () => {
    const vocalPayments = await db
      .select()
      .from(registrations)
      .where(eq(registrations.category, "Vocal"));

    expect(vocalPayments.some((p: any) => p.registrationNumber === "TEST-ADMIN-001")).toBe(true);
  });

  it("should update payment status to verified", async () => {
    await db
      .update(registrations)
      .set({
        paymentStatus: "verified",
      })
      .where(eq(registrations.registrationNumber, "TEST-ADMIN-001"));

    const updated = await db
      .select()
      .from(registrations)
      .where(eq(registrations.registrationNumber, "TEST-ADMIN-001"))
      .limit(1);

    expect(updated[0].paymentStatus).toBe("verified");
  });

  it("should update payment status to rejected", async () => {
    await db
      .update(registrations)
      .set({
        paymentStatus: "rejected",
      })
      .where(eq(registrations.registrationNumber, "TEST-ADMIN-002"));

    const updated = await db
      .select()
      .from(registrations)
      .where(eq(registrations.registrationNumber, "TEST-ADMIN-002"))
      .limit(1);

    expect(updated[0].paymentStatus).toBe("rejected");
  });

  it("should retrieve payment details with all information", async () => {
    const payment = await db
      .select()
      .from(registrations)
      .where(eq(registrations.registrationNumber, "TEST-ADMIN-001"))
      .limit(1);

    expect(payment[0]).toBeDefined();
    expect(payment[0].fullName).toBe("Admin Test User 1");
    expect(payment[0].email).toBe("admin1@example.com");
    expect(payment[0].invoiceId).toBe("MWB-V.250.0111");
    expect(payment[0].invoiceAmount).toBe(250010111);
    expect(payment[0].category).toBe("Vocal");
  });

  it("should search payments by full name", async () => {
    const searchResults = await db
      .select()
      .from(registrations)
      .where(eq(registrations.fullName, "Admin Test User 1"));

    expect(searchResults.length).toBeGreaterThanOrEqual(1);
    expect(searchResults[0].registrationNumber).toBe("TEST-ADMIN-001");
  });

  it("should search payments by invoice ID", async () => {
    const searchResults = await db
      .select()
      .from(registrations)
      .where(eq(registrations.invoiceId, "MWB-V.250.0111"));

    expect(searchResults.length).toBeGreaterThanOrEqual(1);
    expect(searchResults[0].registrationNumber).toBe("TEST-ADMIN-001");
  });
});
