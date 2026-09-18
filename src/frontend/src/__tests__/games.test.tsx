import { cleanup, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { DEFAULT_ACCESSIBILITY } from "@/lib/accessibility";
import { DEMO_GAMES, DEMO_REMINDERS } from "@/lib/demo-data";
import { useAppStore } from "@/lib/store";
import type { AIJourney } from "@/lib/types";
import { renderAtPath } from "@/test/test-utils";

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
  cleanup();
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

describe("Game catalog", () => {
  it("lists Story Time and Mood Check as distinct selectable games", async () => {
    await renderAtPath("/brain-gym");
    expect(screen.getByText("Story Time")).toBeInTheDocument();
    expect(screen.getByText("Mood Check")).toBeInTheDocument();
    // Both are distinct catalog entries with their own routes.
    expect(screen.getByTestId("braingym.game.engagement")).toBeInTheDocument();
    expect(screen.getByTestId("braingym.game.mood-check")).toBeInTheDocument();
  });

  it("routes Story Time to a distinct story-recall game", async () => {
    await renderAtPath("/games/engagement");
    // Story Time renders the story and its recall questions, not the mood picker.
    expect(screen.getByText("Asha Devi's Day")).toBeInTheDocument();
    expect(
      screen.getByText(/Every morning, Asha Devi wakes up early/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("How are you feeling today?"),
    ).not.toBeInTheDocument();
  });

  it("routes Mood Check to a distinct mood game", async () => {
    await renderAtPath("/games/mood-check");
    // Mood Check renders the mood picker, not the story.
    expect(screen.getByText("How are you feeling today?")).toBeInTheDocument();
    expect(screen.queryByText("Asha Devi's Day")).not.toBeInTheDocument();
  });

  it("catalog exposes both engagement games with the Engagement skill area", () => {
    const engagementGames = DEMO_GAMES.filter(
      (g) => g.skillArea === "Engagement",
    );
    expect(engagementGames.map((g) => g.id).sort()).toEqual([
      "engagement",
      "mood-check",
    ]);
  });
});
