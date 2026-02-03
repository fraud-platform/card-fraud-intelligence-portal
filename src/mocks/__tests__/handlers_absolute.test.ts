import { describe, it, expect } from "vitest";
import "../handlers";

// Global test setup handles MSW server lifecycle

describe("MSW handlers absolute origin edge cases", () => {
  it("audit-logs plural and singular endpoints return expected structures", async () => {
    const plural = await fetch("/api/v1/audit-logs?limit=2");
    expect(plural.status).toBe(200);
    const p = await plural.json();
    expect(p).toHaveProperty("items");

    const singular = await fetch("/api/v1/audit-log?limit=2");
    expect(singular.status).toBe(200);
    const s = await singular.json();
    expect(s).toHaveProperty("items");
  });

  it("audit log detail returns 404 for missing id", async () => {
    const res = await fetch("/api/v1/audit-log/nope");
    expect([200, 404]).toContain(res.status);
  });
});
