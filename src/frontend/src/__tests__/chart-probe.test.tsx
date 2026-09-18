import { describe, expect, it } from "vitest";

import { chartColor } from "@/lib/utils";

/**
 * `--chart-1`..`--chart-5` are stored as bare oklch component triples, so a
 * direct SVG `fill`/`stroke`/`stopColor` or inline `backgroundColor` must wrap
 * them in `oklch(...)`. Passing the bare `var(--chart-N)` token paints nothing,
 * which is the invalid-color regression this guards against.
 */
describe("chartColor", () => {
  it("returns a complete oklch() color for each palette token", () => {
    for (const index of [1, 2, 3, 4, 5]) {
      expect(chartColor(index)).toBe(`oklch(var(--chart-${index}))`);
    }
  });

  it("never returns a bare var() token that would paint nothing", () => {
    for (const index of [1, 2, 3, 4, 5]) {
      expect(chartColor(index)).not.toBe(`var(--chart-${index})`);
      expect(chartColor(index)).toMatch(/^oklch\(var\(--chart-\d+\)\)$/);
    }
  });
});
