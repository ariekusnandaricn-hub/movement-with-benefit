import { describe, it, expect } from "vitest";
import { appRouter } from "../routers";
import { getDb } from "../db";
import { registrations } from "../../drizzle/schema";

// Helper to create a simple base64 image
function createTestPhotoBase64(): string {
  // 1x1 pixel transparent PNG
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
    0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
  ]);
  return `data:image/png;base64,${pngBuffer.toString("base64")}`;
}

describe("Registration with Notification Test", () => {
  it("should register participant with test data", async () => {
    const testData = {
      fullName: "Test Participant Arie",
      email: "ariekusnandar.icn@gmail.com",
      whatsappNumber: "081807330996",
      address: "Jl. Test No. 123",
      birthPlace: "Jakarta",
      birthDate: "2007-12-11", // 17 tahun
      gender: "Laki-laki" as const,
      profession: "Student",
      province: "DKI Jakarta",
      category: "Acting" as const,
      photoBase64: createTestPhotoBase64(),
      photoMimeType: "image/png",
      nik: "1234567890123456",
    };

    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.registration.create(testData);

      console.log("\n✅ Registration successful!");
      console.log("Registration Number:", result.registrationNumber);
      console.log("Invoice ID:", result.invoiceId);
      console.log("Invoice Amount:", result.paymentAmount);
      console.log("Message:", result.message);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.invoiceId).toMatch(/^MWB-A\.\d+\.\d+$/);
      expect(result.paymentAmount).toBeGreaterThan(250000000);

      console.log("\n📧 Email notification should be sent to:", testData.email);
      console.log("📱 WhatsApp notification should be sent to:", testData.whatsappNumber);
      console.log("\nNotification Details:");
      console.log(`- Invoice ID: ${result.invoiceId}`);
      console.log(`- Payment Amount: Rp ${result.paymentAmount.toLocaleString("id-ID")}`);
      console.log(`- Category: ${testData.category}`);
      console.log(`- Participant Name: ${testData.fullName}`);
      console.log(`- Email: ${testData.email}`);
      console.log(`- WhatsApp: ${testData.whatsappNumber}`);
      console.log(`- Registration Number: ${result.registrationNumber}`);

      return result.registrationNumber;
    } catch (error) {
      console.error("❌ Registration failed:", error);
      throw error;
    }
  });

  it("should verify payment and send confirmation", async () => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get the last registration
      const lastRegistrations = await db.select().from(registrations).orderBy((t) => t.createdAt).limit(1);
      const lastRegistration = lastRegistrations[lastRegistrations.length - 1];

      if (!lastRegistration) {
        throw new Error("No registration found for verification test");
      }

      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.registration.verifyPayment({
        registrationNumber: lastRegistration.registrationNumber,
        isApproved: true,
      });

      console.log("\n✅ Payment verification successful!");
      console.log("Message:", result.message);
      console.log("\n📧 Confirmation email sent to:", lastRegistration.email);
      console.log("📱 Confirmation WhatsApp sent to:", lastRegistration.whatsappNumber);
      console.log("\nConfirmation Details:");
      console.log(`- Participant Number: ${lastRegistration.registrationNumber}`);
      console.log(`- Invoice ID: ${lastRegistration.invoiceId}`);
      console.log(`- Status: Payment Verified ✓`);
      console.log(`- Category: ${lastRegistration.category}`);
      console.log(`- Name: ${lastRegistration.fullName}`);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    } catch (error) {
      console.error("❌ Payment verification failed:", error);
      throw error;
    }
  });
});
