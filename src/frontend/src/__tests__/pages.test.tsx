import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { GameResultScreen } from "@/components/ui/GameResultScreen";
import { ReminderCard } from "@/components/ui/ReminderCard";
import { DEFAULT_ACCESSIBILITY } from "@/lib/accessibility";
import { DEMO_REMINDERS } from "@/lib/demo-data";
import { useAppStore } from "@/lib/store";
import type { AIJourney, GameResult } from "@/lib/types";
import { AIJourneyPage } from "@/pages/AIJourneyPage";
import { CaregiverDashboardPage } from "@/pages/CaregiverDashboardPage";
import { HealthcareDashboardPage } from "@/pages/HealthcareDashboardPage";
import { MyDayPage } from "@/pages/MyDayPage";
import { SettingsPage } from "@/pages/SettingsPage";

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
  resetStore();
});

describe("SettingsPage", () => {
  it("shows the medical disclaimer", () => {
    render(<SettingsPage />);
    expect(screen.getByText("Medical disclaimer")).toBeInTheDocument();
    expect(
      screen.getByText(
        /does not diagnose dementia or replace professional healthcare/i,
      ),
    ).toBeInTheDocument();
  });

  it("changes the text size setting when a size button is pressed", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);
    await user.click(screen.getByTestId("settings.textsize.large"));
    expect(useAppStore.getState().accessibility.textSize).toBe("large");
  });

  it("toggles high contrast", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);
    await user.click(screen.getByTestId("settings.highcontrast.toggle"));
    expect(useAppStore.getState().accessibility.highContrast).toBe(true);
  });

  it("toggles reduce animation", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);
    await user.click(screen.getByTestId("settings.reduceanimation.toggle"));
    expect(useAppStore.getState().accessibility.reduceAnimation).toBe(true);
  });

  it("changes the reminder volume via the slider", () => {
    render(<SettingsPage />);
    const slider = screen.getByTestId("settings.volume.slider");
    fireEvent.change(slider, { target: { value: "50" } });
    expect(useAppStore.getState().accessibility.reminderVolume).toBe(50);
  });

  it("switches the language", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);
    await user.click(screen.getByTestId("settings.language.hi"));
    expect(useAppStore.getState().language).toBe("hi");
  });

  it("shows a voice on/off badge that changes with the voice assistance setting", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);
    expect(screen.getByText("Voice off")).toBeInTheDocument();
    await user.click(screen.getByTestId("settings.voice.toggle"));
    expect(useAppStore.getState().accessibility.voiceAssistance).toBe(true);
    expect(screen.getByText("Voice on")).toBeInTheDocument();
    expect(screen.queryByText("Voice off")).not.toBeInTheDocument();
  });

  it("shows a volume level pill that changes with the reminder volume slider", () => {
    render(<SettingsPage />);
    // Default volume 70 maps to "Medium".
    expect(screen.getByText("Medium")).toBeInTheDocument();
    const slider = screen.getByTestId("settings.volume.slider");
    fireEvent.change(slider, { target: { value: "20" } });
    expect(useAppStore.getState().accessibility.reminderVolume).toBe(20);
    expect(screen.getByText("Low")).toBeInTheDocument();
  });
});

describe("HealthcareDashboardPage", () => {
  it("shows all 8 NE states in the regional breakdown", () => {
    render(<HealthcareDashboardPage />);
    const table = screen.getByRole("table");
    for (const state of [
      "Assam",
      "Meghalaya",
      "Mizoram",
      "Manipur",
      "Nagaland",
      "Tripura",
      "Arunachal Pradesh",
      "Sikkim",
    ]) {
      expect(within(table).getByText(state)).toBeInTheDocument();
    }
  });

  it("labels the dashboard as demo data", () => {
    render(<HealthcareDashboardPage />);
    expect(screen.getAllByText(/Demo data/i).length).toBeGreaterThan(0);
  });

  it("expands a state row to show its detail", async () => {
    const user = userEvent.setup();
    render(<HealthcareDashboardPage />);
    await user.click(screen.getByTestId("healthcare.state_toggle.1"));
    expect(screen.getByTestId("healthcare.state_detail.1")).toBeInTheDocument();
  });
});

describe("AIJourneyPage", () => {
  it("shows the five skill areas", () => {
    render(<AIJourneyPage />);
    for (const area of [
      "Memory",
      "Attention",
      "Recognition",
      "Routine Recall",
      "Engagement",
    ]) {
      expect(screen.getAllByText(area).length).toBeGreaterThan(0);
    }
  });

  it("shows the 'Why this recommendation?' explainability section labelled Prototype Logic", () => {
    render(<AIJourneyPage />);
    expect(screen.getByText("Why this recommendation?")).toBeInTheDocument();
    expect(screen.getAllByText(/Prototype Logic/i).length).toBeGreaterThan(0);
    expect(screen.getByText("How SmritiCare Adapts")).toBeInTheDocument();
  });

  it("shows a difficulty recommendation for each area", () => {
    render(<AIJourneyPage />);
    // Each area row has a "Level N" recommendation badge.
    const levelBadges = screen.getAllByText(/^Level \d$/);
    expect(levelBadges.length).toBeGreaterThanOrEqual(5);
  });
});

describe("CaregiverDashboardPage", () => {
  it("shows Asha Devi's stats", () => {
    render(<CaregiverDashboardPage />);
    expect(screen.getByText(/Asha Devi · 72/i)).toBeInTheDocument();
    expect(screen.getByText("Cognitive Engagement")).toBeInTheDocument();
    expect(screen.getByText("Game Accuracy")).toBeInTheDocument();
  });

  it("shows alerts with working actions", async () => {
    const user = userEvent.setup();
    render(<CaregiverDashboardPage />);
    const sendReminder = screen.getByTestId(
      "caregiver.alert.action.alert-missed.send_reminder",
    );
    await user.click(sendReminder);
    expect(
      screen.getByText(/A gentle reminder has been sent to Asha's device/i),
    ).toBeInTheDocument();
  });

  it("shows the engagement and mood trend sections", () => {
    render(<CaregiverDashboardPage />);
    expect(screen.getByText("Engagement trend")).toBeInTheDocument();
    expect(screen.getByText("Mood trend")).toBeInTheDocument();
  });

  it("reflects a newly played game result in the recent results list", () => {
    useAppStore.getState().addGameResult({
      id: "g-new",
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
    });
    render(<CaregiverDashboardPage />);
    expect(screen.getByText("Memory Match")).toBeInTheDocument();
    expect(screen.getByText("90")).toBeInTheDocument();
  });
});

describe("MyDayPage", () => {
  it("adds a reminder and shows it in the reminders list", async () => {
    const user = userEvent.setup();
    render(<MyDayPage />);
    await user.type(screen.getByTestId("myday.title_input"), "Evening tea");
    await user.click(screen.getByTestId("myday.add_button"));
    expect(screen.getAllByText("Evening tea").length).toBeGreaterThan(0);
    expect(
      useAppStore.getState().reminders.some((r) => r.title === "Evening tea"),
    ).toBe(true);
  });

  it("marks a routine item done", async () => {
    const user = userEvent.setup();
    render(<MyDayPage />);
    await user.click(screen.getByTestId("myday.done.rt-1"));
    expect(screen.getByTestId("myday.done.rt-1")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("marks a routine item to remind later", async () => {
    const user = userEvent.setup();
    render(<MyDayPage />);
    await user.click(screen.getByTestId("myday.later.rt-1"));
    expect(screen.getByTestId("myday.later.rt-1")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});

describe("ReminderCard accessibility indicators", () => {
  it("shows a voice indicator on the reminder when voice assistance is on", () => {
    useAppStore.getState().updateAccessibility({ voiceAssistance: true });
    const reminder = useAppStore.getState().reminders[0];
    render(<ReminderCard reminder={reminder} />);
    expect(
      screen.getByTestId(`reminder.voice.${reminder.id}`),
    ).toBeInTheDocument();
    expect(screen.getByText("Voice on")).toBeInTheDocument();
  });

  it("hides the voice indicator when voice assistance is off", () => {
    useAppStore.getState().updateAccessibility({ voiceAssistance: false });
    const reminder = useAppStore.getState().reminders[0];
    render(<ReminderCard reminder={reminder} />);
    expect(
      screen.queryByTestId(`reminder.voice.${reminder.id}`),
    ).not.toBeInTheDocument();
  });

  it("shows the volume level pill that reflects the reminder volume setting", () => {
    useAppStore.getState().updateAccessibility({ reminderVolume: 20 });
    const reminder = useAppStore.getState().reminders[0];
    render(<ReminderCard reminder={reminder} />);
    expect(
      screen.getByTestId(`reminder.volume.${reminder.id}`),
    ).toHaveTextContent("Low");
  });
});

describe("GameResultScreen", () => {
  it("shows the 'Wonderful! 🌟' result screen with metrics", () => {
    const result: GameResult = {
      id: "g1",
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
    };
    render(
      <GameResultScreen
        result={result}
        onPlayAgain={() => {}}
        onHome={() => {}}
      />,
    );
    expect(screen.getByText("Wonderful!")).toBeInTheDocument();
    expect(screen.getByText("Memory Match")).toBeInTheDocument();
    expect(screen.getAllByText("100%").length).toBeGreaterThan(0);
    expect(screen.getByText("4")).toBeInTheDocument();
  });
});
