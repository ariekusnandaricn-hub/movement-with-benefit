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
    user: null, // Public procedure doesn't need user
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("Registration Router", () => {
  it("should create a registration with valid data", async () => {
    const ctx = createContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.registration.create({
      fullName: "John Doe",
      email: "john@example.com",
      address: "123 Main St",
      birthPlace: "Jakarta",
      birthDate: "2000-01-15",
      whatsappNumber: "081234567890",
      gender: "Laki-laki",
      profession: "Student",
      province: "DKI Jakarta",
      category: "Acting",
      photoBase64: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAA==",
      photoMimeType: "image/jpeg",
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.registrationNumber).toBeDefined();
    expect(result.registrationNumber).toMatch(/^MWB-\d+$/);
  });

  it("should fail with invalid email", async () => {
    const ctx = createContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.registration.create({
        fullName: "Jane Doe",
        email: "invalid-email",
        address: "456 Oak Ave",
        birthPlace: "Surabaya",
        birthDate: "2001-05-20",
        whatsappNumber: "082345678901",
        gender: "Perempuan",
        profession: "Teacher",
        province: "Jawa Timur",
        category: "Vocal",
        photoBase64: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAA==",
        photoMimeType: "image/jpeg",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should list registrations", async () => {
    const ctx = createContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.registration.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("should filter registrations by category", async () => {
    const ctx = createContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.registration.list({
      category: "Acting",
    });
    expect(Array.isArray(result)).toBe(true);
  });
});
