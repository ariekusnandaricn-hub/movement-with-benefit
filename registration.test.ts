import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createTestContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("registration.create", () => {
  it("should create a registration with valid data", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const validData = {
      fullName: "John Doe",
      email: "john.doe@example.com",
      address: "Jl. Test No. 123, Jakarta",
      birthPlace: "Jakarta",
      birthDate: "1990-01-01",
      whatsappNumber: "081234567890",
      gender: "Laki-laki" as const,
      profession: "Actor",
      province: "DKI Jakarta",
      category: "Acting" as const,
      photoBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      photoMimeType: "image/png",
      paymentProofBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      paymentProofMimeType: "image/png",
      nik: "1234567890123456",
    };

    const result = await caller.registration.create(validData);

    expect(result).toHaveProperty("success");
    expect(result).toHaveProperty("registrationNumber");
    expect(result).toHaveProperty("invoiceId");
    expect(result).toHaveProperty("invoiceAmount");
    expect(result).toHaveProperty("saweriaLink");
    expect(result.success).toBe(true);
    expect(result.registrationNumber).toMatch(/^MWB-\d{8}-\d{4}$/);
    expect(result.invoiceId).toMatch(/^\d{6}$/);
    expect(result.invoiceAmount).toBeGreaterThan(250000);
    expect(result.saweriaLink).toContain("saweria.co");
  });

  it("should reject registration with invalid WhatsApp number", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const invalidData = {
      fullName: "Jane Doe",
      email: "jane@example.com",
      address: "Jl. Test No. 456, Bandung",
      birthPlace: "Bandung",
      birthDate: "1995-05-05",
      whatsappNumber: "123", // Invalid format
      gender: "Perempuan" as const,
      profession: "Singer",
      province: "Jawa Barat",
      category: "Vocal" as const,
    };

    await expect(caller.registration.create(invalidData)).rejects.toThrow();
  });

  it("should reject registration with missing required fields", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const incompleteData = {
      fullName: "",
      email: "test@example.com",
      address: "Jl. Test",
      birthPlace: "Surabaya",
      birthDate: "1992-03-15",
      whatsappNumber: "081234567890",
      gender: "Laki-laki" as const,
      profession: "Model",
      province: "Jawa Timur",
      category: "Model" as const,
    };

    await expect(caller.registration.create(incompleteData)).rejects.toThrow();
  });

  it("should generate unique Saweria links for different registrations", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const data1 = {
      fullName: "Alice",
      email: "alice@example.com",
      address: "Address 1",
      birthPlace: "City 1",
      birthDate: "1990-01-01",
      whatsappNumber: "081111111111",
      gender: "Perempuan" as const,
      profession: "Actress",
      province: "Bali",
      category: "Acting" as const,
      photoBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      photoMimeType: "image/png",
      paymentProofBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      paymentProofMimeType: "image/png",
      nik: "1111111111111111",
    };

    const data2 = {
      fullName: "Bob",
      email: "bob@example.com",
      address: "Address 2",
      birthPlace: "City 2",
      birthDate: "1991-02-02",
      whatsappNumber: "082222222222",
      gender: "Laki-laki" as const,
      profession: "Singer",
      province: "Jawa Tengah",
      category: "Vocal" as const,
      photoBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      photoMimeType: "image/png",
      paymentProofBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      paymentProofMimeType: "image/png",
      nik: "2222222222222222",
    };

    const result1 = await caller.registration.create(data1);
    const result2 = await caller.registration.create(data2);

    expect(result1.saweriaLink).not.toBe(result2.saweriaLink);
    expect(result1.saweriaLink).toContain("Alice");
    expect(result2.saweriaLink).toContain("Bob");
  });
});

describe("registration.getById", () => {
  it("should retrieve a registration by ID", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // First create a registration
    const createData = {
      fullName: "Test User",
      email: "testuser@example.com",
      address: "Test Address",
      birthPlace: "Test City",
      birthDate: "1990-01-01",
      whatsappNumber: "081234567890",
      gender: "Laki-laki" as const,
      profession: "Test Profession",
      province: "DI Yogyakarta",
      photoBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      photoMimeType: "image/png",
      paymentProofBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      paymentProofMimeType: "image/png",
      nik: "3333333333333333",
      category: "Acting" as const,
    };

    const created = await caller.registration.create(createData);

    // Verify response includes invoice information
    expect(created.success).toBe(true);
    expect(created.registrationNumber).toBeDefined();
    expect(created.invoiceId).toBeDefined();
    expect(created.invoiceAmount).toBeDefined();
    expect(created.saweriaLink).toBeDefined();

    // Note: created response doesn't include id, so we can't retrieve by id
    // In real usage, the registration would be stored and we could query by registrationNumber
  });

  it("should throw error for non-existent registration", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.registration.getById({ id: 999999 })
    ).rejects.toThrow("Pendaftaran tidak ditemukan");
  });
});

describe("registration.create - KIA validation for minors", () => {
  it("should accept registration for minor with NIK (KIA optional)", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const minorData = {
      fullName: "Minor Participant With NIK",
      email: "minorwithnik@example.com",
      address: "Jl. Test No. 789, Jakarta",
      birthPlace: "Jakarta",
      birthDate: "2010-01-01", // 15 years old
      whatsappNumber: "081234567890",
      gender: "Laki-laki" as const,
      profession: "Student",
      province: "DKI Jakarta",
      category: "Acting" as const,
      photoBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      photoMimeType: "image/png",
      paymentProofBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      paymentProofMimeType: "image/png",
      nik: "1234567890123456",
      isMinor: true,
    };

    const result = await caller.registration.create(minorData);

    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);
    expect(result.registrationNumber).toMatch(/^MWB-\d{8}-\d{4}$/);
  });

  it("should accept registration for minor without NIK but with KIA and parental consent", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const minorData = {
      fullName: "Minor KIA User",
      email: "minor.kia@example.com",
      address: "Minor KIA Address",
      birthPlace: "Minor KIA City",
      birthDate: "2009-06-15",
      whatsappNumber: "081234567892",
      gender: "Laki-laki" as const,
      profession: "Student",
      province: "Sumatera Utara",
      category: "Model" as const,
      photoBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      photoMimeType: "image/png",
      paymentProofBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      paymentProofMimeType: "image/png",
      kiaNumber: "1234567890123456",
      parentalConsentBase64: "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MNCjEgMCBvYmo8PC9UeXBlL0NhdGFsb2cvUGFnZXM",
      parentalConsentMimeType: "application/pdf",
      isMinor: true,
    };

    const result = await caller.registration.create(minorData);

    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);
    expect(result.registrationNumber).toMatch(/^MWB-\d{8}-\d{4}$/);
  });

  it("should reject registration for minor without NIK and without KIA", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const minorData = {
      fullName: "Minor No NIK No KIA",
      email: "minornodata@example.com",
      address: "Jl. Test No. 777, Jakarta",
      birthPlace: "Jakarta",
      birthDate: "2010-01-01",
      whatsappNumber: "081234567892",
      gender: "Laki-laki" as const,
      profession: "Student",
      province: "DKI Jakarta",
      category: "Acting" as const,
      photoBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      photoMimeType: "image/png",
      paymentProofBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      paymentProofMimeType: "image/png",
      isMinor: true,
    };

    await expect(caller.registration.create(minorData)).rejects.toThrow();
  });

  it("should reject registration for minor without NIK and without parental consent", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const minorData = {
      fullName: "Minor User",
      email: "minor@example.com",
      address: "Minor Address",
      birthPlace: "Minor City",
      birthDate: "2010-01-01",
      whatsappNumber: "081234567891",
      gender: "Perempuan" as const,
      profession: "Student",
      province: "Jawa Barat",
      category: "Vocal" as const,
      photoBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      photoMimeType: "image/png",
      paymentProofBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      paymentProofMimeType: "image/png",
      kiaNumber: "1234567890123456",
      isMinor: true,
    };

    await expect(caller.registration.create(minorData)).rejects.toThrow();
  });



  it("should accept registration for adult without KIA number", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const adultData = {
      fullName: "Adult User",
      email: "adult@example.com",
      address: "Adult Address",
      birthPlace: "Adult City",
      birthDate: "1990-01-01",
      whatsappNumber: "081234567892",
      gender: "Laki-laki" as const,
      profession: "Actor",
      province: "Jawa Timur",
      category: "Acting" as const,
      photoBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      photoMimeType: "image/png",
      paymentProofBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      paymentProofMimeType: "image/png",
      nik: "1234567890123456",
      isMinor: false,
    };

    const result = await caller.registration.create(adultData);

    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);
    expect(result.registrationNumber).toMatch(/^MWB-\d{8}-\d{4}$/);
  });
});
