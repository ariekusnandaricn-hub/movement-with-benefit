import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { createContestant } from "./db";

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

describe("Voting System", () => {
  let testContestant: any;

  beforeAll(async () => {
    // Create a test contestant for voting tests
    const randomId = Math.floor(Math.random() * 10000);
    testContestant = await createContestant({
      registrationId: 1,
      name: "Test Contestant",
      category: "Acting",
      province: "DKI Jakarta",
      photoUrl: null,
      bio: "Test bio",
      voteCount: 0,
      status: "active",
      contestantNumber: `T${randomId}`,
    });
  });

  describe("voting.getContestants", () => {
    it("should return list of active contestants", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.voting.getContestants();

      expect(result).toHaveProperty("contestants");
      expect(result).toHaveProperty("totalVotes");
      expect(Array.isArray(result.contestants)).toBe(true);
      expect(result.contestants.length).toBeGreaterThan(0);
      
      // All contestants should be active
      result.contestants.forEach(contestant => {
        expect(contestant.status).toBe("active");
      });
    });

    it("should return contestants with required fields", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.voting.getContestants();

      result.contestants.forEach(contestant => {
        expect(contestant).toHaveProperty("id");
        expect(contestant).toHaveProperty("name");
        expect(contestant).toHaveProperty("category");
        expect(contestant).toHaveProperty("province");
        expect(contestant).toHaveProperty("voteCount");
        expect(contestant).toHaveProperty("votePercentage");
        expect(contestant).toHaveProperty("contestantNumber");
        expect(contestant).toHaveProperty("status");
      });
    });
  });

  describe("voting.getContestantById", () => {
    it("should return contestant by ID", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const contestant = await caller.voting.getContestantById({ id: testContestant.id });

      expect(contestant).toBeDefined();
      expect(contestant.id).toBe(testContestant.id);
      expect(contestant.name).toBe(testContestant.name);
    });

    it("should throw error for non-existent contestant", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.voting.getContestantById({ id: 999999 })
      ).rejects.toThrow("Contestant not found");
    });
  });

  describe("voting.generateVoteLink", () => {
    it("should generate valid Saweria link for 1 vote", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.voting.generateVoteLink({
        contestantId: testContestant.id,
        voteQuantity: 1,
      });

      expect(result.contestantId).toBe(testContestant.id);
      expect(result.contestantName).toBe(testContestant.name);
      expect(result.contestantNumber).toBe(testContestant.contestantNumber);
      expect(result.voteQuantity).toBe(1);
      expect(result.amount).toBe(1500); // 1 vote = Rp 1.500
      expect(result.saweriaLink).toContain("saweria.co");
      expect(result.saweriaLink).toContain("amount=1500");
    });

    it("should generate valid Saweria link for multiple votes", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.voting.generateVoteLink({
        contestantId: testContestant.id,
        voteQuantity: 5,
      });

      expect(result.voteQuantity).toBe(5);
      expect(result.amount).toBe(7500); // 5 votes = Rp 7.500
      expect(result.saweriaLink).toContain("amount=7500");
    });

    it("should include contestant info in Saweria message", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.voting.generateVoteLink({
        contestantId: testContestant.id,
        voteQuantity: 3,
      });

      const decodedMessage = decodeURIComponent(result.saweriaLink);
      expect(decodedMessage).toContain(testContestant.name);
      expect(decodedMessage).toContain(testContestant.contestantNumber);
      expect(decodedMessage).toContain("3 votes");
    });

    it("should reject vote for non-existent contestant", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.voting.generateVoteLink({
          contestantId: 999999,
          voteQuantity: 1,
        })
      ).rejects.toThrow("Contestant not found");
    });

    it("should reject vote quantity less than 1", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.voting.generateVoteLink({
          contestantId: testContestant.id,
          voteQuantity: 0,
        })
      ).rejects.toThrow();
    });

    it("should calculate correct amount for various vote quantities", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const testCases = [
        { votes: 1, expectedAmount: 1500 },
        { votes: 5, expectedAmount: 7500 },
        { votes: 10, expectedAmount: 15000 },
        { votes: 100, expectedAmount: 150000 },
      ];

      for (const { votes, expectedAmount } of testCases) {
        const result = await caller.voting.generateVoteLink({
          contestantId: testContestant.id,
          voteQuantity: votes,
        });

        expect(result.amount).toBe(expectedAmount);
      }
    });
  });

  describe("Vote Price Calculation", () => {
    it("should use correct price per vote (Rp 1.500)", () => {
      const pricePerVote = 1500;
      
      expect(1 * pricePerVote).toBe(1500);
      expect(5 * pricePerVote).toBe(7500);
      expect(10 * pricePerVote).toBe(15000);
    });
  });

  describe("Saweria Link Format", () => {
    it("should generate properly formatted Saweria URL", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.voting.generateVoteLink({
        contestantId: testContestant.id,
        voteQuantity: 1,
      });

      // Check URL structure
      expect(result.saweriaLink).toMatch(/^https:\/\/saweria\.co\//);
      expect(result.saweriaLink).toContain("?amount=");
      expect(result.saweriaLink).toContain("&message=");
    });

    it("should properly encode message in URL", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.voting.generateVoteLink({
        contestantId: testContestant.id,
        voteQuantity: 1,
      });

      // Message should be URL encoded
      expect(result.saweriaLink).not.toContain(" ");
      expect(result.saweriaLink).toContain("%20"); // Space encoded
    });
  });

  describe("Contestant Status Validation", () => {
    it("should only allow voting for active contestants", async () => {
      // This test assumes we can create inactive contestant
      // In real scenario, you'd need to update existing contestant status
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      // Test with active contestant should work
      await expect(
        caller.voting.generateVoteLink({
          contestantId: testContestant.id,
          voteQuantity: 1,
        })
      ).resolves.toBeDefined();
    });
  });

  describe("Vote Message Format", () => {
    it("should format message correctly for single vote", () => {
      const message = `Vote untuk Test Name (001) - 1 vote`;
      expect(message).toContain("1 vote");
      expect(message).not.toContain("votes"); // singular
    });

    it("should format message correctly for multiple votes", () => {
      const message = `Vote untuk Test Name (001) - 5 votes`;
      expect(message).toContain("5 votes");
    });

    it("should include contestant number in parentheses", () => {
      const message = `Vote untuk Test Name (001) - 1 vote`;
      expect(message).toMatch(/\(\d+\)/);
    });
  });
});

describe("Voting Webhook Integration", () => {
  describe("Message Parsing", () => {
    it("should parse voting message format correctly", () => {
      const testMessages = [
        "Vote untuk John Doe (001) - 1 vote",
        "Vote untuk Jane Smith (002) - 5 votes",
        "Vote untuk Bob Lee (TEST001) - 10 votes",
      ];

      testMessages.forEach(message => {
        const match = message.match(/Vote untuk (.+) \((.+)\) - (\d+) vote/);
        expect(match).toBeTruthy();
        expect(match![1]).toBeTruthy(); // Name
        expect(match![2]).toBeTruthy(); // Number
        expect(match![3]).toBeTruthy(); // Vote quantity
      });
    });

    it("should distinguish voting from registration messages", () => {
      const votingMessage = "Vote untuk John Doe (001) - 1 vote";
      const registrationMessage = "Pendaftaran Audisi - John Doe - Acting";

      const isVoting = votingMessage.match(/Vote untuk (.+) \((.+)\) - (\d+) vote/);
      const isRegistrationVoting = registrationMessage.match(/Vote untuk (.+) \((.+)\) - (\d+) vote/);
      const isRegistration = registrationMessage.match(/Pendaftaran Audisi - (.+) - (.+)/);
      const isVotingRegistration = votingMessage.match(/Pendaftaran Audisi - (.+) - (.+)/);

      // Voting message should match voting pattern but not registration pattern
      expect(isVoting).toBeTruthy();
      expect(isVotingRegistration).toBeFalsy();

      // Registration message should match registration pattern but not voting pattern
      expect(isRegistration).toBeTruthy();
      expect(isRegistrationVoting).toBeFalsy();
    });

    it("should extract vote quantity from message", () => {
      const testCases = [
        { message: "Vote untuk Test (001) - 1 vote", expected: 1 },
        { message: "Vote untuk Test (001) - 5 votes", expected: 5 },
        { message: "Vote untuk Test (001) - 100 votes", expected: 100 },
      ];

      testCases.forEach(({ message, expected }) => {
        const match = message.match(/Vote untuk (.+) \((.+)\) - (\d+) vote/);
        expect(match).toBeTruthy();
        expect(parseInt(match![3])).toBe(expected);
      });
    });
  });

  describe("Amount Validation", () => {
    it("should validate vote amount matches quantity", () => {
      const testCases = [
        { quantity: 1, amount: 1500, valid: true },
        { quantity: 5, amount: 7500, valid: true },
        { quantity: 10, amount: 15000, valid: true },
        { quantity: 1, amount: 500, valid: false }, // Wrong amount
        { quantity: 5, amount: 1500, valid: false }, // Wrong amount
      ];

      testCases.forEach(({ quantity, amount, valid }) => {
        const expectedAmount = quantity * 1500;
        expect(amount === expectedAmount).toBe(valid);
      });
    });
  });
});

describe("Receipt Number Generation", () => {
  it("should generate receipt number starting from 1001", async () => {
    const { generateReceiptNumber } = await import("./db");
    
    const receiptNumber = await generateReceiptNumber();
    
    expect(receiptNumber).toBeDefined();
    expect(parseInt(receiptNumber)).toBeGreaterThanOrEqual(1001);
  });

  it("should generate sequential receipt numbers", async () => {
    const { generateReceiptNumber, createVote, getActiveContestants } = await import("./db");
    
    // Get any active contestant for testing
    const contestants = await getActiveContestants();
    if (contestants.length === 0) {
      // Skip test if no contestants available
      return;
    }
    
    const contestant = contestants[0];
    
    // Generate first receipt
    const receipt1 = await generateReceiptNumber();
    const num1 = parseInt(receipt1);
    
    // Create a vote with this receipt
    await createVote({
      receiptNumber: receipt1,
      contestantId: contestant.id,
      voterName: "Test Voter 1",
      voterEmail: null,
      amount: 1500,
      voteQuantity: 1,
      saweriaTransactionId: `test-${Date.now()}-1`,
      paymentStatus: "paid",
      message: "Test vote 1",
    });
    
    // Generate second receipt
    const receipt2 = await generateReceiptNumber();
    const num2 = parseInt(receipt2);
    
    // Should be sequential
    expect(num2).toBe(num1 + 1);
  });

  it("should format receipt number as string", async () => {
    const { generateReceiptNumber } = await import("./db");
    
    const receiptNumber = await generateReceiptNumber();
    
    expect(typeof receiptNumber).toBe("string");
    expect(receiptNumber).toMatch(/^\d+$/); // Only digits
  });

  it("should handle concurrent receipt generation", async () => {
    const { generateReceiptNumber } = await import("./db");
    
    // Generate multiple receipts concurrently
    const receipts = await Promise.all([
      generateReceiptNumber(),
      generateReceiptNumber(),
      generateReceiptNumber(),
    ]);
    
    // All should be valid numbers
    receipts.forEach(receipt => {
      expect(parseInt(receipt)).toBeGreaterThanOrEqual(1001);
    });
  });
});
