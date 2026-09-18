import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { cloneElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_ACCESSIBILITY } from "@/lib/accessibility";
import { DEMO_REMINDERS } from "@/lib/demo-data";
import { useAppStore } from "@/lib/store";
import type { AIJourney, GameResult } from "@/lib/types";
import { CaregiverDashboardPage } from "@/pages/CaregiverDashboardPage";
import { renderAtPath } from "@/test/test-utils";

/**
 * jsdom gives every element a zero-size box, so recharts' ResponsiveContainer
 * refuses to paint and the suite would only ever see an empty container. This
 * file-local mock hands the chart an explicit size so the rendered bars, areas,
 * lines, axes, and gridlines are observable. It is scoped to this file and does
 * not mutate any global, so it cannot leak into other suites.
 */
vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>();
  return {
    ...actual,
    ResponsiveContainer: ({
      children,
    }: {
      children: ReactElement<{ width?: number; height?: number }>;
    }) => cloneElement(children, { width: 640, height: 288 }),
  };
});

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
    id: "g-chart-1",
    gameId: "memory-match",
    gameName: "Memory Match",
    skillArea: "Memory",
    difficulty: 2,
    accuracy: 100,
    responseTimeMs: 5000,
    attempts: 4,
    completion: 100,
    score: 90,
    timestamp: Date.now(),
    synced: false,
    ...overrides,
  };
}

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

function chart(ocid: string): HTMLElement {
  return screen.getByTestId(ocid);
}

describe("Caregiver dashboard chart cards", () => {
  it("renders every chart card with its title and description", () => {
    render(<CaregiverDashboardPage />);

    const cards: { ocid: string; title: string; description: string }[] = [
      {
        ocid: "caregiver.chart.adherence",
        title: "Patient adherence comparison",
        description:
          "Reminder adherence across the people in your care this week.",
      },
      {
        ocid: "caregiver.chart.activity",
        title: "Games completed",
        description: "How many cognitive games Asha finished each day.",
      },
      {
        ocid: "caregiver.chart.engagement",
        title: "Engagement trend",
        description: "Cognitive engagement and game accuracy across the week.",
      },
      {
        ocid: "caregiver.chart.mood",
        title: "Mood trend",
        description: "Asha's daily mood score from 1 (tired) to 5 (happy).",
      },
    ];

    for (const { ocid, title, description } of cards) {
      const card = chart(ocid);
      expect(within(card).getByText(title)).toBeInTheDocument();
      expect(within(card).getByText(description)).toBeInTheDocument();
    }
  });

  it("paints visible bars, areas, lines, axes, and gridlines on first load", () => {
    const { container } = render(<CaregiverDashboardPage />);

    // Adherence bar chart, engagement area chart, and mood line chart all have
    // data on first load; the activity chart is empty until a game is played.
    expect(
      container.querySelectorAll(
        "[data-ocid='caregiver.chart.adherence'] svg.recharts-surface",
      ),
    ).toHaveLength(1);
    expect(
      container.querySelectorAll(
        "[data-ocid='caregiver.chart.adherence'] .recharts-bar-rectangle",
      ).length,
    ).toBeGreaterThan(0);
    expect(
      container.querySelectorAll(
        "[data-ocid='caregiver.chart.engagement'] .recharts-area-area",
      ).length,
    ).toBeGreaterThan(0);
    expect(
      container.querySelectorAll(
        "[data-ocid='caregiver.chart.mood'] .recharts-line-curve",
      ).length,
    ).toBeGreaterThan(0);

    // Labeled axes and gridlines are present on every painted chart.
    for (const ocid of [
      "caregiver.chart.adherence",
      "caregiver.chart.engagement",
      "caregiver.chart.mood",
    ]) {
      const card = chart(ocid);
      expect(
        card.querySelectorAll(".recharts-cartesian-axis-tick").length,
      ).toBeGreaterThan(0);
      expect(
        card.querySelectorAll(".recharts-cartesian-grid").length,
      ).toBeGreaterThan(0);
    }
  });

  it("gives each chart a resolved pixel height so it is not a blank box", () => {
    render(<CaregiverDashboardPage />);
    for (const ocid of [
      "caregiver.chart.adherence",
      "caregiver.chart.activity",
      "caregiver.chart.engagement",
      "caregiver.chart.mood",
    ]) {
      const card = chart(ocid);
      const sized = card.querySelector<HTMLElement>("[style*='height']");
      expect(sized).not.toBeNull();
      expect(sized?.style.height).toMatch(/^\d+px$/);
    }
  });
});

describe("Caregiver dashboard chart legends", () => {
  it("shows a legend for each chart identifying its series", () => {
    // The activity chart only paints (and therefore only shows its legend)
    // once there is at least one game result.
    useAppStore.getState().addGameResult(makeResult());
    render(<CaregiverDashboardPage />);

    const adherenceLegend = chart("caregiver.chart.adherence.legend");
    expect(
      within(adherenceLegend).getByText("Adherence %"),
    ).toBeInTheDocument();

    const activityLegend = chart("caregiver.chart.activity.legend");
    expect(
      within(activityLegend).getByText("Games played"),
    ).toBeInTheDocument();

    const engagementLegend = chart("caregiver.chart.engagement.legend");
    expect(
      within(engagementLegend).getByText("Engagement %"),
    ).toBeInTheDocument();
    expect(
      within(engagementLegend).getByText("Accuracy %"),
    ).toBeInTheDocument();

    const moodLegend = chart("caregiver.chart.mood.legend");
    expect(within(moodLegend).getByText("Mood score")).toBeInTheDocument();
  });

  it("toggles a series off and back on when its legend entry is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(<CaregiverDashboardPage />);

    const lineCount = () =>
      container.querySelectorAll(
        "[data-ocid='caregiver.chart.mood'] .recharts-line-curve",
      ).length;
    const legendEntry = chart("caregiver.chart.mood.legend.mood");

    expect(legendEntry).toHaveAttribute("aria-pressed", "true");
    expect(lineCount()).toBeGreaterThan(0);

    await user.click(legendEntry);
    expect(legendEntry).toHaveAttribute("aria-pressed", "false");
    expect(lineCount()).toBe(0);

    await user.click(legendEntry);
    expect(legendEntry).toHaveAttribute("aria-pressed", "true");
    expect(lineCount()).toBeGreaterThan(0);
  });

  it("toggles the engagement accuracy series independently of engagement", async () => {
    const user = userEvent.setup();
    const { container } = render(<CaregiverDashboardPage />);

    const areaCount = () =>
      container.querySelectorAll(
        "[data-ocid='caregiver.chart.engagement'] .recharts-area-area",
      ).length;
    const accuracyEntry = chart("caregiver.chart.engagement.legend.accuracy");

    // Only the engagement series is visible until the metric switch changes.
    expect(areaCount()).toBe(1);
    await user.click(accuracyEntry);
    expect(accuracyEntry).toHaveAttribute("aria-pressed", "false");
    expect(areaCount()).toBe(1);
  });
});

describe("Caregiver dashboard chart view switches", () => {
  it("switches the activity chart between weekly and monthly views", async () => {
    const user = userEvent.setup();
    // The activity chart needs data before it paints its axis labels.
    useAppStore.getState().addGameResult(makeResult());
    render(<CaregiverDashboardPage />);

    const weekly = chart("caregiver.chart.activity.view.weekly");
    const monthly = chart("caregiver.chart.activity.view.monthly");
    const activityCard = chart("caregiver.chart.activity");

    expect(weekly).toHaveAttribute("aria-pressed", "true");
    expect(monthly).toHaveAttribute("aria-pressed", "false");
    expect(within(activityCard).getByText("Sun")).toBeInTheDocument();

    await user.click(monthly);
    expect(monthly).toHaveAttribute("aria-pressed", "true");
    expect(weekly).toHaveAttribute("aria-pressed", "false");
    expect(within(activityCard).getByText("Week 1")).toBeInTheDocument();
    expect(within(activityCard).queryByText("Sun")).not.toBeInTheDocument();

    await user.click(weekly);
    expect(weekly).toHaveAttribute("aria-pressed", "true");
    expect(within(activityCard).getByText("Sun")).toBeInTheDocument();
  });

  it("switches the engagement chart between engagement and accuracy metrics", async () => {
    const user = userEvent.setup();
    const { container } = render(<CaregiverDashboardPage />);

    const engagement = chart("caregiver.chart.engagement.view.engagement");
    const accuracy = chart("caregiver.chart.engagement.view.accuracy");
    const areaCount = () =>
      container.querySelectorAll(
        "[data-ocid='caregiver.chart.engagement'] .recharts-area-area",
      ).length;

    expect(engagement).toHaveAttribute("aria-pressed", "true");
    expect(areaCount()).toBe(1);

    await user.click(accuracy);
    expect(accuracy).toHaveAttribute("aria-pressed", "true");
    expect(engagement).toHaveAttribute("aria-pressed", "false");
    expect(areaCount()).toBe(1);

    await user.click(engagement);
    expect(engagement).toHaveAttribute("aria-pressed", "true");
    expect(areaCount()).toBe(1);
  });
});

describe("Caregiver dashboard chart tooltips", () => {
  it("shows a tooltip with the value and label when a data point is hovered", () => {
    const { container } = render(<CaregiverDashboardPage />);

    const surface = container.querySelector(
      "[data-ocid='caregiver.chart.mood'] svg.recharts-surface",
    );
    expect(surface).not.toBeNull();

    fireEvent.mouseMove(surface as Element, { clientX: 300, clientY: 100 });

    const tooltip = container.querySelector(
      "[data-ocid='caregiver.chart.mood'] .recharts-tooltip-wrapper",
    );
    expect(tooltip).not.toBeNull();
    // The mood tooltip formatter renders "<score> / 5".
    expect(tooltip?.textContent).toMatch(/\d+ \/ 5/);
  });
});

describe("Caregiver dashboard chart empty state", () => {
  it("shows a friendly empty state on the activity chart when no games are played", () => {
    render(<CaregiverDashboardPage />);

    const empty = chart("caregiver.chart.activity.empty_state");
    expect(empty).toBeInTheDocument();
    expect(
      within(empty).getByText(
        /No games completed in this period yet\. Activity will appear here once Asha plays\./i,
      ),
    ).toBeInTheDocument();
    // The empty placeholder replaces the chart surface rather than leaving a
    // blank box.
    expect(
      chart("caregiver.chart.activity").querySelector("svg.recharts-surface"),
    ).toBeNull();
  });

  it("replaces the activity empty state with a painted chart once a game is played", () => {
    useAppStore.getState().addGameResult(makeResult());
    const { container } = render(<CaregiverDashboardPage />);

    expect(
      screen.queryByTestId("caregiver.chart.activity.empty_state"),
    ).not.toBeInTheDocument();
    expect(
      container.querySelectorAll(
        "[data-ocid='caregiver.chart.activity'] .recharts-bar-rectangle",
      ).length,
    ).toBeGreaterThan(0);
  });
});

describe("Caregiver dashboard chart journey", () => {
  it("loads at /caregiver with all chart cards visible and interactive", async () => {
    const user = userEvent.setup();
    await renderAtPath("/caregiver");

    for (const ocid of [
      "caregiver.chart.adherence",
      "caregiver.chart.activity",
      "caregiver.chart.engagement",
      "caregiver.chart.mood",
    ]) {
      expect(screen.getByTestId(ocid)).toBeInTheDocument();
    }

    // A legend toggle and a view switch both work from the routed page.
    const moodLegend = screen.getByTestId("caregiver.chart.mood.legend.mood");
    await user.click(moodLegend);
    expect(moodLegend).toHaveAttribute("aria-pressed", "false");

    const monthly = screen.getByTestId("caregiver.chart.activity.view.monthly");
    await user.click(monthly);
    expect(monthly).toHaveAttribute("aria-pressed", "true");
  });
});
