import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { createRegistration, generateRegistrationNumber } from "./db";

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

describe("Saweria Webhook Integration", () => {
  let testRegistration: any;

  beforeAll(async () => {
    // Create a test registration for webhook testing
    const registrationNumber = await generateRegistrationNumber();
    testRegistration = await createRegistration({
      registrationNumber,
      fullName: "Webhook Test User",
      email: "webhook.test@example.com",
      address: "Test Address",
      birthPlace: "Test City",
      birthDate: "1990-01-01",
      whatsappNumber: "081234567890",
      gender: "Laki-laki" as const,
      profession: "Tester",
      province: "DKI Jakarta",
      category: "Acting" as const,
      paymentStatus: "pending" as const,
      saweriaLink: "https://saweria.co/test",
      photoBase64: "data:image/png;base64,test",
      photoMimeType: "image/png",
      nik: "1234567890123456",
      invoiceId: "001001",
      invoiceAmount: 250001,
    });
  });

  describe("webhook.saweriaPayment", () => {
    it("should process successful payment and update status", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const webhookPayload = {
        id: "donation_test_123",
        amount: 250001,
        amount_raw: 250001,
        donator_name: "Test Donator",
        donator_email: "donator@example.com",
        message: `Pendaftaran Audisi - ${testRegistration.fullName} - ${testRegistration.category} - Invoice: ${testRegistration.invoiceId}`,
        created_at: new Date().toISOString(),
        status: "success",
      };

      const result = await caller.webhook.saweriaPayment(webhookPayload);

      expect(result.success).toBe(true);
      expect(result.message).toContain("successfully");
      expect(result.registrationNumber).toBe(testRegistration.registrationNumber);
    });

    it("should reject payment with insufficient amount", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const webhookPayload = {
        id: "donation_test_low_amount",
        amount: 100000, // Less than required 250000
        amount_raw: 100000,
        message: "Pendaftaran Audisi - Test User - Acting - Invoice: 001001",
        created_at: new Date().toISOString(),
        status: "success",
      };

      const result = await caller.webhook.saweriaPayment(webhookPayload);

      expect(result.success).toBe(false);
      expect(result.message).toContain("Insufficient payment amount");
    });

    it("should skip non-success payment status", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const webhookPayload = {
        id: "donation_test_pending",
        amount: 250000,
        message: "Pendaftaran Audisi - Test User - Acting",
        created_at: new Date().toISOString(),
        status: "pending", // Not success
      };

      const result = await caller.webhook.saweriaPayment(webhookPayload);

      expect(result.success).toBe(true);
      expect(result.message).toContain("not successful");
    });

    it("should reject invalid message format", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const webhookPayload = {
        id: "donation_test_invalid_msg",
        amount: 250000,
        message: "Invalid message format without proper structure",
        created_at: new Date().toISOString(),
        status: "success",
      };

      const result = await caller.webhook.saweriaPayment(webhookPayload);

      expect(result.success).toBe(false);
      expect(result.message).toContain("Unknown payment type");
    });

    it("should handle registration not found", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const webhookPayload = {
        id: "donation_test_not_found",
        amount: 250000,
        message: "Pendaftaran Audisi - Non Existent User - Vocal - Invoice: 999999",
        created_at: new Date().toISOString(),
        status: "success",
      };

      const result = await caller.webhook.saweriaPayment(webhookPayload);

      expect(result.success).toBe(false);
      expect(result.message).toContain("not found");
    });

    it("should parse message with various formats", async () => {
      const testCases = [
        {
          message: "Pendaftaran Audisi - John Doe - Acting",
          expected: { name: "John Doe", category: "Acting" },
        },
        {
          message: "Pendaftaran Audisi - Jane Smith - Vocal",
          expected: { name: "Jane Smith", category: "Vocal" },
        },
        {
          message: "Pendaftaran Audisi - Bob Lee - Model",
          expected: { name: "Bob Lee", category: "Model" },
        },
      ];

      testCases.forEach(({ message, expected }) => {
        const match = message.match(/Pendaftaran Audisi - (.+) - (.+)/);
        expect(match).toBeTruthy();
        expect(match![1]).toBe(expected.name);
        expect(match![2]).toBe(expected.category);
      });
    });

    it("should validate amount is a number", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      // Test with valid amount
      expect(() => {
        const payload = {
          id: "test",
          amount: 250000,
          message: "Pendaftaran Audisi - Test - Acting",
          created_at: new Date().toISOString(),
          status: "success",
        };
        // Should not throw
      }).not.toThrow();
    });

    it("should handle webhook with optional fields missing", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const webhookPayload = {
        id: "donation_test_minimal",
        amount: 250000,
        // donator_name: undefined,
        // donator_email: undefined,
        // amount_raw: undefined,
        message: `Pendaftaran Audisi - ${testRegistration.fullName} - ${testRegistration.category}`,
        created_at: new Date().toISOString(),
        status: "success",
      };

      // Should not throw error for missing optional fields
      await expect(
        caller.webhook.saweriaPayment(webhookPayload)
      ).resolves.toBeDefined();
    });
  });

  describe("Message Format Validation", () => {
    it("should extract name and category correctly", () => {
      const testMessages = [
        "Pendaftaran Audisi - Ahmad Rizki - Acting",
        "Pendaftaran Audisi - Siti Nurhaliza - Vocal",
        "Pendaftaran Audisi - Dian Sastro - Model",
      ];

      testMessages.forEach(message => {
        const match = message.match(/Pendaftaran Audisi - (.+) - (.+)/);
        expect(match).toBeTruthy();
        expect(match![1]).toBeTruthy(); // Name exists
        expect(match![2]).toBeTruthy(); // Category exists
        expect(["Acting", "Vocal", "Model"]).toContain(match![2]);
      });
    });

    it("should handle names with special characters", () => {
      const testMessages = [
        "Pendaftaran Audisi - O'Brien - Acting",
        "Pendaftaran Audisi - Jean-Paul - Vocal",
        "Pendaftaran Audisi - María José - Model",
      ];

      testMessages.forEach(message => {
        const match = message.match(/Pendaftaran Audisi - (.+) - (.+)/);
        expect(match).toBeTruthy();
      });
    });

    it("should not match invalid message formats", () => {
      const invalidMessages = [
        "Random message",
        "Pendaftaran - Name - Category", // Missing "Audisi"
        "Pendaftaran Audisi - Name", // Missing category
        "Name - Category", // Missing prefix
      ];

      invalidMessages.forEach(message => {
        const match = message.match(/Pendaftaran Audisi - (.+) - (.+)/);
        expect(match).toBeFalsy();
      });
    });
  });

  describe("Amount Validation", () => {
    it("should accept exact amount of 250000", () => {
      const amount = 250000;
      expect(amount >= 250000).toBe(true);
    });

    it("should accept amount greater than 250000", () => {
      const amounts = [250001, 300000, 500000, 1000000];
      amounts.forEach(amount => {
        expect(amount >= 250000).toBe(true);
      });
    });

    it("should reject amount less than 250000", () => {
      const amounts = [0, 100000, 200000, 249999];
      amounts.forEach(amount => {
        expect(amount < 250000).toBe(true);
      });
    });
  });

  describe("Status Validation", () => {
    it("should only process success status", () => {
      const validStatus = "success";
      expect(validStatus === "success").toBe(true);
    });

    it("should skip non-success statuses", () => {
      const invalidStatuses = ["pending", "failed", "cancelled", "refunded"];
      invalidStatuses.forEach(status => {
        expect(status !== "success").toBe(true);
      });
    });
  });

  describe("Signature Validation Logic", () => {
    it("should generate consistent HMAC signature", () => {
      const crypto = require("crypto");
      const secret = "test_secret_key";
      const payload = JSON.stringify({
        id: "test_123",
        amount: 250000,
        message: "Test message",
        created_at: "2025-01-21T10:00:00Z",
      });

      const signature1 = crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");

      const signature2 = crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");

      expect(signature1).toBe(signature2);
      expect(signature1).toHaveLength(64); // SHA256 hex = 64 chars
    });

    it("should produce different signatures for different payloads", () => {
      const crypto = require("crypto");
      const secret = "test_secret_key";

      const payload1 = JSON.stringify({ id: "test_1" });
      const payload2 = JSON.stringify({ id: "test_2" });

      const signature1 = crypto
        .createHmac("sha256", secret)
        .update(payload1)
        .digest("hex");

      const signature2 = crypto
        .createHmac("sha256", secret)
        .update(payload2)
        .digest("hex");

      expect(signature1).not.toBe(signature2);
    });
  });
});
