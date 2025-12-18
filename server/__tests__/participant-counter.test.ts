import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "../db";
import { registrations } from "../../drizzle/schema";
import { appRouter } from "../routers";
import { createContext } from "../_core/context";

describe("Participant Counter", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
  });

  it("should return 0 when no registrations exist", async () => {
    // Clear all registrations
    if (db) {
      await db.delete(registrations);
    }

    const caller = appRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: null,
    });

    const result = await caller.public.getParticipantCount();
    expect(result.count).toBe(0);
  });

  it("should return correct count after adding registrations", async () => {
    if (!db) return;

    // Clear existing data
    await db.delete(registrations);

    // Add test registrations
    await db.insert(registrations).values([
      {
        registrationNumber: "TEST-001",
        fullName: "Test User 1",
        email: "test1@example.com",
        address: "Test Address",
        birthPlace: "Test City",
        birthDate: "2000-01-01",
        whatsappNumber: "082315660007",
        gender: "Laki-laki",
        profession: "Student",
        province: "DKI Jakarta",
        category: "Acting",
        paymentStatus: "pending",
        invoiceId: "MWB-A.250.0001",
        invoiceAmount: 250001,
      },
      {
        registrationNumber: "TEST-002",
        fullName: "Test User 2",
        email: "test2@example.com",
        address: "Test Address",
        birthPlace: "Test City",
        birthDate: "2000-01-01",
        whatsappNumber: "082315660007",
        gender: "Perempuan",
        profession: "Student",
        province: "DKI Jakarta",
        category: "Vocal",
        paymentStatus: "pending",
        invoiceId: "MWB-V.250.0002",
        invoiceAmount: 250002,
      },
      {
        registrationNumber: "TEST-003",
        fullName: "Test User 3",
        email: "test3@example.com",
        address: "Test Address",
        birthPlace: "Test City",
        birthDate: "2000-01-01",
        whatsappNumber: "082315660007",
        gender: "Laki-laki",
        profession: "Student",
        province: "DKI Jakarta",
        category: "Model",
        paymentStatus: "pending",
        invoiceId: "MWB-M.250.0003",
        invoiceAmount: 250003,
      },
    ]);

    const caller = appRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: null,
    });

    const result = await caller.public.getParticipantCount();
    expect(result.count).toBe(3);
  });

  it("should return count as number type", async () => {
    const caller = appRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: null,
    });

    const result = await caller.public.getParticipantCount();
    expect(typeof result.count).toBe("number");
  });
});
