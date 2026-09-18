import { Loader2 } from "lucide-react";

import { useI18n } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";

export function LoadingState({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <output
      data-ocid="loading_state"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-3xl bg-card/60 p-10 text-center",
        className,
      )}
      aria-live="polite"
    >
      <Loader2
        className="size-8 animate-spin text-primary"
        aria-hidden="true"
      />
      <p className="text-lg text-muted-foreground">{t("loading")}</p>
    </output>
  );
}
