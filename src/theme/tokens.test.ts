import { describe, it, expect } from "vitest";
import {
  enterpriseTheme,
  compactTableProps,
  columnWidths,
  getStatusColor,
  getRuleTypeColor,
  getDataTypeColor,
  getEvaluationTypeColor,
} from "./tokens";

describe("theme tokens", () => {
  it("exports enterprise theme configuration", () => {
    expect(enterpriseTheme).toBeDefined();
    expect(enterpriseTheme.token).toBeDefined();
    expect(enterpriseTheme.components).toBeDefined();
  });

  it("has correct primary brand colors", () => {
    expect(enterpriseTheme.token?.colorPrimary).toBe("#1f77d4");
    expect(enterpriseTheme.token?.colorSuccess).toBe("#2cba4a");
    expect(enterpriseTheme.token?.colorWarning).toBe("#ff9c3e");
    expect(enterpriseTheme.token?.colorError).toBe("#e74856");
  });

  it("has compact spacing", () => {
    expect(enterpriseTheme.token?.padding).toBe(12);
    expect(enterpriseTheme.token?.fontSize).toBe(13);
  });

  it("has table component configuration", () => {
    expect(enterpriseTheme.components?.Table).toBeDefined();
    expect(enterpriseTheme.components?.Table?.cellPaddingBlock).toBe(8);
  });

  it("exports compact table props", () => {
    expect(compactTableProps).toEqual({
      size: "small",
      bordered: true,
      variant: "outlined",
      scroll: { x: 1200, y: 500 },
      pagination: expect.objectContaining({
        showSizeChanger: true,
        pageSizeOptions: ["20", "50", "100"],
        defaultPageSize: 20,
        showTotal: expect.any(Function),
      }),
    });
  });

  it("exports standard column widths", () => {
    expect(columnWidths.id).toBe(100);
    expect(columnWidths.name).toBe(200);
    expect(columnWidths.type).toBe(100);
    expect(columnWidths.status).toBe(100);
    expect(columnWidths.date).toBe(140);
    expect(columnWidths.user).toBe(120);
    expect(columnWidths.actions).toBe(100);
  });

  describe("getStatusColor", () => {
    it("returns colors for rule/ruleset statuses", () => {
      expect(getStatusColor("DRAFT")).toBe("blue");
      expect(getStatusColor("PENDING_APPROVAL")).toBe("orange");
      expect(getStatusColor("APPROVED")).toBe("green");
      expect(getStatusColor("REJECTED")).toBe("red");
      expect(getStatusColor("ACTIVE")).toBe("green");
      expect(getStatusColor("INACTIVE")).toBe("default");
      expect(getStatusColor("ARCHIVED")).toBe("default");
    });

    it("returns colors for approval statuses", () => {
      expect(getStatusColor("PENDING")).toBe("orange");
    });

    it("returns colors for audit action types", () => {
      expect(getStatusColor("CREATE")).toBe("green");
      expect(getStatusColor("UPDATE")).toBe("blue");
      expect(getStatusColor("DELETE")).toBe("red");
      expect(getStatusColor("SUBMIT")).toBe("orange");
      expect(getStatusColor("APPROVE")).toBe("green");
      expect(getStatusColor("REJECT")).toBe("red");
    });

    it("returns default for unknown status", () => {
      expect(getStatusColor("UNKNOWN_STATUS")).toBe("default");
      expect(getStatusColor("")).toBe("default");
    });
  });

  describe("getRuleTypeColor", () => {
    it("returns colors for known rule types", () => {
      expect(getRuleTypeColor("POSITIVE")).toBe("green");
      expect(getRuleTypeColor("NEGATIVE")).toBe("red");
      expect(getRuleTypeColor("AUTH ")).toBe("blue");
      expect(getRuleTypeColor("MONITORING")).toBe("purple");
    });

    it("returns default for unknown rule types", () => {
      expect(getRuleTypeColor("UNKNOWN")).toBe("default");
      expect(getRuleTypeColor("")).toBe("default");
    });
  });

  describe("getEvaluationTypeColor", () => {
    it("returns colors for known evaluation types", () => {
      expect(getEvaluationTypeColor("AUTH ")).toBe("blue");
      expect(getEvaluationTypeColor("MONITORING")).toBe("orange");
    });

    it("returns default for unknown evaluation types", () => {
      expect(getEvaluationTypeColor("UNKNOWN")).toBe("default");
      expect(getEvaluationTypeColor("")).toBe("default");
    });
  });

  describe("getDataTypeColor", () => {
    it("returns colors for known data types", () => {
      expect(getDataTypeColor("STRING")).toBe("blue");
      expect(getDataTypeColor("NUMBER")).toBe("green");
      expect(getDataTypeColor("BOOLEAN")).toBe("orange");
      expect(getDataTypeColor("DATE")).toBe("purple");
      expect(getDataTypeColor("ENUM")).toBe("cyan");
    });

    it("returns default for unknown data types", () => {
      expect(getDataTypeColor("UNKNOWN")).toBe("default");
      expect(getDataTypeColor("")).toBe("default");
    });
  });
});
