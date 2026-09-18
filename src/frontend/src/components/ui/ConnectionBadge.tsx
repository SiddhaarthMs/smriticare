import { Check, CloudOff, RefreshCw } from "lucide-react";

import { useI18n } from "@/hooks/use-i18n";
import { useOffline } from "@/hooks/use-offline";
import { cn } from "@/lib/utils";

export function ConnectionBadge() {
  const { t } = useI18n();
  const { status, syncing, pendingSync, syncedCount } = useOffline();

  if (syncing) {
    return (
      <span
        data-ocid="connection.syncing"
        className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1.5 text-sm font-semibold text-accent-foreground"
      >
        <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
        {t("synchronizing")}
      </span>
    );
  }

  if (syncedCount !== null && syncedCount > 0) {
    return (
      <span
        data-ocid="connection.synced"
        className="inline-flex items-center gap-2 rounded-full bg-success/15 px-3 py-1.5 text-sm font-semibold text-foreground"
      >
        <Check className="size-4 text-success" aria-hidden="true" />✓{" "}
        {syncedCount} {t("activitiesSynced")}
      </span>
    );
  }

  const offline = status === "offline";

  return (
    <span
      data-ocid={offline ? "connection.offline" : "connection.connected"}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold",
        offline
          ? "bg-warning/15 text-warning"
          : "bg-success/15 text-foreground",
      )}
    >
      {offline ? (
        <CloudOff className="size-4" aria-hidden="true" />
      ) : (
        <Check className="size-4 text-success" aria-hidden="true" />
      )}
      {offline ? t("offline") : t("connected")}
      {!offline && pendingSync > 0 ? ` · ${pendingSync}` : null}
    </span>
  );
}
