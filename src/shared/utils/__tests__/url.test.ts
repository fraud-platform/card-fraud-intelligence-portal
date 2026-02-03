import { describe, it, expect } from "vitest";
import { buildQueryString, buildQueryParams } from "../url";

describe("buildQueryString", () => {
  it("returns empty string for undefined filters", () => {
    expect(buildQueryString(undefined)).toBe("");
    expect(buildQueryString()).toBe("");
  });

  it("returns empty string for empty object", () => {
    expect(buildQueryString({})).toBe("");
  });

  it("builds query string with single filter", () => {
    expect(buildQueryString({ status: "active" })).toBe("?status=active");
  });

  it("builds query string with multiple filters", () => {
    const result = buildQueryString({ status: "active", page: 1, limit: 10 });
    expect(result).toContain("status=active");
    expect(result).toContain("page=1");
    expect(result).toContain("limit=10");
    expect(result).toMatch(/^\?/);
  });

  it("filters out undefined values", () => {
    const result = buildQueryString({ status: "active", page: undefined as any });
    expect(result).toBe("?status=active");
  });

  it("filters out null values", () => {
    const result = buildQueryString({ status: "active", page: null as any });
    expect(result).toBe("?status=active");
  });

  it("filters out empty string values", () => {
    const result = buildQueryString({ status: "active", search: "" });
    expect(result).toBe("?status=active");
  });

  it("handles boolean values", () => {
    expect(buildQueryString({ enabled: true })).toBe("?enabled=true");
    expect(buildQueryString({ enabled: false })).toBe("?enabled=false");
  });

  it("handles numeric values", () => {
    expect(buildQueryString({ count: 0 })).toBe("?count=0");
    expect(buildQueryString({ count: 42 })).toBe("?count=42");
    expect(buildQueryString({ count: -1 })).toBe("?count=-1");
  });

  it("URL encodes special characters", () => {
    const result = buildQueryString({ search: "hello world" });
    expect(result).toContain("hello+world");
  });
});

describe("buildQueryParams", () => {
  it("returns empty URLSearchParams for undefined filters", () => {
    const params = buildQueryParams(undefined);
    expect(params.toString()).toBe("");
  });

  it("returns empty URLSearchParams for empty object", () => {
    const params = buildQueryParams({});
    expect(params.toString()).toBe("");
  });

  it("builds URLSearchParams with single filter", () => {
    const params = buildQueryParams({ status: "active" });
    expect(params.get("status")).toBe("active");
    expect(params.toString()).toBe("status=active");
  });

  it("builds URLSearchParams with multiple filters", () => {
    const params = buildQueryParams({ status: "active", page: 1, limit: 10 });
    expect(params.get("status")).toBe("active");
    expect(params.get("page")).toBe("1");
    expect(params.get("limit")).toBe("10");
    expect(params.toString()).toBe("status=active&page=1&limit=10");
  });

  it("filters out undefined values", () => {
    const params = buildQueryParams({ status: "active", page: undefined as any });
    expect(params.get("status")).toBe("active");
    expect(params.get("page")).toBeNull();
  });

  it("filters out null values", () => {
    const params = buildQueryParams({ status: "active", page: null as any });
    expect(params.get("status")).toBe("active");
    expect(params.get("page")).toBeNull();
  });

  it("filters out empty string values", () => {
    const params = buildQueryParams({ status: "active", search: "" });
    expect(params.get("status")).toBe("active");
    expect(params.get("search")).toBeNull();
  });

  it("handles boolean values including false", () => {
    const params = buildQueryParams({ enabled: true, disabled: false });
    expect(params.get("enabled")).toBe("true");
    expect(params.get("disabled")).toBe("false");
  });

  it("handles numeric zero", () => {
    const params = buildQueryParams({ count: 0 });
    expect(params.get("count")).toBe("0");
  });

  it("URL encodes special characters", () => {
    const params = buildQueryParams({ search: "hello world" });
    expect(params.get("search")).toBe("hello world");
    expect(params.toString()).toContain("hello+world");
  });

  it("uses set() semantics - last value wins for duplicate keys", () => {
    const params = buildQueryParams({ key: "first" });
    expect(params.toString()).toBe("key=first");
  });
});
