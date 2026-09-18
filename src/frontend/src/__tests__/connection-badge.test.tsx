import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ConnectionBadge } from "@/components/ui/ConnectionBadge";
import { DEFAULT_ACCESSIBILITY } from "@/lib/accessibility";
import { DEMO_REMINDERS } from "@/lib/demo-data";
import { useOfflineStore } from "@/lib/offline";
import { useAppStore } from "@/lib/store";
import type { AIJourney } from "@/lib/types";

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
  cleanup();
});

describe("ConnectionBadge status rendering", () => {
  it("shows Connected when online with no pending sync", () => {
    render(<ConnectionBadge />);
    expect(screen.getByTestId("connection.connected")).toBeInTheDocument();
    expect(screen.getByText("Connected")).toBeInTheDocument();
  });

  it("shows Offline immediately when the store goes offline", () => {
    useOfflineStore.getState().setOffline();
    render(<ConnectionBadge />);
    expect(screen.getByTestId("connection.offline")).toBeInTheDocument();
    expect(screen.getByText("Offline")).toBeInTheDocument();
    expect(
      screen.queryByTestId("connection.connected"),
    ).not.toBeInTheDocument();
  });

  it("shows Synchronizing… while a sync is in progress", () => {
    useOfflineStore.getState().setOffline();
    useOfflineStore.getState().queueActivity();
    useOfflineStore.getState().setOnline();
    useOfflineStore.getState().startSync();
    render(<ConnectionBadge />);
    expect(screen.getByTestId("connection.syncing")).toBeInTheDocument();
    expect(screen.getByText("Synchronizing…")).toBeInTheDocument();
  });

  it("shows Connected with a pending count when online with queued activities", () => {
    useOfflineStore.getState().queueActivity();
    useOfflineStore.getState().queueActivity();
    render(<ConnectionBadge />);
    expect(screen.getByTestId("connection.connected")).toBeInTheDocument();
    expect(screen.getByText(/2/)).toBeInTheDocument();
  });

  it("shows the shared synced count after a completed sync", () => {
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
    render(<ConnectionBadge />);
    expect(screen.getByTestId("connection.synced")).toBeInTheDocument();
    expect(screen.getByText(/1 activities synced/i)).toBeInTheDocument();
  });

  it("clears a stale synced count when going offline again", () => {
    // Simulate a completed sync leaving a synced count behind.
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

    // Going offline again clears the previous synced count so the badge shows
    // Offline, never a stale "✓ N synced".
    useOfflineStore.getState().setOffline();
    render(<ConnectionBadge />);
    expect(screen.getByTestId("connection.offline")).toBeInTheDocument();
    expect(screen.getByText("Offline")).toBeInTheDocument();
    expect(screen.queryByTestId("connection.synced")).not.toBeInTheDocument();
    expect(useOfflineStore.getState().syncedCount).toBeNull();
  });

  it("returns to Connected when reconnecting with zero pending activities", () => {
    useOfflineStore.getState().setOffline();
    useOfflineStore.getState().setOnline();
    render(<ConnectionBadge />);
    expect(screen.getByTestId("connection.connected")).toBeInTheDocument();
    expect(useOfflineStore.getState().syncing).toBe(false);
  });
});
