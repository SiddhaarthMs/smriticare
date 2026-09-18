import { describe, expect, it } from "vitest";

import {
  buildSkillProfile,
  computeSkillScore,
  recommendDifficulty,
} from "@/lib/adaptive-engine";
import type { Difficulty, GameResult, SkillArea } from "@/lib/types";

function makeResult(overrides: Partial<GameResult> = {}): GameResult {
  return {
    id: "r1",
    gameId: "memory-match",
    gameName: "Memory Match",
    skillArea: "Memory",
    difficulty: 2,
    accuracy: 100,
    responseTimeMs: 5000,
    attempts: 4,
    completion: 100,
    score: 90,
    timestamp: 1000,
    synced: false,
    ...overrides,
  };
}

describe("computeSkillScore", () => {
  it("rewards high accuracy, completion, speed, and few attempts", () => {
    const score = computeSkillScore(
      makeResult({
        accuracy: 100,
        completion: 100,
        responseTimeMs: 1000,
        attempts: 1,
      }),
    );
    expect(score).toBeGreaterThanOrEqual(90);
  });

  it("penalises slow response times", () => {
    const fast = computeSkillScore(makeResult({ responseTimeMs: 1000 }));
    const slow = computeSkillScore(makeResult({ responseTimeMs: 30000 }));
    expect(fast).toBeGreaterThan(slow);
  });
});

describe("buildSkillProfile", () => {
  it("returns a zero score when no results exist for the area", () => {
    const profile = buildSkillProfile("Memory", [], 2);
    expect(profile.score).toBe(0);
    expect(profile.recentResults).toEqual([]);
  });

  it("averages only the most recent results for the matching skill area", () => {
    const results = [
      makeResult({ skillArea: "Memory", accuracy: 100, timestamp: 3000 }),
      makeResult({ skillArea: "Memory", accuracy: 50, timestamp: 2000 }),
      makeResult({ skillArea: "Attention", accuracy: 100, timestamp: 1000 }),
    ];
    const profile = buildSkillProfile("Memory", results, 2);
    expect(profile.recentResults).toHaveLength(2);
    expect(profile.recentResults.every((r) => r.skillArea === "Memory")).toBe(
      true,
    );
  });
});

describe("recommendDifficulty", () => {
  it("stays at the current level when no games have been played", () => {
    const rec = recommendDifficulty("Memory", [], 2);
    expect(rec.direction).toBe("stay");
    expect(rec.recommendedDifficulty).toBe(2);
  });

  it("recommends a higher level for excellent performance", () => {
    const results = [
      makeResult({
        skillArea: "Memory",
        accuracy: 100,
        completion: 100,
        responseTimeMs: 1000,
        attempts: 1,
      }),
    ];
    const rec = recommendDifficulty("Memory", results, 2);
    expect(rec.direction).toBe("up");
    expect(rec.recommendedDifficulty).toBe(3);
  });

  it("recommends a lower level for poor performance above the floor", () => {
    const results = [
      makeResult({
        skillArea: "Memory",
        accuracy: 10,
        completion: 10,
        responseTimeMs: 30000,
        attempts: 10,
      }),
    ];
    const rec = recommendDifficulty("Memory", results, 3);
    expect(rec.direction).toBe("down");
    expect(rec.recommendedDifficulty).toBe(2);
  });

  it("does not lower below level 1", () => {
    const results = [
      makeResult({
        skillArea: "Memory",
        accuracy: 10,
        completion: 10,
        responseTimeMs: 30000,
        attempts: 10,
      }),
    ];
    const rec = recommendDifficulty("Memory", results, 1);
    expect(rec.direction).toBe("stay");
    expect(rec.recommendedDifficulty).toBe(1);
  });

  it("produces a human-readable reason for the recommendation", () => {
    const rec = recommendDifficulty("Memory", [], 2);
    expect(rec.reason.length).toBeGreaterThan(0);
  });
});

describe("recommendDifficulty typing", () => {
  it("keeps recommended difficulty within the Difficulty union", () => {
    const rec = recommendDifficulty("Memory", [], 2 as Difficulty);
    const valid: Difficulty[] = [1, 2, 3, 4, 5];
    expect(valid).toContain(rec.recommendedDifficulty);
  });
});
