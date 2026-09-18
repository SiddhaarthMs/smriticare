import type * as React from "react";

import { cn } from "@/lib/utils";

export interface PageHeaderProps extends React.ComponentProps<"div"> {
  title: string;
  subtitle?: string;
  emoji?: string;
  action?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  emoji,
  action,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      data-slot="page-header"
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        {emoji ? (
          <span
            className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-3xl"
            aria-hidden="true"
          >
            {emoji}
          </span>
        ) : null}
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-base text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
