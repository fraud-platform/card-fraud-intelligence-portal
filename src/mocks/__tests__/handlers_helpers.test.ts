import { describe, it, expect } from "vitest";
import {
  parseKeysetPagination,
  keysetPaginate,
  applyFilters,
  verifyMockDataInitialization,
} from "../handlers";

describe("handlers helpers", () => {
  it("parseKeysetPagination extracts cursor/limit/direction", () => {
    const url = new URL("http://localhost/api/v1/rule-fields?cursor=abc123&limit=7&direction=prev");
    const p = parseKeysetPagination(url);
    expect(p.cursor).toBe("abc123");
    expect(p.limit).toBe(7);
    expect(p.direction).toBe("prev");
  });

  it("keysetPaginate slices array correctly", () => {
    const items = [
      { id: "1" },
      { id: "2" },
      { id: "3" },
      { id: "4" },
      { id: "5" },
      { id: "6" },
      { id: "7" },
      { id: "8" },
      { id: "9" },
    ];
    const out = keysetPaginate(items, null, 4, "next", "id");
    expect(out.items).toHaveLength(4);
    expect(out.has_next).toBe(true);
    expect(out.next_cursor).toBeDefined();
  });

  it("applyFilters filters properly for strings and numbers", () => {
    const items = [
      { name: "Alice", age: 30 },
      { name: "Bob", age: 25 },
      { name: "Charlie", age: 30 },
    ];

    const params = new URLSearchParams("name=ali&age=30");
    const filtered = applyFilters(items, params, ["name", "age"]);
    expect(filtered.length).toBeGreaterThanOrEqual(1);
    expect(filtered[0].name).toBe("Alice");
  });

  it("verifyMockDataInitialization logs without throwing", () => {
    // simply call it - it runs console.warn internally during module init as well
    expect(() => verifyMockDataInitialization()).not.toThrow();
  });

  it("handlers export is non-empty and usable (sanity)", async () => {
    const { handlers } = await import("../handlers");
    expect(Array.isArray(handlers)).toBe(true);
    expect(handlers.length).toBeGreaterThan(0);
  });
});
