import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "../db";
import { registrations } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Admin Dashboard", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
  });

  afterAll(async () => {
    // Cleanup
    if (db) {
      // Delete test registrations
      await db.delete(registrations).where(
        eq(registrations.registrationNumber, "TEST-ADMIN-001")
      );
    }
  });

  it("should create test registration data", async () => {
    if (!db) throw new Error("Database not available");

    const testData = {
      registrationNumber: "TEST-ADMIN-001",
      fullName: "Test Admin User",
      email: "test@example.com",
      address: "Test Address",
      birthPlace: "Test City",
      birthDate: "2000-01-01",
      whatsappNumber: "628123456789",
      gender: "Laki-laki" as const,
      profession: "Tester",
      province: "DKI Jakarta",
      category: "Acting" as const,
      nik: "1234567890123456",
      paymentStatus: "pending" as const,
      participantNumber: "TEST-001",
      invoiceId: "TEST-001",
      invoiceAmount: 250000,
    };

    await db.insert(registrations).values(testData);

    const result = await db
      .select()
      .from(registrations)
      .where(eq(registrations.registrationNumber, "TEST-ADMIN-001"));

    expect(result).toHaveLength(1);
    expect(result[0].fullName).toBe("Test Admin User");
    expect(result[0].category).toBe("Acting");
  });

  it("should filter registrations by category", async () => {
    if (!db) throw new Error("Database not available");

    // Create test data
    const testData = {
      registrationNumber: "TEST-ADMIN-CATEGORY",
      fullName: "Category Test",
      email: "category@example.com",
      address: "Test Address",
      birthPlace: "Test City",
      birthDate: "2000-01-01",
      whatsappNumber: "628123456789",
      gender: "Perempuan" as const,
      profession: "Tester",
      province: "Jawa Barat",
      category: "Vocal" as const,
      nik: "1234567890123456",
      paymentStatus: "pending" as const,
      participantNumber: "TEST-VOCAL-001",
      invoiceId: "TEST-VOCAL-001",
      invoiceAmount: 250000,
    };

    await db.insert(registrations).values(testData);

    const result = await db
      .select()
      .from(registrations)
      .where(eq(registrations.category, "Vocal"));

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((r: any) => r.category === "Vocal")).toBe(true);

    // Cleanup
    await db.delete(registrations).where(
      eq(registrations.registrationNumber, "TEST-ADMIN-CATEGORY")
    );
  });

  it("should filter registrations by payment status", async () => {
    if (!db) throw new Error("Database not available");

    const result = await db
      .select()
      .from(registrations)
      .where(eq(registrations.paymentStatus, "pending"));

    expect(Array.isArray(result)).toBe(true);
  });

  it("should update payment status", async () => {
    if (!db) throw new Error("Database not available");

    // Create test data
    const testData = {
      registrationNumber: "TEST-ADMIN-UPDATE",
      fullName: "Update Status Test",
      email: "update@example.com",
      address: "Test Address",
      birthPlace: "Test City",
      birthDate: "2000-01-01",
      whatsappNumber: "628123456789",
      gender: "Laki-laki" as const,
      profession: "Tester",
      province: "Surabaya",
      category: "Model" as const,
      nik: "1234567890123456",
      paymentStatus: "pending" as const,
      participantNumber: "TEST-MODEL-001",
      invoiceId: "TEST-MODEL-001",
      invoiceAmount: 250000,
    };

    await db.insert(registrations).values(testData);

    const created = await db
      .select()
      .from(registrations)
      .where(eq(registrations.registrationNumber, "TEST-ADMIN-UPDATE"));

    expect(created).toHaveLength(1);
    const registrationId = created[0].id;

    // Update status
    await db
      .update(registrations)
      .set({ paymentStatus: "paid" })
      .where(eq(registrations.id, registrationId));

    const updated = await db
      .select()
      .from(registrations)
      .where(eq(registrations.id, registrationId));

    expect(updated[0].paymentStatus).toBe("paid");

    // Cleanup
    await db.delete(registrations).where(
      eq(registrations.registrationNumber, "TEST-ADMIN-UPDATE")
    );
  });

  it("should search registrations by name", async () => {
    if (!db) throw new Error("Database not available");

    // Create test data
    const testData = {
      registrationNumber: "TEST-ADMIN-SEARCH",
      fullName: "Unique Search Name XYZ",
      email: "search@example.com",
      address: "Test Address",
      birthPlace: "Test City",
      birthDate: "2000-01-01",
      whatsappNumber: "628123456789",
      gender: "Perempuan" as const,
      profession: "Tester",
      province: "Bandung",
      category: "Acting" as const,
      nik: "1234567890123456",
      paymentStatus: "pending" as const,
      participantNumber: "TEST-SEARCH-001",
      invoiceId: "TEST-SEARCH-001",
      invoiceAmount: 250000,
    };

    await db.insert(registrations).values(testData);

    const result = await db
      .select()
      .from(registrations)
      .where(eq(registrations.fullName, "Unique Search Name XYZ"));

    expect(result).toHaveLength(1);
    expect(result[0].fullName).toBe("Unique Search Name XYZ");

    // Cleanup
    await db.delete(registrations).where(
      eq(registrations.registrationNumber, "TEST-ADMIN-SEARCH")
    );
  });
});
