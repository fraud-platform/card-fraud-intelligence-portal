import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import { dataProvider } from "../dataProvider";
import { httpClient } from "../../api/httpClient";

vi.mock("../../api/httpClient");

const mockedRequest = httpClient.request as unknown as vi.Mock;

beforeEach(() => {
  mockedRequest.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("dataProvider", () => {
  it("getApiUrl returns a usable API URL", () => {
    const api = dataProvider.getApiUrl();
    expect(typeof api).toBe("string");
    expect(api.endsWith("/api/v1")).toBe(true);
  });

  it("getList handles plain array response and normalizes ids", async () => {
    const resp = [
      { rule_id: "rule_1", name: "A", priority: 1, status: "ACTIVE" },
      { rule_id: "rule_2", name: "B", priority: 2, status: "INACTIVE" },
    ];
    mockedRequest.mockResolvedValue({ data: resp });

    const result = await dataProvider.getList({
      resource: "rules",
      pagination: undefined,
      filters: undefined,
      sorters: undefined,
    });

    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toHaveProperty("id", "rule_1");
    expect(result.total).toBe(2);

    // ensure URL was called without querystring
    const call = mockedRequest.mock.calls[0][0];
    expect(call.method).toBe("GET");
    expect(call.url).toContain("/rules");
    expect(call.url).not.toContain("?");
  });

  it("getList handles wrapped response with pagination and builds query params", async () => {
    const wrapped = {
      items: [{ approval_id: "a" }],
      next_cursor: null,
      has_next: false,
      limit: 50,
    };
    mockedRequest.mockResolvedValue({ data: wrapped });

    const result = await dataProvider.getList({
      resource: "approvals",
      pagination: { current: 3, pageSize: 50 },
      filters: [{ field: "status", operator: "eq", value: "open" }],
      sorters: [{ field: "created_at", order: "desc" }],
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toHaveProperty("id", "a");
    expect(result.total).toBe(1);

    const call = mockedRequest.mock.calls[0][0];
    expect(call.method).toBe("GET");
    expect(call.url).toContain("/approvals");
    expect(call.url).toContain("limit=50");
    expect(call.url).toContain("status=open");
    expect(call.url).toContain("sort_by=created_at");
    expect(call.url).toContain("sort_order=desc");
  });

  it("getOne encodes id and normalizes data", async () => {
    mockedRequest.mockResolvedValue({
      data: { rule_id: "55", name: "Z", priority: 1, status: "ACTIVE" },
    });

    const res = await dataProvider.getOne({ resource: "rules", id: "55" });
    expect(res.data).toHaveProperty("id", "55");

    const call = mockedRequest.mock.calls[0][0];
    expect(call.method).toBe("GET");
    expect(call.url).toContain("/rules/55");
  });

  it("create sends POST with variables and returns normalized data", async () => {
    mockedRequest.mockResolvedValue({
      data: { ruleset_id: "rs1", name: "R", version: 1, status: "ACTIVE" },
    });

    const res = await dataProvider.create({ resource: "rulesets", variables: { name: "R" } });
    expect(res.data).toHaveProperty("id", "rs1");

    const call = mockedRequest.mock.calls[0][0];
    expect(call.method).toBe("POST");
    expect(call.url).toContain("/rulesets");
    expect(call.data).toEqual({ name: "R" });
  });

  it("update uses PATCH and encodes id", async () => {
    mockedRequest.mockResolvedValue({
      data: { rule_id: "7", name: "New", priority: 1, status: "ACTIVE" },
    });

    const res = await dataProvider.update({
      resource: "rules",
      id: "7",
      variables: { title: "New" },
    });
    expect(res.data).toHaveProperty("id", "7");

    const call = mockedRequest.mock.calls[0][0];
    expect(call.method).toBe("PATCH");
    expect(call.url).toContain("/rules/7");
    expect(call.data).toEqual({ title: "New" });
  });

  it("deleteOne uses DELETE and returns data as-is", async () => {
    mockedRequest.mockResolvedValue({ data: { ok: true } });

    const res = await dataProvider.deleteOne({ resource: "rules", id: "x" });
    expect(res.data).toEqual({ ok: true });

    const call = mockedRequest.mock.calls[0][0];
    expect(call.method).toBe("DELETE");
    expect(call.url).toContain("/rules/x");
  });

  it("custom builds absolute URL as-is and respects query/filters/sorters", async () => {
    mockedRequest.mockResolvedValue({ data: { result: "ok" } });

    const filters = [{ field: "f", operator: "eq", value: "v" }];
    const sorters = [{ field: "s", order: "asc" }];

    const res = await dataProvider.custom({
      url: "http://api.other/do",
      method: "PUT",
      payload: { a: 1 },
      filters,
      sorters,
      query: { q: 123 as unknown },
    });
    expect(res.data).toEqual({ result: "ok" });

    const call = mockedRequest.mock.calls[0][0];
    expect(call.method).toBe("PUT");
    expect(call.url).toContain("http://api.other/do");
    expect(call.url).toContain("f=v");
    expect(call.url).toContain("s");
    expect(call.url).toContain("q=123");
    expect(call.data).toEqual({ a: 1 });
  });

  it("custom builds relative URL with API prefix and omits empty query values", async () => {
    mockedRequest.mockResolvedValue({ data: { ok: true } });

    const res = await dataProvider.custom({
      url: "entities",
      method: "POST",
      payload: { x: 1 },
      query: { empty: "" },
    });
    expect(res.data).toEqual({ ok: true });

    const call = mockedRequest.mock.calls[0][0];
    expect(call.url).toContain("/entities");
    // empty query param should not appear
    expect(call.url).not.toContain("empty=");
    expect(call.data).toEqual({ x: 1 });
  });
});
