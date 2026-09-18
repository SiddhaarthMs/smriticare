import { useEffect } from "react";
import { listenToConnectivity, useOfflineStore } from "../lib/offline";

export function useOffline() {
  const status = useOfflineStore((s) => s.status);
  const pendingSync = useOfflineStore((s) => s.pendingSync);
  const syncing = useOfflineStore((s) => s.syncing);
  const lastSynced = useOfflineStore((s) => s.lastSynced);
  const syncedCount = useOfflineStore((s) => s.syncedCount);

  useEffect(() => {
    const unsubscribe = listenToConnectivity();
    return unsubscribe;
  }, []);

  return {
    status,
    pendingSync,
    syncing,
    lastSynced,
    syncedCount,
  };
}
