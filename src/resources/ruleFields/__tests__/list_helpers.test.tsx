import { describe, it, expect } from "vitest";
import { labelForEnumValue } from "../../../shared/utils/format";

describe("RuleFieldList helpers", () => {
  it("labelForEnumValue formats UPPER_SNAKE into title case", () => {
    expect(labelForEnumValue("DATA_TYPE_STRING")).toBe("Data Type String");
    expect(labelForEnumValue("CARD_TYPE")).toBe("Card Type");
  });
});
