import { describe, it, expect } from "vitest";
import {
  getInitialFilters,
  getQuickViews,
  applyQuickViewToState,
  matchQuickView,
} from "../filters";

describe("worklist filter utils", () => {
  it("applies quick view to state correctly", () => {
    const q = { priority: 1, risk: "CRITICAL" as any };
    const state = applyQuickViewToState(q);
    expect(state.priority).toBe(1);
    expect(state.risk).toBe("CRITICAL");
    expect(state.assignedOnly).toBe(false);
  });

  it("matches quick views correctly", () => {
    const current = { status: null, risk: "HIGH" as any, priority: null, assignedOnly: false };
    const q = { risk: "HIGH" as any };
    expect(matchQuickView(q, current)).toBe(true);
  });

  it("returns quick views array", () => {
    const q = getQuickViews();
    expect(Array.isArray(q)).toBe(true);
    expect(q.length).toBeGreaterThan(0);
  });

  it("parses initial filters from URL (fallback)", () => {
    // Simulate location.search not set
    // This test runs in JSDOM environment so window.location exists; ensure function returns default shape
    const f = getInitialFilters();
    expect(f).toHaveProperty("status");
    expect(f).toHaveProperty("risk");
    expect(f).toHaveProperty("priority");
    expect(f).toHaveProperty("assignedOnly");
  });
});
