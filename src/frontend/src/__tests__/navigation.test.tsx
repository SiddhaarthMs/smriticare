import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { DEFAULT_ACCESSIBILITY } from "@/lib/accessibility";
import { DEMO_REMINDERS } from "@/lib/demo-data";
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

describe("LandingPage", () => {
  it("loads without a blank screen and shows the hero tagline and headline", async () => {
    await renderAtPath("/");
    expect(screen.getByText("Remember. Engage. Connect.")).toBeInTheDocument();
    expect(
      screen.getByText(
        "An AI-powered companion for memory, routine and connection.",
      ),
    ).toBeInTheDocument();
  });

  it("navigates to Elder Mode via the 'Try Elder Mode' button", async () => {
    const user = userEvent.setup();
    await renderAtPath("/");
    await user.click(screen.getAllByTestId("landing.elder_button")[0]);
    expect(
      screen.getAllByText(/Good morning|Good afternoon|Good evening/).length,
    ).toBeGreaterThan(0);
  });

  it("navigates to the Caregiver Dashboard via its button", async () => {
    const user = userEvent.setup();
    await renderAtPath("/");
    await user.click(screen.getAllByTestId("landing.caregiver_button")[0]);
    expect(screen.getByText(/Asha Devi · 72/i)).toBeInTheDocument();
  });
});

describe("RoleSelectionPage", () => {
  it("shows three DEMO-labelled role cards", async () => {
    await renderAtPath("/role");
    expect(screen.getByText("Elderly User")).toBeInTheDocument();
    expect(screen.getByText("Caregiver")).toBeInTheDocument();
    expect(screen.getByText("Healthcare Worker")).toBeInTheDocument();
    // Each card carries a DEMO badge.
    expect(screen.getAllByText("Demo data").length).toBeGreaterThanOrEqual(3);
  });

  it("enters the Elderly dashboard from the Elderly User card", async () => {
    const user = userEvent.setup();
    await renderAtPath("/role");
    await user.click(screen.getAllByTestId("role.elderly")[0]);
    expect(useAppStore.getState().role).toBe("elderly");
    expect(
      screen.getAllByText(/Good morning|Good afternoon|Good evening/).length,
    ).toBeGreaterThan(0);
  });

  it("enters the Caregiver dashboard from the Caregiver card", async () => {
    const user = userEvent.setup();
    await renderAtPath("/role");
    await user.click(screen.getAllByTestId("role.caregiver")[0]);
    expect(useAppStore.getState().role).toBe("caregiver");
    expect(screen.getByText(/Asha Devi · 72/i)).toBeInTheDocument();
  });

  it("enters the Healthcare Worker dashboard from its card", async () => {
    const user = userEvent.setup();
    await renderAtPath("/role");
    await user.click(screen.getAllByTestId("role.healthcare-worker")[0]);
    expect(useAppStore.getState().role).toBe("healthcare-worker");
    expect(screen.getByText(/Kamrup, Assam/i)).toBeInTheDocument();
  });
});
