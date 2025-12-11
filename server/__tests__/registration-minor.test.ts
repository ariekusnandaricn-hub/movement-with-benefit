import { describe, it, expect } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "sample-user",
    email: "sample@example.com",
    name: "Sample User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("Registration Router - Minor/KIA", () => {
  it("should create registration for minor with KIA and parental consent", async () => {
    const ctx = createContext();
    const caller = appRouter.createCaller(ctx);

    // Create a date for someone under 17 years old
    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - 15);

    const result = await caller.registration.create({
      fullName: "Young Talent",
      email: "young@example.com",
      address: "123 Youth St",
      birthPlace: "Jakarta",
      birthDate: birthDate.toISOString().split('T')[0],
      whatsappNumber: "081234567890",
      gender: "Laki-laki",
      profession: "Student",
      province: "DKI Jakarta",
      category: "Acting",
      nik: null,
      kiaNumber: "1234567890123456",
      photoBase64: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAA==",
      photoMimeType: "image/jpeg",
      parentalConsentBase64: "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MNCjEgMCBvYmo=",
      parentalConsentMimeType: "application/pdf",
      isMinor: 1,
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.registrationNumber).toBeDefined();
    expect(result.registrationNumber).toMatch(/^MWB-\d+$/);
  });

  it("should create registration without NIK but with KIA", async () => {
    const ctx = createContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.registration.create({
      fullName: "No NIK Person",
      email: "nonik@example.com",
      address: "456 Oak Ave",
      birthPlace: "Surabaya",
      birthDate: "1995-05-20",
      whatsappNumber: "082345678901",
      gender: "Perempuan",
      profession: "Teacher",
      province: "Jawa Timur",
      category: "Vocal",
      nik: null,
      kiaNumber: "9876543210123456",
      photoBase64: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAA==",
      photoMimeType: "image/jpeg",
      parentalConsentBase64: "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MNCjEgMCBvYmo=",
      parentalConsentMimeType: "application/pdf",
      isMinor: 0,
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.registrationNumber).toBeDefined();
  });

  it("should create registration with NIK (no KIA required)", async () => {
    const ctx = createContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.registration.create({
      fullName: "Adult Person",
      email: "adult@example.com",
      address: "789 Pine Rd",
      birthPlace: "Bandung",
      birthDate: "1990-03-10",
      whatsappNumber: "083456789012",
      gender: "Laki-laki",
      profession: "Engineer",
      province: "Jawa Barat",
      category: "Model",
      nik: "1234567890123456",
      kiaNumber: null,
      photoBase64: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAA==",
      photoMimeType: "image/jpeg",
      parentalConsentBase64: null,
      parentalConsentMimeType: null,
      isMinor: 0,
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.registrationNumber).toBeDefined();
  });
});
