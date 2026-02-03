import { describe, it, expect } from "vitest";

// Global test setup handles MSW server lifecycle

describe("MSW handlers OPTIONS and absolute origin support", () => {
  it("returns 204 for OPTIONS preflight on approvals and audit-logs", async () => {
    const approvals = await fetch("/api/v1/approvals", { method: "OPTIONS" });
    expect(approvals.status).toBe(204);

    const audit = await fetch("/api/v1/audit-logs", { method: "OPTIONS" });
    expect(audit.status).toBe(204);
  });

  it("supports absolute-origin GET requests for approvals and audit-logs", async () => {
    const approvals = await fetch("http://localhost:8000/api/v1/approvals?limit=5");
    expect(approvals.status).toBe(200);
    const apJson = await approvals.json();
    expect(apJson).toHaveProperty("items");

    const audit = await fetch("http://localhost:8000/api/v1/audit-logs?limit=5");
    expect(audit.status).toBe(200);
    const auJson = await audit.json();
    expect(auJson).toHaveProperty("items");
  });
});
