import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { DEFAULT_ACCESSIBILITY } from "@/lib/accessibility";
import { DEMO_CAREGIVER_PATIENTS, DEMO_REMINDERS } from "@/lib/demo-data";
import { useAppStore } from "@/lib/store";
import type { AIJourney, GameResult } from "@/lib/types";
import { CaregiverDashboardPage } from "@/pages/CaregiverDashboardPage";
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

function makeResult(overrides: Partial<GameResult> = {}): GameResult {
  return {
    id: "g-caregiver-1",
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

function resetStore() {
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
}

beforeEach(() => {
  cleanup();
  resetStore();
});

describe("Caregiver dashboard route", () => {
  it("loads at /caregiver without a blank screen and shows the page header", async () => {
    await renderAtPath("/caregiver");
    expect(screen.getByText(/Asha Devi · 72/i)).toBeInTheDocument();
    // The dashboard title comes from the i18n dictionary.
    expect(screen.getByText("Caregiver Dashboard")).toBeInTheDocument();
  });

  it("renders every dashboard section anchor", async () => {
    await renderAtPath("/caregiver");
    for (const id of [
      "overview",
      "patients",
      "activity",
      "games",
      "routine",
      "reminders",
      "alerts",
      "reports",
      "settings",
    ]) {
      expect(screen.getByTestId(`caregiver.section.${id}`)).toBeInTheDocument();
    }
  });

  it("exposes an in-page navigation link for each section", async () => {
    await renderAtPath("/caregiver");
    const nav = screen.getByRole("navigation", { name: "Dashboard sections" });
    for (const id of [
      "overview",
      "patients",
      "activity",
      "games",
      "routine",
      "reminders",
      "alerts",
      "reports",
      "settings",
    ]) {
      expect(
        within(nav).getByTestId(`caregiver.nav.${id}`),
      ).toBeInTheDocument();
    }
  });
});

describe("Caregiver dashboard overview", () => {
  it("shows the four stat cards with their demo values when no games are played", () => {
    render(<CaregiverDashboardPage />);
    expect(screen.getByText("Cognitive Engagement")).toBeInTheDocument();
    expect(screen.getByText("Activities")).toBeInTheDocument();
    expect(screen.getByText("Average Session")).toBeInTheDocument();
    expect(screen.getByText("Game Accuracy")).toBeInTheDocument();
    expect(screen.getByText("78%")).toBeInTheDocument();
    expect(screen.getByText("12/15")).toBeInTheDocument();
    expect(screen.getByText("8m 42s")).toBeInTheDocument();
    expect(screen.getByText("84%")).toBeInTheDocument();
  });

  it("derives the stat cards from real game results once games are played", () => {
    useAppStore.getState().addGameResult(
      makeResult({
        id: "g-a",
        accuracy: 100,
        responseTimeMs: 6000,
        skillArea: "Memory",
      }),
    );
    useAppStore.getState().addGameResult(
      makeResult({
        id: "g-b",
        accuracy: 80,
        responseTimeMs: 12000,
        skillArea: "Attention",
      }),
    );
    render(<CaregiverDashboardPage />);
    // Two results: activities 2/15, average accuracy 90%, average session 9s.
    expect(screen.getByText("2/15")).toBeInTheDocument();
    expect(screen.getByText("90%")).toBeInTheDocument();
    expect(screen.getByText("0m 9s")).toBeInTheDocument();
  });

  it("shows the reminder completion ring and the active reminder count", () => {
    render(<CaregiverDashboardPage />);
    expect(screen.getByText("Reminder completion")).toBeInTheDocument();
    expect(
      screen.getByText(
        `${DEMO_REMINDERS.length} of ${DEMO_REMINDERS.length} reminders active this week.`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: "Reminders" }),
    ).toBeInTheDocument();
  });

  it("shows today's mood card reflecting the stored current mood", () => {
    useAppStore.getState().setMood("calm");
    render(<CaregiverDashboardPage />);
    expect(screen.getByText("Today's mood")).toBeInTheDocument();
    expect(screen.getByText("calm")).toBeInTheDocument();
  });
});

describe("Caregiver dashboard patients", () => {
  it("renders a card for each demo patient with adherence, games, and streak", () => {
    render(<CaregiverDashboardPage />);
    for (const patient of DEMO_CAREGIVER_PATIENTS) {
      const card = screen.getByTestId(`caregiver.patient.${patient.id}`);
      expect(within(card).getByText(patient.name)).toBeInTheDocument();
      expect(
        within(card).getByText(`${patient.adherence}%`),
      ).toBeInTheDocument();
      expect(
        within(card).getByText(String(patient.gamesPlayed)),
      ).toBeInTheDocument();
      expect(
        within(card).getByText(String(patient.streak)),
      ).toBeInTheDocument();
    }
  });
});

describe("Caregiver dashboard reminders", () => {
  it("toggles a reminder between Active and Paused and updates the store", async () => {
    const user = userEvent.setup();
    render(<CaregiverDashboardPage />);
    const toggle = screen.getByTestId("caregiver.reminder.toggle.rem-1");
    expect(toggle).toHaveTextContent("Active");

    await user.click(toggle);
    expect(
      useAppStore.getState().reminders.find((r) => r.id === "rem-1")?.enabled,
    ).toBe(false);
    expect(toggle).toHaveTextContent("Paused");
  });
});

describe("Caregiver dashboard alerts", () => {
  it("shows a confirmation toast for an alert action and dismisses it", async () => {
    const user = userEvent.setup();
    render(<CaregiverDashboardPage />);
    await user.click(
      screen.getByTestId("caregiver.alert.action.alert-missed.send_reminder"),
    );
    const toast = screen.getByTestId("caregiver.confirmation_toast");
    expect(
      within(toast).getByText(
        /A gentle reminder has been sent to Asha's device/i,
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByTestId("caregiver.confirmation_close"));
    expect(
      screen.queryByTestId("caregiver.confirmation_toast"),
    ).not.toBeInTheDocument();
  });

  it("shows the care preferences settings action with its confirmation", async () => {
    const user = userEvent.setup();
    render(<CaregiverDashboardPage />);
    await user.click(screen.getByTestId("caregiver.settings_button"));
    expect(screen.getByText("Opening care settings…")).toBeInTheDocument();
  });
});

describe("Caregiver dashboard games", () => {
  it("shows the empty state when no games have been played", () => {
    render(<CaregiverDashboardPage />);
    expect(
      screen.getByTestId("caregiver.games.empty_state"),
    ).toBeInTheDocument();
    expect(screen.getByText(/No games played yet/i)).toBeInTheDocument();
  });

  it("lists recent results and adaptive difficulty recommendations", () => {
    useAppStore
      .getState()
      .addGameResult(
        makeResult({ id: "g-recent", gameName: "Memory Match", score: 91 }),
      );
    render(<CaregiverDashboardPage />);
    expect(
      screen.queryByTestId("caregiver.games.empty_state"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("caregiver.game.g-recent")).toBeInTheDocument();
    expect(screen.getByText("91")).toBeInTheDocument();
    expect(screen.getByText("Adaptive difficulty")).toBeInTheDocument();
    expect(
      screen.getByTestId("caregiver.difficulty.Memory"),
    ).toBeInTheDocument();
  });
});

describe("Caregiver dashboard routine", () => {
  it("lists the demo routine items sorted by time", () => {
    render(<CaregiverDashboardPage />);
    for (const reminder of DEMO_REMINDERS) {
      expect(
        screen.getByTestId(`caregiver.routine.${reminder.id}`),
      ).toBeInTheDocument();
    }
  });
});

describe("Caregiver dashboard chart data seams", () => {
  it("increments the weekly activity bucket for today when a game result is added", () => {
    const today = new Date().getDay();
    const before = useAppStore.getState().journey.weeklyActivity[today];
    useAppStore.getState().addGameResult(makeResult({ id: "g-week" }));
    expect(useAppStore.getState().journey.weeklyActivity[today]).toBe(
      before + 1,
    );
  });

  it("records a mood entry that the mood trend can read", () => {
    useAppStore.getState().setMood("happy");
    const entries = useAppStore.getState().moodEntries;
    expect(entries).toHaveLength(1);
    expect(entries[0].mood).toBe("happy");
    expect(entries[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
