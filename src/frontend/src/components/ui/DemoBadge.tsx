import { FlaskConical } from "lucide-react";

import { useI18n } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";

export function DemoBadge({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <span
      data-ocid="demo_badge"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-foreground",
        className,
      )}
    >
      <FlaskConical className="size-3.5" aria-hidden="true" />
      {t("demoData")}
    </span>
  );
}
