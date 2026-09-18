import type * as React from "react";

import { cn } from "@/lib/utils";

export interface ProgressRingProps extends React.ComponentProps<"div"> {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
  tone?: "primary" | "warm" | "success";
}

const toneColors: Record<NonNullable<ProgressRingProps["tone"]>, string> = {
  primary: "stroke-primary",
  warm: "stroke-accent",
  success: "stroke-success",
};

export function ProgressRing({
  value,
  size = 96,
  strokeWidth = 10,
  label,
  tone = "primary",
  className,
  ...props
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, value));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      data-slot="progress-ring"
      className={cn(
        "relative inline-flex items-center justify-center",
        className,
      )}
      style={{ width: size, height: size }}
      role="progressbar"
      tabIndex={0}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      {...props}
    >
      <svg width={size} height={size} className="-rotate-90">
        <title>{label ?? `${clamped}%`}</title>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-all duration-700", toneColors[tone])}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-bold">{clamped}%</span>
        {label ? (
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
