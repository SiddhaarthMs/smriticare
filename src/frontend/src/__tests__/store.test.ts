import { beforeEach, describe, expect, it } from "vitest";

import { DEFAULT_ACCESSIBILITY } from "@/lib/accessibility";
import { DEMO_REMINDERS } from "@/lib/demo-data";
import { useAppStore } from "@/lib/store";
import type { AIJourney, GameResult } from "@/lib/types";

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

const INITIAL_JOURNEY: AIJourney = {
  skillScores: {
    Memory: 0,
    Attention: 0,
    Recognition: 0,
    RoutineRecall: 0,
    Engagement: 0,
  },
  recommendedDifficulty: {
    Memory: 2,
    Attention: 2,
    Recognition: 2,
    RoutineRecall: 2,
    Engagement: 1,
  },
  totalGames: 0,
  streak: 0,
  lastPlayed: null,
  weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
};

beforeEach(() => {
  useAppStore.setState({
    role: "guest",
    language: "en",
    accessibility: DEFAULT_ACCESSIBILITY,
    reminders: DEMO_REMINDERS,
    gameResults: [],
    journey: INITIAL_JOURNEY,
    moodEntries: [],
    currentMood: null,
    selectedPackId: "nature",
  });
});

describe("addGameResult", () => {
  it("records the result and increments the total game count", () => {
    useAppStore.getState().addGameResult(makeResult());
    const state = useAppStore.getState();
    expect(state.gameResults).toHaveLength(1);
    expect(state.journey.totalGames).toBe(1);
  });

  it("updates the skill score for the played area", () => {
    useAppStore
      .getState()
      .addGameResult(makeResult({ skillArea: "Memory", accuracy: 100 }));
    const score = useAppStore.getState().journey.skillScores.Memory;
    expect(score).toBeGreaterThan(0);
  });

  it("updates the recommended difficulty so the AI recommendation reflects the new result", () => {
    // Excellent performance should nudge the Memory difficulty up.
    useAppStore.getState().addGameResult(
      makeResult({
        skillArea: "Memory",
        accuracy: 100,
        completion: 100,
        responseTimeMs: 1000,
        attempts: 1,
      }),
    );
    const recommended =
      useAppStore.getState().journey.recommendedDifficulty.Memory;
    expect(recommended).toBeGreaterThanOrEqual(2);
  });

  it("does not change the recommended difficulty of an unplayed area", () => {
    useAppStore.getState().addGameResult(makeResult({ skillArea: "Memory" }));
    const attention =
      useAppStore.getState().journey.recommendedDifficulty.Attention;
    expect(attention).toBe(2);
  });
});

describe("reminders", () => {
  it("adds a reminder", () => {
    useAppStore.getState().addReminder({
      id: "rem-new",
      title: "Evening tea",
      time: "18:00",
      days: ["Mon"],
      category: "other",
      icon: "⏰",
      enabled: true,
    });
    const titles = useAppStore.getState().reminders.map((r) => r.title);
    expect(titles).toContain("Evening tea");
  });

  it("toggles a reminder's enabled state", () => {
    const before = useAppStore
      .getState()
      .reminders.find((r) => r.id === "rem-1")!.enabled;
    useAppStore.getState().toggleReminder("rem-1");
    const after = useAppStore
      .getState()
      .reminders.find((r) => r.id === "rem-1")!.enabled;
    expect(after).toBe(!before);
  });

  it("removes a reminder", () => {
    useAppStore.getState().removeReminder("rem-1");
    const ids = useAppStore.getState().reminders.map((r) => r.id);
    expect(ids).not.toContain("rem-1");
  });
});

describe("mood", () => {
  it("records a mood entry for today", () => {
    useAppStore.getState().setMood("happy");
    const state = useAppStore.getState();
    expect(state.currentMood).toBe("happy");
    expect(state.moodEntries).toHaveLength(1);
    expect(state.moodEntries[0].mood).toBe("happy");
  });
});

describe("selected pack", () => {
  it("stores the selected Familiar Memories pack", () => {
    useAppStore.getState().setSelectedPack("festivals");
    expect(useAppStore.getState().selectedPackId).toBe("festivals");
  });
});
