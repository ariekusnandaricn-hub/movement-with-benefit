import { describe, it, expect } from "vitest";

describe("Voting Percentage Calculation", () => {
  it("should calculate correct percentage with multiple contestants", () => {
    const contestants = [
      { id: 1, name: "A", voteCount: 50 },
      { id: 2, name: "B", voteCount: 30 },
      { id: 3, name: "C", voteCount: 20 },
    ];

    const totalVotes = contestants.reduce((sum, c) => sum + c.voteCount, 0);
    expect(totalVotes).toBe(100);

    const percentages = contestants.map(c => ({
      ...c,
      votePercentage: (c.voteCount / totalVotes) * 100,
    }));

    expect(percentages[0].votePercentage).toBe(50);
    expect(percentages[1].votePercentage).toBe(30);
    expect(percentages[2].votePercentage).toBe(20);
  });

  it("should handle zero total votes", () => {
    const contestants = [
      { id: 1, name: "A", voteCount: 0 },
      { id: 2, name: "B", voteCount: 0 },
    ];

    const totalVotes = contestants.reduce((sum, c) => sum + c.voteCount, 0);
    expect(totalVotes).toBe(0);

    const percentages = contestants.map(c => ({
      ...c,
      votePercentage: totalVotes > 0 ? (c.voteCount / totalVotes) * 100 : 0,
    }));

    expect(percentages[0].votePercentage).toBe(0);
    expect(percentages[1].votePercentage).toBe(0);
  });

  it("should calculate correct percentage with decimal values", () => {
    const contestants = [
      { id: 1, name: "A", voteCount: 33 },
      { id: 2, name: "B", voteCount: 33 },
      { id: 3, name: "C", voteCount: 34 },
    ];

    const totalVotes = contestants.reduce((sum, c) => sum + c.voteCount, 0);
    expect(totalVotes).toBe(100);

    const percentages = contestants.map(c => ({
      ...c,
      votePercentage: (c.voteCount / totalVotes) * 100,
    }));

    expect(percentages[0].votePercentage).toBeCloseTo(33, 0);
    expect(percentages[1].votePercentage).toBeCloseTo(33, 0);
    expect(percentages[2].votePercentage).toBeCloseTo(34, 0);
  });

  it("should sum all percentages to 100%", () => {
    const contestants = [
      { id: 1, name: "A", voteCount: 25 },
      { id: 2, name: "B", voteCount: 35 },
      { id: 3, name: "C", voteCount: 40 },
    ];

    const totalVotes = contestants.reduce((sum, c) => sum + c.voteCount, 0);
    const percentages = contestants.map(c => ({
      ...c,
      votePercentage: (c.voteCount / totalVotes) * 100,
    }));

    const sumPercentages = percentages.reduce((sum, c) => sum + c.votePercentage, 0);
    expect(sumPercentages).toBeCloseTo(100, 10);
  });

  it("should handle single contestant with all votes", () => {
    const contestants = [
      { id: 1, name: "A", voteCount: 100 },
    ];

    const totalVotes = contestants.reduce((sum, c) => sum + c.voteCount, 0);
    const percentages = contestants.map(c => ({
      ...c,
      votePercentage: (c.voteCount / totalVotes) * 100,
    }));

    expect(percentages[0].votePercentage).toBe(100);
  });

  it("should sort contestants by vote count descending", () => {
    const contestants = [
      { id: 1, name: "A", voteCount: 20 },
      { id: 2, name: "B", voteCount: 50 },
      { id: 3, name: "C", voteCount: 30 },
    ];

    const sorted = [...contestants].sort((a, b) => b.voteCount - a.voteCount);

    expect(sorted[0].voteCount).toBe(50);
    expect(sorted[1].voteCount).toBe(30);
    expect(sorted[2].voteCount).toBe(20);
  });

  it("should handle large vote numbers", () => {
    const contestants = [
      { id: 1, name: "A", voteCount: 1000000 },
      { id: 2, name: "B", voteCount: 500000 },
    ];

    const totalVotes = contestants.reduce((sum, c) => sum + c.voteCount, 0);
    const percentages = contestants.map(c => ({
      ...c,
      votePercentage: (c.voteCount / totalVotes) * 100,
    }));

    expect(percentages[0].votePercentage).toBeCloseTo(66.67, 2);
    expect(percentages[1].votePercentage).toBeCloseTo(33.33, 2);
  });
});
