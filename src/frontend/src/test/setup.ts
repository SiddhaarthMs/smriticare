import "@testing-library/jest-dom/vitest";
import { configure } from "@testing-library/react";

// Generated components use data-ocid attributes as their stable test hooks.
configure({ testIdAttribute: "data-ocid" });

// recharts' ResponsiveContainer observes its container for size changes.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver =
    ResizeObserverMock as unknown as typeof ResizeObserver;
}
