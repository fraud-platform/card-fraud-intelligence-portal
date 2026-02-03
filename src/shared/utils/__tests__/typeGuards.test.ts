import { describe, it, expect } from "vitest";
import { isObjectWithProperty, isObjectWithPropertyOfType } from "../typeGuards";

describe("isObjectWithProperty", () => {
  it("returns true for object with property", () => {
    expect(isObjectWithProperty({ a: 1 }, "a")).toBe(true);
    expect(isObjectWithProperty({ name: "test" }, "name")).toBe(true);
  });

  it("returns false for object without property", () => {
    expect(isObjectWithProperty({ a: 1 }, "b")).toBe(false);
    expect(isObjectWithProperty({}, "a")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isObjectWithProperty(null, "a")).toBe(false);
  });

  it("returns false for primitive types", () => {
    expect(isObjectWithProperty("string", "length")).toBe(false);
    expect(isObjectWithProperty(123, "toString")).toBe(false);
    expect(isObjectWithProperty(true, "valueOf")).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isObjectWithProperty(undefined, "a")).toBe(false);
  });

  it("narrow type correctly", () => {
    const value: unknown = { status: "active" };
    if (isObjectWithProperty(value, "status")) {
      expect(value.status).toBe("active");
    }
  });
});

describe("isObjectWithPropertyOfType", () => {
  it("returns true for string property", () => {
    expect(isObjectWithPropertyOfType({ a: "test" }, "a", "string")).toBe(true);
    expect(isObjectWithPropertyOfType({ name: "John" }, "name", "string")).toBe(true);
  });

  it("returns false for wrong string type", () => {
    expect(isObjectWithPropertyOfType({ a: 123 }, "a", "string")).toBe(false);
  });

  it("returns true for number property", () => {
    expect(isObjectWithPropertyOfType({ a: 123 }, "a", "number")).toBe(true);
  });

  it("returns false for wrong number type", () => {
    expect(isObjectWithPropertyOfType({ a: "test" }, "a", "number")).toBe(false);
  });

  it("returns true for boolean property", () => {
    expect(isObjectWithPropertyOfType({ a: true }, "a", "boolean")).toBe(true);
  });

  it("returns false for wrong boolean type", () => {
    expect(isObjectWithPropertyOfType({ a: "true" }, "a", "boolean")).toBe(false);
  });

  it("returns false for missing property", () => {
    expect(isObjectWithPropertyOfType({ a: 1 }, "b", "number")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isObjectWithPropertyOfType(null, "a", "string")).toBe(false);
  });
});
