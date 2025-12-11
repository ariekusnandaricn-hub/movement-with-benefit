import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "../db";
import { registrations } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Payment Verification & Notification System", () => {
  let db: any;
  let testRegistrationNumber: string;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create test registration
    const result = await db
      .insert(registrations)
      .values({
        registrationNumber: "TEST-NOTIF-001",
        fullName: "Test User",
        email: "test@example.com",
        address: "Test Address",
        birthPlace: "Test City",
        birthDate: "2000-01-01",
        whatsappNumber: "082315660007",
        gender: "Laki-laki",
        profession: "Student",
        province: "DKI Jakarta",
        category: "Vocal",
        paymentStatus: "pending_verification",
        invoiceId: "MWB-V.250.0111",
        invoiceAmount: 250010111,
      })
      .$returningId();

    testRegistrationNumber = "TEST-NOTIF-001";
  });

  afterAll(async () => {
    // Cleanup
    if (db) {
      await db
        .delete(registrations)
        .where(eq(registrations.registrationNumber, testRegistrationNumber));
    }
  });

  it("should retrieve registration data for notification", async () => {
    const registration = await db
      .select()
      .from(registrations)
      .where(eq(registrations.registrationNumber, testRegistrationNumber))
      .limit(1);

    expect(registration).toBeDefined();
    expect(registration.length).toBe(1);
    expect(registration[0].fullName).toBe("Test User");
    expect(registration[0].email).toBe("test@example.com");
    expect(registration[0].invoiceId).toBe("MWB-V.250.0111");
  });

  it("should update payment status to verified", async () => {
    await db
      .update(registrations)
      .set({
        paymentStatus: "verified",
      })
      .where(eq(registrations.registrationNumber, testRegistrationNumber));

    const updated = await db
      .select()
      .from(registrations)
      .where(eq(registrations.registrationNumber, testRegistrationNumber))
      .limit(1);

    expect(updated[0].paymentStatus).toBe("verified");
  });

  it("should update payment status to rejected", async () => {
    await db
      .update(registrations)
      .set({
        paymentStatus: "rejected",
      })
      .where(eq(registrations.registrationNumber, testRegistrationNumber));

    const updated = await db
      .select()
      .from(registrations)
      .where(eq(registrations.registrationNumber, testRegistrationNumber))
      .limit(1);

    expect(updated[0].paymentStatus).toBe("rejected");
  });

  it("should format WhatsApp number correctly", () => {
    const { formatWhatsAppNumber } = require("../utils/whatsappNotification");

    expect(formatWhatsAppNumber("082315660007")).toBe("6282315660007");
    expect(formatWhatsAppNumber("6282315660007")).toBe("6282315660007");
    expect(formatWhatsAppNumber("82315660007")).toBe("6282315660007");
  });

  it("should generate payment verification message", () => {
    const { generatePaymentVerificationMessage } = require("../utils/whatsappNotification");

    const message = generatePaymentVerificationMessage(
      "Test User",
      "Vocal",
      "MWB-V.250.0111",
      "TEST-NOTIF-001"
    );

    expect(message).toContain("Selamat Test User");
    expect(message).toContain("Vocal");
    expect(message).toContain("MWB-V.250.0111");
    expect(message).toContain("TEST-NOTIF-001");
  });

  it("should generate payment reminder message", () => {
    const { generatePaymentReminderMessage } = require("../utils/whatsappNotification");

    const message = generatePaymentReminderMessage(
      "Test User",
      "MWB-V.250.0111"
    );

    expect(message).toContain("REMINDER PEMBAYARAN");
    expect(message).toContain("Test User");
    expect(message).toContain("MWB-V.250.0111");
  });
});
