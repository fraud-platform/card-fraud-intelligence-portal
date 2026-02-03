import { describe, it, expect } from "vitest";
import {
  RULE_TYPE_EVALUATION_MODE,
  RULE_TYPE_DESCRIPTIONS,
  RULE_TYPE_LABELS,
  OPERATORS,
  OPERATOR_LABELS,
  MULTI_VALUE_OPERATORS,
  RANGE_OPERATORS,
  NO_VALUE_OPERATORS,
  LOGICAL_OPERATORS,
} from "../ruleTypes";
import { RuleType, EvaluationMode } from "../../../types/enums";

describe("ruleTypes constants", () => {
  describe("RULE_TYPE_EVALUATION_MODE", () => {
    it("maps all rule types to evaluation modes", () => {
      expect(RULE_TYPE_EVALUATION_MODE[RuleType.ALLOWLIST]).toBe(EvaluationMode.FIRST_MATCH);
      expect(RULE_TYPE_EVALUATION_MODE[RuleType.BLOCKLIST]).toBe(EvaluationMode.FIRST_MATCH);
      expect(RULE_TYPE_EVALUATION_MODE[RuleType.AUTH]).toBe(EvaluationMode.FIRST_MATCH);
      expect(RULE_TYPE_EVALUATION_MODE[RuleType.MONITORING]).toBe(EvaluationMode.ALL_MATCHING);
    });
  });

  describe("RULE_TYPE_DESCRIPTIONS", () => {
    it("has descriptions for all rule types", () => {
      expect(Object.keys(RULE_TYPE_DESCRIPTIONS)).toHaveLength(4);
      expect(RULE_TYPE_DESCRIPTIONS[RuleType.ALLOWLIST]).toContain("Allow-list");
      expect(RULE_TYPE_DESCRIPTIONS[RuleType.BLOCKLIST]).toContain("Block-list");
      expect(RULE_TYPE_DESCRIPTIONS[RuleType.AUTH]).toContain("Real-time");
      expect(RULE_TYPE_DESCRIPTIONS[RuleType.MONITORING]).toContain("Post-authorization");
    });
  });

  describe("RULE_TYPE_LABELS", () => {
    it("has labels for all rule types", () => {
      expect(Object.keys(RULE_TYPE_LABELS)).toHaveLength(4);
      expect(RULE_TYPE_LABELS[RuleType.ALLOWLIST]).toContain("ALLOWLIST");
      expect(RULE_TYPE_LABELS[RuleType.BLOCKLIST]).toContain("BLOCKLIST");
      expect(RULE_TYPE_LABELS[RuleType.AUTH]).toContain("Pre-Auth");
      expect(RULE_TYPE_LABELS[RuleType.MONITORING]).toContain("Post-Auth");
    });
  });

  describe("OPERATORS", () => {
    it("contains all operator constants", () => {
      expect(OPERATORS.EQ).toBe("EQ");
      expect(OPERATORS.NE).toBe("NE");
      expect(OPERATORS.GT).toBe("GT");
      expect(OPERATORS.GTE).toBe("GTE");
      expect(OPERATORS.LT).toBe("LT");
      expect(OPERATORS.LTE).toBe("LTE");
      expect(OPERATORS.IN).toBe("IN");
      expect(OPERATORS.NOT_IN).toBe("NOT_IN");
      expect(OPERATORS.LIKE).toBe("LIKE");
      expect(OPERATORS.NOT_LIKE).toBe("NOT_LIKE");
      expect(OPERATORS.BETWEEN).toBe("BETWEEN");
      expect(OPERATORS.IS_NULL).toBe("IS_NULL");
      expect(OPERATORS.IS_NOT_NULL).toBe("IS_NOT_NULL");
      expect(OPERATORS.CONTAINS).toBe("CONTAINS");
      expect(OPERATORS.STARTS_WITH).toBe("STARTS_WITH");
      expect(OPERATORS.ENDS_WITH).toBe("ENDS_WITH");
      expect(OPERATORS.REGEX).toBe("REGEX");
    });
  });

  describe("OPERATOR_LABELS", () => {
    it("has labels for all operators", () => {
      expect(OPERATOR_LABELS.EQ).toBe("equals");
      expect(OPERATOR_LABELS.GT).toBe("greater than");
      expect(OPERATOR_LABELS.BETWEEN).toBe("between");
      expect(OPERATOR_LABELS.IS_NULL).toBe("is null");
      expect(OPERATOR_LABELS.CONTAINS).toBe("contains");
      expect(OPERATOR_LABELS.STARTS_WITH).toBe("starts with");
      expect(OPERATOR_LABELS.ENDS_WITH).toBe("ends with");
      expect(OPERATOR_LABELS.REGEX).toBe("matches regex");
    });
  });

  describe("MULTI_VALUE_OPERATORS", () => {
    it("contains IN and NOT_IN", () => {
      expect(MULTI_VALUE_OPERATORS).toContain("IN");
      expect(MULTI_VALUE_OPERATORS).toContain("NOT_IN");
      expect(MULTI_VALUE_OPERATORS).toHaveLength(2);
    });
  });

  describe("RANGE_OPERATORS", () => {
    it("contains BETWEEN", () => {
      expect(RANGE_OPERATORS).toContain("BETWEEN");
      expect(RANGE_OPERATORS).toHaveLength(1);
    });
  });

  describe("NO_VALUE_OPERATORS", () => {
    it("contains IS_NULL and IS_NOT_NULL", () => {
      expect(NO_VALUE_OPERATORS).toContain("IS_NULL");
      expect(NO_VALUE_OPERATORS).toContain("IS_NOT_NULL");
      expect(NO_VALUE_OPERATORS).toHaveLength(2);
    });
  });

  describe("LOGICAL_OPERATORS", () => {
    it("contains and and or", () => {
      expect(LOGICAL_OPERATORS.AND).toBe("and");
      expect(LOGICAL_OPERATORS.OR).toBe("or");
    });
  });
});
