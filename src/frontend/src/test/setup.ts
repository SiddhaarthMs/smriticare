import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vitest";

// Generated components use data-ocid attributes as their stable test hooks.
configure({ testIdAttribute: "data-ocid" });

// Testing Library's auto-cleanup registers once per module evaluation. Because
// this setup file is evaluated once and cached across the single-fork run, only
// the first test file to execute gets that registration; later files accumulate
// rendered DOM and fail with "Found multiple elements". Registering cleanup
// explicitly here makes every suite independent of file execution order.
afterEach(() => {
  cleanup();
});

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
