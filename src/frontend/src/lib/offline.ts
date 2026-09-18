import { create } from "zustand";
import type { ConnectionState, GameResult } from "./types";

interface OfflineStore extends ConnectionState {
  /** Number of activities synced on the last completed sync, shared across the
   *  connection badge and the demo page so both show the same "✓ N synced". */
  syncedCount: number | null;
  /** Real local activities recorded while offline, marked synced on reconnect. */
  offlineActivities: GameResult[];
  setOnline: () => void;
  setOffline: () => void;
  queueActivity: () => void;
  queueOfflineActivity: (result: GameResult) => void;
  startSync: () => void;
  completeSync: () => void;
  clearSyncedCount: () => void;
}

export const useOfflineStore = create<OfflineStore>((set) => ({
  status: "connected",
  pendingSync: 0,
  syncing: false,
  lastSynced: null,
  syncedCount: null,
  offlineActivities: [],

  setOnline: () =>
    set((state) => {
      if (state.status === "connected") return state;
      // Only enter "Synchronizing…" when there are queued activities to sync.
      // Reconnecting with zero pending activities must return straight to
      // "Connected" rather than getting stuck on "Synchronizing…".
      return { status: "connected", syncing: state.pendingSync > 0 };
    }),

  setOffline: () =>
    set((state) => {
      if (state.status === "offline") return state;
      // Going offline clears any previous synced-count so the badge shows
      // Offline, never a stale "✓ N synced".
      return { status: "offline", syncing: false, syncedCount: null };
    }),

  queueActivity: () => set((state) => ({ pendingSync: state.pendingSync + 1 })),

  queueOfflineActivity: (result) =>
    set((state) => ({
      offlineActivities: [
        ...state.offlineActivities,
        { ...result, synced: false },
      ],
      pendingSync: state.pendingSync + 1,
    })),

  startSync: () => set({ syncing: true }),

  completeSync: () =>
    set((state) => ({
      syncing: false,
      pendingSync: 0,
      lastSynced: Date.now(),
      syncedCount: state.offlineActivities.length,
      offlineActivities: state.offlineActivities.map((a) => ({
        ...a,
        synced: true,
      })),
    })),

  clearSyncedCount: () => set({ syncedCount: null }),
}));

/**
 * Simulated sync flow. When the app comes back online with queued activities,
 * it shows "Synchronizing…" then "✓ N activities synced".
 */
export function simulateSync(onComplete?: (count: number) => void): void {
  const store = useOfflineStore.getState();
  if (store.status !== "connected" || store.pendingSync === 0) return;

  const count = store.pendingSync;
  store.startSync();

  window.setTimeout(() => {
    useOfflineStore.getState().completeSync();
    onComplete?.(count);
  }, 1800);
}

export function listenToConnectivity(): () => void {
  const handleOnline = () => {
    useOfflineStore.getState().setOnline();
    simulateSync();
  };
  const handleOffline = () => {
    useOfflineStore.getState().setOffline();
  };

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}
