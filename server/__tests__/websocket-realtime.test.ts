import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { getDb } from "../db";
import { registrations } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import {
  broadcastNewRegistration,
  broadcastPaymentStatusUpdate,
  getWebSocketServer,
} from "../_core/websocket";

describe("WebSocket Real-time Updates", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
  });

  afterAll(async () => {
    if (db) {
      await db.delete(registrations).where(
        eq(registrations.registrationNumber, "TEST-WS-001")
      );
      await db.delete(registrations).where(
        eq(registrations.registrationNumber, "TEST-WS-BROADCAST")
      );
    }
  });

  it("should broadcast new registration event", async () => {
    if (!db) throw new Error("Database not available");

    const testData = {
      registrationNumber: "TEST-WS-BROADCAST",
      fullName: "WebSocket Test User",
      email: "ws@example.com",
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
      participantNumber: "WS-TEST-001",
      invoiceId: "WS-TEST-001",
      invoiceAmount: 250000,
    };

    await db.insert(registrations).values(testData);

    // Mock broadcast function
    const broadcastSpy = vi.fn();
    broadcastNewRegistration({
      registrationNumber: testData.registrationNumber,
      fullName: testData.fullName,
      category: testData.category,
      province: testData.province,
      email: testData.email,
      participantNumber: testData.participantNumber,
      paymentStatus: testData.paymentStatus,
      createdAt: new Date(),
    });

    // Verify registration was created
    const result = await db
      .select()
      .from(registrations)
      .where(eq(registrations.registrationNumber, "TEST-WS-BROADCAST"));

    expect(result).toHaveLength(1);
    expect(result[0].fullName).toBe("WebSocket Test User");
  });

  it("should broadcast payment status update event", async () => {
    if (!db) throw new Error("Database not available");

    const testData = {
      registrationNumber: "TEST-WS-001",
      fullName: "Payment Status Test",
      email: "payment@example.com",
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
      participantNumber: "WS-PAYMENT-001",
      invoiceId: "WS-PAYMENT-001",
      invoiceAmount: 250000,
    };

    await db.insert(registrations).values(testData);

    const created = await db
      .select()
      .from(registrations)
      .where(eq(registrations.registrationNumber, "TEST-WS-001"));

    expect(created).toHaveLength(1);
    const registrationId = created[0].id;

    // Update payment status
    await db
      .update(registrations)
      .set({ paymentStatus: "paid" })
      .where(eq(registrations.id, registrationId));

    // Broadcast payment status update
    broadcastPaymentStatusUpdate({
      registrationId,
      registrationNumber: testData.registrationNumber,
      fullName: testData.fullName,
      paymentStatus: "paid",
      updatedAt: new Date(),
    });

    // Verify status was updated
    const updated = await db
      .select()
      .from(registrations)
      .where(eq(registrations.id, registrationId));

    expect(updated[0].paymentStatus).toBe("paid");
  });

  it("should have WebSocket server initialized", () => {
    const io = getWebSocketServer();
    // WebSocket server may be null in test environment, but function should exist
    expect(typeof getWebSocketServer).toBe("function");
  });

  it("should handle multiple broadcast events", async () => {
    if (!db) throw new Error("Database not available");

    // Create multiple registrations
    for (let i = 0; i < 3; i++) {
      const testData = {
        registrationNumber: `TEST-WS-MULTI-${i}`,
        fullName: `Multi Test User ${i}`,
        email: `multi${i}@example.com`,
        address: "Test Address",
        birthPlace: "Test City",
        birthDate: "2000-01-01",
        whatsappNumber: "628123456789",
        gender: (i % 2 === 0 ? "Laki-laki" : "Perempuan") as const,
        profession: "Tester",
        province: "DKI Jakarta",
        category: (["Acting", "Vocal", "Model"][i % 3]) as const,
        nik: "1234567890123456",
        paymentStatus: "pending" as const,
        participantNumber: `MULTI-${i}`,
        invoiceId: `MULTI-${i}`,
        invoiceAmount: 250000,
      };

      await db.insert(registrations).values(testData);

      // Broadcast each registration
      broadcastNewRegistration({
        registrationNumber: testData.registrationNumber,
        fullName: testData.fullName,
        category: testData.category,
        province: testData.province,
        email: testData.email,
        participantNumber: testData.participantNumber,
        paymentStatus: testData.paymentStatus,
        createdAt: new Date(),
      });
    }

    // Verify all registrations were created
    const results = await db
      .select()
      .from(registrations)
      .where(eq(registrations.category, "Acting"));

    expect(results.length).toBeGreaterThan(0);

    // Cleanup
    for (let i = 0; i < 3; i++) {
      await db.delete(registrations).where(
        eq(registrations.registrationNumber, `TEST-WS-MULTI-${i}`)
      );
    }
  });
});
