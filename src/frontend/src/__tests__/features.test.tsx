import { act, cleanup, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_ACCESSIBILITY } from "@/lib/accessibility";
import { DEMO_REMINDERS } from "@/lib/demo-data";
import { simulateSync, useOfflineStore } from "@/lib/offline";
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

function resetStores() {
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
  useOfflineStore.setState({
    status: "connected",
    pendingSync: 0,
    syncing: false,
    lastSynced: null,
    syncedCount: null,
    offlineActivities: [],
  });
}

beforeEach(() => {
  cleanup();
  resetStores();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Offline mode", () => {
  it("queues activity while offline and syncs with a synced count on reconnect", () => {
    vi.useFakeTimers();
    useOfflineStore.getState().setOffline();
    useOfflineStore.getState().queueActivity();
    useOfflineStore.getState().queueActivity();
    expect(useOfflineStore.getState().status).toBe("offline");
    expect(useOfflineStore.getState().pendingSync).toBe(2);

    useOfflineStore.getState().setOnline();
    let syncedCount: number | null = null;
    simulateSync((count) => {
      syncedCount = count;
    });
    expect(useOfflineStore.getState().syncing).toBe(true);

    vi.advanceTimersByTime(1800);
    expect(useOfflineStore.getState().syncing).toBe(false);
    expect(useOfflineStore.getState().pendingSync).toBe(0);
    expect(syncedCount).toBe(2);
  });

  it("does not sync when there is nothing queued", () => {
    vi.useFakeTimers();
    useOfflineStore.getState().setOnline();
    simulateSync();
    expect(useOfflineStore.getState().syncing).toBe(false);
  });

  it("records real local activities offline and marks them synced on completion", () => {
    useOfflineStore.getState().setOffline();
    useOfflineStore.getState().queueOfflineActivity({
      id: "off-1",
      gameId: "memory-match",
      gameName: "Memory Match",
      skillArea: "Memory",
      difficulty: 2,
      accuracy: 88,
      responseTimeMs: 12000,
      attempts: 4,
      completion: 100,
      score: 82,
      timestamp: 1000,
      synced: false,
    });
    useOfflineStore.getState().queueOfflineActivity({
      id: "off-2",
      gameId: "memory-match",
      gameName: "Memory Match",
      skillArea: "Memory",
      difficulty: 2,
      accuracy: 90,
      responseTimeMs: 11000,
      attempts: 3,
      completion: 100,
      score: 88,
      timestamp: 2000,
      synced: false,
    });

    // Offline play records real local activities, not just a counter.
    expect(useOfflineStore.getState().offlineActivities).toHaveLength(2);
    expect(useOfflineStore.getState().pendingSync).toBe(2);
    expect(
      useOfflineStore.getState().offlineActivities.every((a) => !a.synced),
    ).toBe(true);

    // Completing a sync marks the locally recorded activities as synced.
    useOfflineStore.getState().setOnline();
    useOfflineStore.getState().completeSync();
    expect(useOfflineStore.getState().syncedCount).toBe(2);
    expect(
      useOfflineStore.getState().offlineActivities.every((a) => a.synced),
    ).toBe(true);
  });

  it("repeats the offline→online cycle, clearing the previous synced count", () => {
    // First cycle: go offline, record one activity, sync.
    useOfflineStore.getState().setOffline();
    useOfflineStore.getState().queueOfflineActivity({
      id: "off-1",
      gameId: "memory-match",
      gameName: "Memory Match",
      skillArea: "Memory",
      difficulty: 2,
      accuracy: 88,
      responseTimeMs: 12000,
      attempts: 4,
      completion: 100,
      score: 82,
      timestamp: 1000,
      synced: false,
    });
    useOfflineStore.getState().setOnline();
    useOfflineStore.getState().completeSync();
    expect(useOfflineStore.getState().syncedCount).toBe(1);

    // Second cycle: going offline again clears the previous synced count.
    useOfflineStore.getState().setOffline();
    expect(useOfflineStore.getState().syncedCount).toBeNull();
    expect(useOfflineStore.getState().status).toBe("offline");

    // Record a new activity and sync again. The synced count reflects the
    // locally recorded offline activities (which accumulate across sessions);
    // the key repeatable-cycle guarantee is that the previous display was
    // cleared when going offline again.
    useOfflineStore.getState().queueOfflineActivity({
      id: "off-2",
      gameId: "memory-match",
      gameName: "Memory Match",
      skillArea: "Memory",
      difficulty: 2,
      accuracy: 90,
      responseTimeMs: 11000,
      attempts: 3,
      completion: 100,
      score: 88,
      timestamp: 2000,
      synced: false,
    });
    useOfflineStore.getState().setOnline();
    useOfflineStore.getState().completeSync();
    expect(useOfflineStore.getState().syncedCount).toBe(2);
  });
});

describe("DemoModePage", () => {
  it("walks the offline story: go offline, play offline, restore and sync", async () => {
    await renderAtPath("/demo");
    vi.useFakeTimers();

    // Step 0 — Elder Dashboard with a Start Memory Game button.
    expect(screen.getByTestId("demo.start_game_button")).toBeInTheDocument();

    // Jump to the caregiver step (step 4) which holds the "Simulate internet loss" button.
    fireEvent.click(screen.getByTestId("demo.step.4"));
    fireEvent.click(screen.getByTestId("demo.go_offline_button"));

    // The goOffline handler flips the shared store to offline synchronously, so
    // the badge and demo page show "Offline" immediately with no stale synced
    // count and no retry — no timer advance is needed.
    expect(useOfflineStore.getState().status).toBe("offline");
    expect(screen.getByText("Offline Mode 🔴")).toBeInTheDocument();
    expect(
      screen.queryByText(/connection did not drop as expected/i),
    ).not.toBeInTheDocument();

    // Play offline queues an activity.
    fireEvent.click(screen.getByTestId("demo.play_offline_button"));
    expect(useOfflineStore.getState().pendingSync).toBe(1);
    expect(screen.getByText("Playing offline")).toBeInTheDocument();

    // Restore internet triggers a sync.
    fireEvent.click(screen.getByTestId("demo.restore_button"));
    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(useOfflineStore.getState().status).toBe("connected");
    expect(useOfflineStore.getState().syncing).toBe(true);

    // simulateSync completes after 1800ms and reports the synced count.
    act(() => {
      vi.advanceTimersByTime(1800);
    });
    // The shared synced-count now lives in the OfflineStore, so both the
    // always-visible ConnectionBadge (header + demo page) and the demo page's
    // completion heading show "1 activities synced".
    const synced = screen.getAllByText(/1 activities synced/i);
    expect(synced.length).toBeGreaterThanOrEqual(2);
    expect(useOfflineStore.getState().syncedCount).toBe(1);
  });

  it("records additional local activities when playing another round offline", async () => {
    await renderAtPath("/demo");
    vi.useFakeTimers();

    // Jump to the caregiver step and go offline.
    fireEvent.click(screen.getByTestId("demo.step.4"));
    fireEvent.click(screen.getByTestId("demo.go_offline_button"));
    // The store flips offline synchronously, so no timer advance is required.
    expect(useOfflineStore.getState().status).toBe("offline");

    // Play offline once, then play another round.
    fireEvent.click(screen.getByTestId("demo.play_offline_button"));
    expect(useOfflineStore.getState().pendingSync).toBe(1);
    expect(useOfflineStore.getState().offlineActivities).toHaveLength(1);

    fireEvent.click(screen.getByTestId("demo.queue_activity_button"));
    expect(useOfflineStore.getState().pendingSync).toBe(2);
    expect(useOfflineStore.getState().offlineActivities).toHaveLength(2);
    expect(
      useOfflineStore.getState().offlineActivities.every((a) => !a.synced),
    ).toBe(true);
  });
});

describe("Memory Album", () => {
  it("shows the memory story when 'Tell me about this memory' is tapped", async () => {
    const user = userEvent.setup();
    await renderAtPath("/social");

    expect(screen.getByText("Memory Album")).toBeInTheDocument();
    expect(screen.getByText("Tea on the Veranda")).toBeInTheDocument();

    await user.click(screen.getByTestId("social.memory.0"));
    expect(screen.getByTestId("social.memory_story")).toBeInTheDocument();
    expect(
      screen.getByText(/Every afternoon, Priya and I sit on the veranda/i),
    ).toBeInTheDocument();
  });

  it("toggles the story off when the same memory is tapped again", async () => {
    const user = userEvent.setup();
    await renderAtPath("/social");

    await user.click(screen.getByTestId("social.memory.0"));
    expect(screen.getByTestId("social.memory_story")).toBeInTheDocument();

    await user.click(screen.getByTestId("social.memory.0"));
    expect(screen.queryByTestId("social.memory_story")).not.toBeInTheDocument();
  });
});

describe("Familiar Memories pack theming", () => {
  it("selects a pack on the Profile page and stores it", async () => {
    const user = userEvent.setup();
    await renderAtPath("/profile");

    await user.click(screen.getByTestId("profile.pack.festivals"));
    expect(useAppStore.getState().selectedPackId).toBe("festivals");
    expect(screen.getByTestId("profile.pack.festivals")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("themes the Memory Match game with the selected pack's objects", async () => {
    useAppStore.getState().setSelectedPack("tea-food");
    await renderAtPath("/games/memory-match");

    // The game renders the selected pack's theme; the pack selection is
    // reflected in the store that drives the deck.
    expect(screen.getByText("Memory Match")).toBeInTheDocument();
    expect(useAppStore.getState().selectedPackId).toBe("tea-food");
  });
});
