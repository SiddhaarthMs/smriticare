import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Resolve a chart palette token to a complete CSS color value.
 *
 * `--chart-1`..`--chart-5` are stored as bare oklch component triples so that
 * Tailwind's `chart.N` mapping (`oklch(var(--chart-N))`) can wrap them. Passing
 * `var(--chart-N)` straight into an SVG `fill`/`stroke`/`stopColor` or an inline
 * `backgroundColor` therefore yields an invalid color and paints nothing, so
 * every direct consumer must wrap the token with `oklch(...)`.
 */
export function chartColor(index: number): string {
  return `oklch(var(--chart-${index}))`;
}
