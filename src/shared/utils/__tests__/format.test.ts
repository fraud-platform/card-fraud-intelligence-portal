import { describe, it, expect } from "vitest";
import { labelForEnumValue } from "../format";

describe("labelForEnumValue", () => {
  it("converts SCREAMING_SNAKE_CASE to Title Case", () => {
    expect(labelForEnumValue("PENDING_APPROVAL")).toBe("Pending Approval");
    expect(labelForEnumValue("DRAFT")).toBe("Draft");
    expect(labelForEnumValue("APPROVED")).toBe("Approved");
  });

  it("handles single word values", () => {
    expect(labelForEnumValue("STRING")).toBe("String");
    expect(labelForEnumValue("NUMBER")).toBe("Number");
    expect(labelForEnumValue("ACTIVE")).toBe("Active");
  });

  it("handles multi-word values", () => {
    expect(labelForEnumValue("MULTI_WORD_VALUE")).toBe("Multi Word Value");
    expect(labelForEnumValue("SOME_REALLY_LONG_NAME")).toBe("Some Really Long Name");
  });

  it("handles lowercase input", () => {
    expect(labelForEnumValue("pending_approval")).toBe("Pending Approval");
  });

  it("handles mixed case input", () => {
    expect(labelForEnumValue("Pending_Approval")).toBe("Pending Approval");
  });

  it("handles single character words", () => {
    expect(labelForEnumValue("A_B_C")).toBe("A B C");
  });

  it("handles trailing underscores", () => {
    expect(labelForEnumValue("VALUE__")).toBe("Value  ");
  });
});
