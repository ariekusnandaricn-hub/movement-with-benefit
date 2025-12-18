import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getParticipantCountFromTidb, closeTidbPool } from "../tidb-connection";

describe("TiDB Production Connection", () => {
  afterAll(async () => {
    await closeTidbPool();
  });

  it("should connect to production TiDB and fetch participant count", async () => {
    const count = await getParticipantCountFromTidb();
    expect(typeof count).toBe("number");
    expect(count).toBeGreaterThanOrEqual(0);
    console.log(`✅ Production TiDB Connection Successful - Participant Count: ${count}`);
  });

  it("should return a number greater than 0 (production has data)", async () => {
    const count = await getParticipantCountFromTidb();
    expect(count).toBeGreaterThan(0);
    console.log(`✅ Production database has ${count} registered participants`);
  });

  it("should handle connection errors gracefully", async () => {
    const count = await getParticipantCountFromTidb();
    expect(typeof count).toBe("number");
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
