import { describe, it, expect } from "vitest";
import { getEntityTypeColor } from "../tokens";

describe("getEntityTypeColor", () => {
  it("returns colors for known entity types", () => {
    expect(getEntityTypeColor("RULE")).toBe("blue");
    expect(getEntityTypeColor("RULESET")).toBe("purple");
    expect(getEntityTypeColor("RULE_FIELD")).toBe("cyan");
    expect(getEntityTypeColor("RULE_VERSION")).toBe("geekblue");
  });

  it("returns default for unknown entity types", () => {
    expect(getEntityTypeColor("UNKNOWN")).toBe("default");
    expect(getEntityTypeColor("")).toBe("default");
    expect(getEntityTypeColor("random_type")).toBe("default");
  });
});
