import { describe, it, expect } from "vitest";
import { parseSimulationQuery, buildSimulationPayload } from "../simulation";

describe("simulation utils", () => {
  it("parses empty query as empty object", () => {
    const res = parseSimulationQuery("");
    expect(res.error).toBeUndefined();
    expect(res.query).toEqual({});
  });

  it("parses valid JSON object", () => {
    const res = parseSimulationQuery('{"from_date":"2024-01-01"}');
    expect(res.error).toBeUndefined();
    expect(res.query).toEqual({ from_date: "2024-01-01" });
  });

  it("returns error for invalid JSON", () => {
    const res = parseSimulationQuery("{invalid");
    expect(res.error).toBe("Query must be valid JSON.");
    expect(res.query).toBeUndefined();
  });

  it("returns error for non-object JSON", () => {
    const res = parseSimulationQuery("[1,2,3]");
    expect(res.error).toBe("Query must be a JSON object.");
  });

  it("builds payload and includes scope only when present", () => {
    const payload1 = buildSimulationPayload(
      "RULE",
      { tree: true },
      { network: ["VISA"] },
      { a: 1 }
    );
    expect(payload1.scope).toEqual({ network: ["VISA"] });

    const payload2 = buildSimulationPayload("RULE", { tree: true }, undefined, { a: 1 });
    expect(payload2.scope).toBeUndefined();
  });
});
