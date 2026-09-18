import type { LucideIcon } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

export interface StatCardProps extends React.ComponentProps<"div"> {
  label: string;
  value: string;
  icon?: LucideIcon;
  hint?: string;
  tone?: "default" | "primary" | "warm" | "success";
}

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "bg-card text-card-foreground",
  primary: "bg-primary text-primary-foreground",
  warm: "bg-gradient-warm text-accent-foreground",
  success: "bg-success/15 text-foreground",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
  className,
  ...props
}: StatCardProps) {
  return (
    <div
      data-slot="stat-card"
      className={cn(
        "flex flex-col gap-2 rounded-3xl p-5 shadow-subtle",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold tracking-wide uppercase opacity-80">
          {label}
        </span>
        {Icon ? (
          <Icon className="size-5 opacity-80" aria-hidden="true" />
        ) : null}
      </div>
      <span className="font-display text-3xl font-bold tracking-tight">
        {value}
      </span>
      {hint ? <span className="text-sm opacity-80">{hint}</span> : null}
    </div>
  );
}
