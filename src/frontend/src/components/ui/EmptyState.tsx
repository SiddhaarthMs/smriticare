import type * as React from "react";

import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.ComponentProps<"div"> {
  emoji?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  emoji = "🌿",
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      data-ocid="empty_state"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed bg-card/60 p-10 text-center",
        className,
      )}
      {...props}
    >
      <span className="text-5xl" aria-hidden="true">
        {emoji}
      </span>
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      {description ? (
        <p className="max-w-sm text-base text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
