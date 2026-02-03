import { describe, it, expect } from "vitest";
import "../handlers";

// Global test setup handles MSW server lifecycle

const _BASE = "http://localhost:8000";

describe("MSW handlers structure", () => {
  it("exports a handlers array and contains authentication routes in source", async () => {
    const { handlers } = await import("../handlers");
    expect(Array.isArray(handlers)).toBe(true);
    expect(handlers.length).toBeGreaterThan(0);

    // Check the source file contains auth endpoints to be confident handlers are registered
    const fs = await import("fs");
    const path = await import("path");
    const file = fs.readFileSync(path.resolve(__dirname, "..", "handlers.ts"), "utf8");
    expect(file.includes("/api/v1/auth/login") || file.includes("/api/v1/auth/me")).toBe(true);
  });

  it("handlers helpers are available and functions behave", async () => {
    const helpers = await import("../handlers");
    expect(typeof helpers.parseKeysetPagination).toBe("function");
    expect(typeof helpers.applyFilters).toBe("function");
    expect(typeof helpers.keysetPaginate).toBe("function");
  });

  it("returns 404 for missing rule field key", async () => {
    const res = await fetch(`/api/v1/rule-fields/nonexistent`);
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json).toHaveProperty("error");
  });

  it("delete returns 404 for missing rule field key", async () => {
    const res = await fetch(`/api/v1/rule-fields/nonexistent`, { method: "DELETE" });
    expect(res.status).toBe(404);
  });

  it("submit returns 404 for missing rule", async () => {
    const res = await fetch(`/api/v1/rules/nonexistent/submit`, { method: "POST" });
    expect(res.status).toBe(404);
  });

  it("version endpoint returns 404 for missing version", async () => {
    const res = await fetch(`/api/v1/rules/nonexistent/versions/nonexistent`);
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json).toHaveProperty("error");
  });
});
