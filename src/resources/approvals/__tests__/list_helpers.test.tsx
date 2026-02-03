import { describe, it, expect } from "vitest";
import { getStatusColor, getEntityTypeColor } from "../../../theme/tokens";
import { ApprovalStatus, EntityType } from "../../../types/enums";

describe("ApprovalList helpers", () => {
  it("getStatusColor returns expected colors", () => {
    expect(getStatusColor(ApprovalStatus.PENDING)).toBe("orange");
    expect(getStatusColor(ApprovalStatus.APPROVED)).toBe("green");
    expect(getStatusColor(ApprovalStatus.REJECTED)).toBe("red");
  });

  it("getEntityTypeColor returns expected colors", () => {
    expect(getEntityTypeColor(EntityType.RULE)).toBe("blue");
    expect(getEntityTypeColor(EntityType.RULESET)).toBe("purple");
  });
});
