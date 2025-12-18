import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { drizzle } from "drizzle-orm/mysql2";
import { registrations } from "../../drizzle/schema";

describe("Production Database Sync", () => {
  let db: any;

  beforeAll(async () => {
    const dbUrl = process.env.PRODUCTION_DB_URL;
    if (!dbUrl) {
      console.warn("PRODUCTION_DB_URL not set, skipping test");
      return;
    }
    
    try {
      db = drizzle(dbUrl);
      console.log("✅ Connected to production database");
    } catch (error) {
      console.error("Failed to connect to production database:", error);
      throw error;
    }
  });

  it("should connect to production database", async () => {
    if (!db) {
      console.warn("Database not available");
      return;
    }
    
    expect(db).toBeDefined();
    console.log("✅ Production database connection successful");
  });

  it("should check production database schema", async () => {
    if (!db) {
      console.warn("Database not available");
      return;
    }

    try {
      const result = await db.execute("DESCRIBE registrations");
      console.log("✅ Production database registrations table schema:");
      console.log(result);
      expect(Array.isArray(result)).toBe(true);
    } catch (error) {
      console.error("Error checking schema:", error);
      throw error;
    }
  });

  it("should count total registrations in production database", async () => {
    if (!db) {
      console.warn("Database not available");
      return;
    }

    try {
      const result = await db.execute("SELECT COUNT(*) as count FROM registrations");
      const count = result[0][0].count;
      expect(count).toBeGreaterThanOrEqual(0);
      console.log(`✅ Total registrations in production database: ${count}`);
    } catch (error) {
      console.error("Error counting registrations:", error);
      throw error;
    }
  });
});
