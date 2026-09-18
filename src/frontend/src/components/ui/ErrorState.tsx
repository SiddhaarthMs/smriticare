import { AlertTriangle } from "lucide-react";

import { useI18n } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";
import { BigButton } from "./BigButton";

export interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  const { t } = useI18n();
  return (
    <div
      data-ocid="error_state"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-3xl border border-destructive/30 bg-destructive/5 p-10 text-center",
        className,
      )}
      role="alert"
    >
      <AlertTriangle className="size-8 text-destructive" aria-hidden="true" />
      <h3 className="font-display text-xl font-semibold">{t("error")}</h3>
      {message ? (
        <p className="max-w-sm text-base text-muted-foreground">{message}</p>
      ) : null}
      {onRetry ? (
        <BigButton
          type="button"
          data-ocid="error_state.retry_button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={onRetry}
        >
          {t("retry")}
        </BigButton>
      ) : null}
    </div>
  );
}
