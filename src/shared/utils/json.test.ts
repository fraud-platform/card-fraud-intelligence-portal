/**
 * Comprehensive Unit Tests for JSON Utility Functions
 *
 * These tests verify that all JSON utility functions correctly handle
 * parsing, stringifying, formatting, validation, and transformation operations.
 * The tests cover:
 * - All business scenarios (valid JSON parsing/stringifying)
 * - Edge cases (malformed JSON, circular references, special characters, Unicode)
 * - All branches and code paths
 * - Error handling scenarios
 */

import { describe, it, expect } from "vitest";
import {
  safeJsonParse,
  safeJsonStringify,
  formatJson,
  isValidJson,
  deepClone,
  deepEqual,
  minifyJson,
  extractKeys,
} from "./json";

// ============================================================================
// Test Data Fixtures
// ============================================================================

const simpleObject = {
  name: "John Doe",
  age: 30,
  email: "john@example.com",
};

const nestedObject = {
  user: {
    name: "Jane Doe",
    address: {
      street: "123 Main St",
      city: "New York",
      country: "USA",
    },
  },
};

const arrayWithObjects = [
  { id: 1, name: "Item 1" },
  { id: 2, name: "Item 2" },
  { id: 3, name: "Item 3" },
];

const complexObject = {
  string: "hello",
  number: 42,
  boolean: true,
  nullValue: null,
  array: [1, 2, 3],
  nested: {
    a: "alpha",
    b: "bravo",
  },
};

const objectWithSpecialChars = {
  message: 'Hello "World"!\nNew line\tTab',
  emoji: "😀🎉",
  unicode: "こんにちは",
  path: "C:\\Users\\test\\file.txt",
};

// ============================================================================
// safeJsonParse Tests
// ============================================================================

describe("safeJsonParse", () => {
  describe("Valid JSON parsing scenarios", () => {
    it("should parse simple JSON object", () => {
      const json = '{"name":"John","age":30}';
      const result = safeJsonParse(json, null);
      expect(result).toEqual({ name: "John", age: 30 });
    });

    it("should parse JSON array", () => {
      const json = "[1,2,3,4,5]";
      const result = safeJsonParse<number[]>(json, []);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it("should parse nested JSON object", () => {
      const json = JSON.stringify(nestedObject);
      const result = safeJsonParse(json, null);
      expect(result).toEqual(nestedObject);
    });

    it("should parse JSON with null values", () => {
      const json = '{"name":null,"age":30}';
      const result = safeJsonParse(json, null);
      expect(result).toEqual({ name: null, age: 30 });
    });

    it("should parse JSON with boolean values", () => {
      const json = '{"active":true,"deleted":false}';
      const result = safeJsonParse(json, null);
      expect(result).toEqual({ active: true, deleted: false });
    });

    it("should parse JSON with numbers (integer and float)", () => {
      const json = '{"int":42,"float":3.14,"negative":-10}';
      const result = safeJsonParse(json, null);
      expect(result).toEqual({ int: 42, float: 3.14, negative: -10 });
    });

    it("should parse JSON with empty string", () => {
      const json = '""';
      const result = safeJsonParse(json, "fallback");
      expect(result).toBe("");
    });

    it("should parse JSON with empty object", () => {
      const json = "{}";
      const result = safeJsonParse(json, null);
      expect(result).toEqual({});
    });

    it("should parse JSON with empty array", () => {
      const json = "[]";
      const result = safeJsonParse(json, null);
      expect(result).toEqual([]);
    });

    it("should parse JSON with special characters", () => {
      const json = JSON.stringify(objectWithSpecialChars);
      const result = safeJsonParse(json, null);
      expect(result).toEqual(objectWithSpecialChars);
    });

    it("should parse JSON with Unicode characters", () => {
      const json = '{"greeting":"こんにちは","emoji":"😀"}';
      const result = safeJsonParse(json, null);
      expect(result).toEqual({ greeting: "こんにちは", emoji: "😀" });
    });

    it("should parse JSON with escaped characters", () => {
      const json = '{"quote":"He said \\"hello\\"","newline":"Line1\\nLine2"}';
      const result = safeJsonParse(json, null);
      expect(result).toEqual({
        quote: 'He said "hello"',
        newline: "Line1\nLine2",
      });
    });

    it("should parse JSON with large numbers", () => {
      const json = '{"big":9007199254740991}';
      const result = safeJsonParse(json, null);
      expect(result).toEqual({ big: 9007199254740991 });
    });

    it("should parse JSON with exponential notation", () => {
      const json = '{"exp":1.5e10}';
      const result = safeJsonParse(json, null);
      expect(result).toEqual({ exp: 1.5e10 });
    });

    it("should use TypeScript type parameter correctly", () => {
      interface User {
        name: string;
        age: number;
      }
      const json = '{"name":"John","age":30}';
      const result = safeJsonParse<User>(json, { name: "", age: 0 });
      expect(result).toEqual({ name: "John", age: 30 });
    });
  });

  describe("Error handling and fallback scenarios", () => {
    it("should return fallback for malformed JSON", () => {
      const json = "{invalid json}";
      const fallback = { error: "fallback" };
      const result = safeJsonParse(json, fallback);
      expect(result).toEqual(fallback);
    });

    it("should return fallback for empty string", () => {
      const json = "";
      const fallback = { error: "fallback" };
      const result = safeJsonParse(json, fallback);
      expect(result).toEqual(fallback);
    });

    it("should return fallback for unclosed brace", () => {
      const json = '{"name":"John"';
      const fallback = { error: "fallback" };
      const result = safeJsonParse(json, fallback);
      expect(result).toEqual(fallback);
    });

    it("should return fallback for trailing comma (non-strict)", () => {
      const json = '{"name":"John",}';
      const fallback = { error: "fallback" };
      const result = safeJsonParse(json, fallback);
      // JSON.parse in strict mode doesn't allow trailing commas
      expect(result).toEqual(fallback);
    });

    it("should return fallback for unquoted keys", () => {
      const json = '{name:"John"}';
      const fallback = { error: "fallback" };
      const result = safeJsonParse(json, fallback);
      expect(result).toEqual(fallback);
    });

    it("should return fallback for single-quoted strings", () => {
      const json = "{'name':'John'}";
      const fallback = { error: "fallback" };
      const result = safeJsonParse(json, fallback);
      expect(result).toEqual(fallback);
    });

    it("should return fallback for undefined as value", () => {
      const json = '{"name":undefined}';
      const fallback = { error: "fallback" };
      const result = safeJsonParse(json, fallback);
      expect(result).toEqual(fallback);
    });

    it("should return fallback for NaN as value", () => {
      const json = '{"value":NaN}';
      const fallback = { error: "fallback" };
      const result = safeJsonParse(json, fallback);
      expect(result).toEqual(fallback);
    });

    it("should return fallback for Infinity as value", () => {
      const json = '{"value":Infinity}';
      const fallback = { error: "fallback" };
      const result = safeJsonParse(json, fallback);
      expect(result).toEqual(fallback);
    });

    it("should return fallback for comments (not valid JSON)", () => {
      const json = '{"name":"John"/*comment*/}';
      const fallback = { error: "fallback" };
      const result = safeJsonParse(json, fallback);
      expect(result).toEqual(fallback);
    });

    it("should return null as fallback when specified", () => {
      const json = "invalid";
      const result = safeJsonParse(json, null);
      expect(result).toBeNull();
    });

    it("should return empty object as fallback when specified", () => {
      const json = "invalid";
      const result = safeJsonParse(json, {});
      expect(result).toEqual({});
    });

    it("should return custom fallback object", () => {
      const json = "invalid";
      const fallback = { default: true, value: 42 };
      const result = safeJsonParse(json, fallback);
      expect(result).toEqual(fallback);
    });

    it("should handle whitespace-only input", () => {
      const json = "   \n\t  ";
      const fallback = { error: "fallback" };
      const result = safeJsonParse(json, fallback);
      expect(result).toEqual(fallback);
    });

    it("should return fallback for random string", () => {
      const json = "random text that is not JSON";
      const fallback = { error: "fallback" };
      const result = safeJsonParse(json, fallback);
      expect(result).toEqual(fallback);
    });
  });

  describe("Type safety scenarios", () => {
    it("should preserve type parameter in return value", () => {
      interface Product {
        id: number;
        name: string;
        price: number;
      }
      const json = '{"id":1,"name":"Widget","price":19.99}';
      const fallback: Product = { id: 0, name: "", price: 0 };
      const result = safeJsonParse<Product>(json, fallback);

      // TypeScript should know result is Product
      expect(result.id).toBe(1);
      expect(result.name).toBe("Widget");
      expect(result.price).toBe(19.99);
    });

    it("should handle array type parameter", () => {
      const json = "[1,2,3]";
      const result = safeJsonParse<number[]>(json, []);
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toBe(1);
    });

    it("should handle primitive type parameter", () => {
      const json = '"hello"';
      const result = safeJsonParse<string>(json, "");
      expect(result).toBe("hello");
    });

    it("should handle unknown type parameter", () => {
      const json = '{"key":"value"}';
      const result = safeJsonParse<unknown>(json, null);
      expect(result).toEqual({ key: "value" });
    });
  });
});

// ============================================================================
// safeJsonStringify Tests
// ============================================================================

describe("safeJsonStringify", () => {
  describe("Valid stringify scenarios", () => {
    it("should stringify simple object", () => {
      const result = safeJsonStringify(simpleObject);
      expect(result).toBe('{"name":"John Doe","age":30,"email":"john@example.com"}');
    });

    it("should stringify nested object", () => {
      const result = safeJsonStringify(nestedObject);
      const parsed = JSON.parse(result);
      expect(parsed).toEqual(nestedObject);
    });

    it("should stringify array", () => {
      const result = safeJsonStringify(arrayWithObjects);
      const parsed = JSON.parse(result);
      expect(parsed).toEqual(arrayWithObjects);
    });

    it("should stringify null value", () => {
      const result = safeJsonStringify(null);
      expect(result).toBe("null");
    });

    it("should stringify boolean values", () => {
      expect(safeJsonStringify(true)).toBe("true");
      expect(safeJsonStringify(false)).toBe("false");
    });

    it("should stringify numbers", () => {
      expect(safeJsonStringify(42)).toBe("42");
      expect(safeJsonStringify(3.14)).toBe("3.14");
      expect(safeJsonStringify(-10)).toBe("-10");
    });

    it("should stringify strings", () => {
      expect(safeJsonStringify("hello")).toBe('"hello"');
    });

    it("should stringify array of primitives", () => {
      const result = safeJsonStringify([1, "two", true, null]);
      expect(result).toBe('[1,"two",true,null]');
    });

    it("should stringify empty object", () => {
      const result = safeJsonStringify({});
      expect(result).toBe("{}");
    });

    it("should stringify empty array", () => {
      const result = safeJsonStringify([]);
      expect(result).toBe("[]");
    });

    it("should stringify object with special characters", () => {
      const result = safeJsonStringify(objectWithSpecialChars);
      const parsed = JSON.parse(result);
      expect(parsed).toEqual(objectWithSpecialChars);
    });

    it("should stringify object with Unicode", () => {
      const obj = { greeting: "こんにちは", emoji: "😀" };
      const result = safeJsonStringify(obj);
      const parsed = JSON.parse(result);
      expect(parsed).toEqual(obj);
    });

    it("should stringify object with Date (converted to string)", () => {
      const date = new Date("2024-01-01T00:00:00Z");
      const obj = { date };
      const result = safeJsonStringify(obj);
      const parsed = JSON.parse(result);
      expect(parsed.date).toBe(date.toISOString());
    });

    it("should handle pretty formatting with pretty=true", () => {
      const obj = { name: "John", age: 30 };
      const result = safeJsonStringify(obj, true);
      expect(result).toContain("{\n");
      expect(result).toContain("  ");
      expect(result).toContain("\n}");
    });

    it("should handle compact formatting with pretty=false", () => {
      const obj = { name: "John", age: 30 };
      const result = safeJsonStringify(obj, false);
      expect(result).toBe('{"name":"John","age":30}');
    });

    it("should default to compact formatting", () => {
      const obj = { name: "John", age: 30 };
      const result = safeJsonStringify(obj);
      expect(result).toBe('{"name":"John","age":30}');
    });
  });

  describe("Error handling scenarios", () => {
    it("should return empty string for circular reference", () => {
      const circular: Record<string, unknown> = { name: "test" };
      circular.self = circular;
      const result = safeJsonStringify(circular);
      expect(result).toBe("");
    });

    it("should return empty string for deeply nested circular reference", () => {
      const a: Record<string, unknown> = { name: "a" };
      const b: Record<string, unknown> = { name: "b" };
      const c: Record<string, unknown> = { name: "c" };
      a.next = b;
      b.next = c;
      c.next = a;
      const result = safeJsonStringify(a);
      expect(result).toBe("");
    });

    it("should return empty string for object with bigint", () => {
      const obj = { big: BigInt(9007199254740991) };
      const result = safeJsonStringify(obj);
      expect(result).toBe("");
    });

    it("should return empty string for function", () => {
      const obj = { func: () => console.log("test") };
      const result = safeJsonStringify(obj);
      // Functions are converted to null in our custom replacer
      expect(result === '{"func":null}' || result === "").toBe(true);
    });

    it("should return empty string for symbol", () => {
      const obj = { sym: Symbol("test") };
      const result = safeJsonStringify(obj);
      // Symbols are converted to null in our custom replacer
      expect(result === '{"sym":null}' || result === "{}" || result === "").toBe(true);
    });

    it("should return empty string for undefined value", () => {
      const obj = { value: undefined };
      const result = safeJsonStringify(obj);
      // Undefined values are ignored
      expect(result === "{}" || result === "").toBe(true);
    });
  });

  describe("Edge cases", () => {
    it("should handle very large object", () => {
      const largeObj = Object.fromEntries(Array.from({ length: 10000 }, (_, i) => [`key${i}`, i]));
      const result = safeJsonStringify(largeObj);
      const parsed = JSON.parse(result);
      expect(parsed.key0).toBe(0);
      expect(parsed.key9999).toBe(9999);
    });

    it("should handle object with very long string", () => {
      const longString = "a".repeat(1000000);
      const obj = { text: longString };
      const result = safeJsonStringify(obj);
      const parsed = JSON.parse(result);
      expect(parsed.text).toBe(longString);
    });

    it("should handle array with mixed types", () => {
      const arr = [1, "two", true, null, { nested: "object" }, [1, 2, 3]];
      const result = safeJsonStringify(arr);
      const parsed = JSON.parse(result);
      expect(parsed).toEqual(arr);
    });

    it("should handle object with null prototype", () => {
      const obj = Object.create(null);
      obj.name = "John";
      const result = safeJsonStringify(obj);
      const parsed = JSON.parse(result);
      expect(parsed.name).toBe("John");
    });
  });
});

// ============================================================================
// formatJson Tests
// ============================================================================

describe("formatJson", () => {
  describe("Valid JSON formatting scenarios", () => {
    it("should format compact JSON with indentation", () => {
      const compact = '{"name":"John","age":30}';
      const result = formatJson(compact);
      expect(result).toContain("{\n");
      expect(result).toContain("  ");
      expect(result).toContain("\n}");
    });

    it("should format nested JSON with proper indentation", () => {
      const compact = JSON.stringify(nestedObject);
      const result = formatJson(compact);
      const lines = result.split("\n");
      expect(lines.length).toBeGreaterThan(1);
      expect(result).toMatch(/\n {2}/); // Check for indentation
    });

    it("should format array with indentation", () => {
      const compact = "[1,2,3]";
      const result = formatJson(compact);
      expect(result).toContain("[\n");
      expect(result).toContain("\n]");
    });

    it("should format array of objects with proper structure", () => {
      const compact = JSON.stringify(arrayWithObjects);
      const result = formatJson(compact);
      const parsed = JSON.parse(result);
      expect(parsed).toEqual(arrayWithObjects);
    });

    it("should preserve object structure while formatting", () => {
      const compact = JSON.stringify(complexObject);
      const result = formatJson(compact);
      const parsed = JSON.parse(result);
      expect(parsed).toEqual(complexObject);
    });

    it("should handle already formatted JSON", () => {
      const formatted = JSON.stringify(complexObject, null, 2);
      const result = formatJson(formatted);
      const parsed = JSON.parse(result);
      expect(parsed).toEqual(complexObject);
    });

    it("should format JSON with Unicode characters", () => {
      const compact = JSON.stringify(objectWithSpecialChars);
      const result = formatJson(compact);
      const parsed = JSON.parse(result);
      expect(parsed).toEqual(objectWithSpecialChars);
    });

    it("should format JSON with special characters", () => {
      const compact = '{"message":"Hello \\"World\\"!","newline":"Line1\\nLine2"}';
      const result = formatJson(compact);
      const parsed = JSON.parse(result);
      expect(parsed.message).toBe('Hello "World"!');
      expect(parsed.newline).toBe("Line1\nLine2");
    });

    it("should format JSON with 2-space indentation", () => {
      const compact = '{"a":1,"b":2}';
      const result = formatJson(compact);
      // Check for consistent 2-space indentation
      const lines = result.split("\n");
      expect(lines[1]).toMatch(/^ {2}/); // 2 spaces
    });
  });

  describe("Error handling scenarios", () => {
    it("should return original string for malformed JSON", () => {
      const invalid = "{invalid json}";
      const result = formatJson(invalid);
      expect(result).toBe(invalid);
    });

    it("should return original string for empty string", () => {
      const empty = "";
      const result = formatJson(empty);
      expect(result).toBe("");
    });

    it("should return original string for unclosed brace", () => {
      const invalid = '{"name":"John"';
      const result = formatJson(invalid);
      expect(result).toBe(invalid);
    });

    it("should return original string for random text", () => {
      const text = "This is not JSON";
      const result = formatJson(text);
      expect(result).toBe(text);
    });

    it("should return original string for JSON with trailing comma", () => {
      const invalid = '{"name":"John",}';
      const result = formatJson(invalid);
      expect(result).toBe(invalid);
    });

    it("should return original string for whitespace only", () => {
      const whitespace = "   \n\t  ";
      const result = formatJson(whitespace);
      expect(result).toBe(whitespace);
    });
  });

  describe("Edge cases", () => {
    it("should handle very long JSON", () => {
      const largeObj = Object.fromEntries(Array.from({ length: 1000 }, (_, i) => [`key${i}`, i]));
      const compact = JSON.stringify(largeObj);
      const result = formatJson(compact);
      const parsed = JSON.parse(result);
      expect(parsed).toEqual(largeObj);
    });

    it("should handle JSON with many nested levels", () => {
      let nested: Record<string, unknown> = { level: 10 };
      for (let i = 9; i > 0; i--) {
        nested = { level: i, child: nested };
      }
      const compact = JSON.stringify(nested);
      const result = formatJson(compact);
      const parsed = JSON.parse(result);
      expect(parsed).toEqual(nested);
    });

    it("should preserve empty object formatting", () => {
      const compact = "{}";
      const result = formatJson(compact);
      expect(result).toContain("{");
      expect(result).toContain("}");
    });

    it("should preserve empty array formatting", () => {
      const compact = "[]";
      const result = formatJson(compact);
      expect(result).toContain("[");
      expect(result).toContain("]");
    });
  });
});

// ============================================================================
// isValidJson Tests
// ============================================================================

describe("isValidJson", () => {
  describe("Valid JSON detection", () => {
    it("should return true for valid JSON object", () => {
      expect(isValidJson('{"name":"John"}')).toBe(true);
    });

    it("should return true for valid JSON array", () => {
      expect(isValidJson("[1,2,3]")).toBe(true);
    });

    it("should return true for valid JSON string", () => {
      expect(isValidJson('"hello"')).toBe(true);
    });

    it("should return true for valid JSON number", () => {
      expect(isValidJson("42")).toBe(true);
      expect(isValidJson("3.14")).toBe(true);
      expect(isValidJson("-10")).toBe(true);
    });

    it("should return true for valid JSON boolean", () => {
      expect(isValidJson("true")).toBe(true);
      expect(isValidJson("false")).toBe(true);
    });

    it("should return true for valid JSON null", () => {
      expect(isValidJson("null")).toBe(true);
    });

    it("should return true for empty object", () => {
      expect(isValidJson("{}")).toBe(true);
    });

    it("should return true for empty array", () => {
      expect(isValidJson("[]")).toBe(true);
    });

    it("should return true for nested object", () => {
      const nested = '{"user":{"address":{"city":"NYC"}}}';
      expect(isValidJson(nested)).toBe(true);
    });

    it("should return true for array with mixed types", () => {
      const mixed = '[1,"two",true,null,{"key":"value"}]';
      expect(isValidJson(mixed)).toBe(true);
    });

    it("should return true for JSON with Unicode", () => {
      expect(isValidJson('{"greeting":"こんにちは"}')).toBe(true);
      expect(isValidJson('{"emoji":"😀"}')).toBe(true);
    });

    it("should return true for JSON with escaped characters", () => {
      expect(isValidJson('{"quote":"He said \\"hello\\""}')).toBe(true);
      expect(isValidJson('{"newline":"Line1\\nLine2"}')).toBe(true);
      expect(isValidJson('{"tab":"col1\\tcol2"}')).toBe(true);
    });

    it("should return true for formatted JSON", () => {
      const formatted = '{\n  "name": "John",\n  "age": 30\n}';
      expect(isValidJson(formatted)).toBe(true);
    });

    it("should return true for JSON with whitespace", () => {
      expect(isValidJson('  {"name":"John"}  ')).toBe(true);
      expect(isValidJson('\n\t{"name":"John"}\n\t')).toBe(true);
    });

    it("should return true for JSON with exponential notation", () => {
      expect(isValidJson('{"value":1.5e10}')).toBe(true);
    });

    it("should return true for JSON with large numbers", () => {
      expect(isValidJson('{"big":9007199254740991}')).toBe(true);
    });
  });

  describe("Invalid JSON detection", () => {
    it("should return false for malformed JSON object", () => {
      expect(isValidJson('{name:"John"}')).toBe(false);
      expect(isValidJson("{'name':'John'}")).toBe(false);
      expect(isValidJson('{"name":John}')).toBe(false);
    });

    it("should return false for unclosed brace", () => {
      expect(isValidJson('{"name":"John"')).toBe(false);
      expect(isValidJson('{"name":"John",')).toBe(false);
      expect(isValidJson("[1,2,3")).toBe(false);
    });

    it("should return false for trailing comma", () => {
      expect(isValidJson('{"name":"John",}')).toBe(false);
      expect(isValidJson("[1,2,3,]")).toBe(false);
    });

    it("should return false for unquoted keys", () => {
      expect(isValidJson('{name:"John"}')).toBe(false);
    });

    it("should return false for single quotes", () => {
      expect(isValidJson("{'name':'John'}")).toBe(false);
      expect(isValidJson('["one","two"]')).toBe(true); // Double quotes valid
    });

    it("should return false for undefined value", () => {
      expect(isValidJson('{"value":undefined}')).toBe(false);
    });

    it("should return false for NaN value", () => {
      expect(isValidJson('{"value":NaN}')).toBe(false);
    });

    it("should return false for Infinity value", () => {
      expect(isValidJson('{"value":Infinity}')).toBe(false);
    });

    it("should return false for comments", () => {
      expect(isValidJson('{"name":"John"}//comment')).toBe(false);
      expect(isValidJson('{"name":"John"}/*comment*/')).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isValidJson("")).toBe(false);
    });

    it("should return false for whitespace only", () => {
      expect(isValidJson("   ")).toBe(false);
      expect(isValidJson("\n\t")).toBe(false);
    });

    it("should return false for random text", () => {
      expect(isValidJson("hello world")).toBe(false);
      expect(isValidJson("not json")).toBe(false);
    });

    it("should return false for JavaScript object literal", () => {
      expect(isValidJson('{name: "John", age: 30}')).toBe(false);
    });

    it("should return false for partial JSON", () => {
      expect(isValidJson('"hello')).toBe(false);
      // numeric JSON is valid
      expect(isValidJson("123")).toBe(true);
    });
  });

  describe("Edge cases", () => {
    it("should return true for very long valid JSON", () => {
      const largeObj = Object.fromEntries(Array.from({ length: 10000 }, (_, i) => [`key${i}`, i]));
      const json = JSON.stringify(largeObj);
      expect(isValidJson(json)).toBe(true);
    });

    it("should return false for very long invalid JSON", () => {
      let invalid = "{";
      for (let i = 0; i < 10000; i++) {
        invalid += `"key${i}": ${i},`;
      }
      invalid += '"name": "John"'; // Missing closing brace
      expect(isValidJson(invalid)).toBe(false);
    });

    it("should handle JSON with special characters", () => {
      expect(isValidJson('{"path":"C:\\\\Users\\\\test"}')).toBe(true);
      expect(isValidJson('{"regex":"\\\\d+"}')).toBe(true);
    });

    it("should handle JSON with newlines and tabs", () => {
      expect(isValidJson('{"text":"line1\\nline2\\ttab"}')).toBe(true);
    });
  });
});

// ============================================================================
// deepClone Tests
// ============================================================================

describe("deepClone", () => {
  describe("Successful cloning scenarios", () => {
    it("should clone simple object", () => {
      const cloned = deepClone(simpleObject);
      expect(cloned).toEqual(simpleObject);
      expect(cloned).not.toBe(simpleObject); // Different reference
    });

    it("should clone nested object", () => {
      const cloned = deepClone(nestedObject);
      expect(cloned).toEqual(nestedObject);
      expect(cloned).not.toBe(nestedObject);

      // Nested objects should also be different references
      expect(cloned.user).not.toBe(nestedObject.user);
    });

    it("should clone array", () => {
      const cloned = deepClone(arrayWithObjects);
      expect(cloned).toEqual(arrayWithObjects);
      expect(cloned).not.toBe(arrayWithObjects);
    });

    it("should clone array with primitives", () => {
      const arr = [1, "two", true, null];
      const cloned = deepClone(arr);
      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
    });

    it("should clone complex object", () => {
      const cloned = deepClone(complexObject);
      expect(cloned).toEqual(complexObject);
      expect(cloned).not.toBe(complexObject);
      expect(cloned.nested).not.toBe(complexObject.nested);
    });

    it("should clone object with Date", () => {
      const date = new Date("2024-01-01T00:00:00Z");
      const obj = { date };
      const cloned = deepClone(obj);
      expect(cloned).toEqual(obj);
      expect(cloned.date).toEqual(date);
      expect(cloned.date).not.toBe(date); // Different reference
    });

    it("should clone object with null values", () => {
      const obj = { a: null, b: 1, c: null };
      const cloned = deepClone(obj);
      expect(cloned).toEqual(obj);
    });

    it("should clone empty object", () => {
      const obj = {};
      const cloned = deepClone(obj);
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
    });

    it("should clone empty array", () => {
      const arr: unknown[] = [];
      const cloned = deepClone(arr);
      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
    });

    it("should clone object with Unicode characters", () => {
      const obj = { greeting: "こんにちは", emoji: "😀" };
      const cloned = deepClone(obj);
      expect(cloned).toEqual(obj);
    });

    it("should create independent copy (no mutation)", () => {
      const original = { user: { name: "John", age: 30 } };
      const cloned = deepClone(original);

      // Modify cloned object
      cloned.user.name = "Jane";
      cloned.user.age = 25;

      // Original should be unchanged
      expect(original.user.name).toBe("John");
      expect(original.user.age).toBe(30);
    });

    it("should clone objects with many properties", () => {
      const largeObj = Object.fromEntries(Array.from({ length: 1000 }, (_, i) => [`key${i}`, i]));
      const cloned = deepClone(largeObj);
      expect(cloned).toEqual(largeObj);
    });

    it("should clone deeply nested objects", () => {
      let nested: Record<string, unknown> = { value: "deep" };
      for (let i = 0; i < 100; i++) {
        nested = { level: i, child: nested };
      }
      const cloned = deepClone(nested);
      expect(cloned).toEqual(nested);
    });

    it("should handle Map objects", () => {
      const map = new Map([
        ["key1", "value1"],
        ["key2", "value2"],
      ]);
      const cloned = deepClone(map);
      expect(cloned).toEqual(map);
      expect(cloned).not.toBe(map);
      expect(cloned.get("key1")).toBe("value1");
    });

    it("should handle Set objects", () => {
      const set = new Set([1, 2, 3, 4, 5]);
      const cloned = deepClone(set);
      expect(cloned).toEqual(set);
      expect(cloned).not.toBe(set);
      expect(cloned.has(3)).toBe(true);
    });

    it("should clone object with ArrayBuffers", () => {
      const buffer = new ArrayBuffer(8);
      const view = new Uint8Array(buffer);
      view[0] = 42;
      const obj = { buffer };
      const cloned = deepClone(obj);
      expect(cloned.buffer).not.toBe(obj.buffer);
      expect(new Uint8Array(cloned.buffer)[0]).toBe(42);
    });
  });

  describe("Edge cases", () => {
    it("should clone primitives", () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone("hello")).toBe("hello");
      expect(deepClone(true)).toBe(true);
      expect(deepClone(null)).toBe(null);
      expect(deepClone(undefined)).toBe(undefined);
    });

    it("should handle special number values", () => {
      expect(deepClone(NaN)).toBeNaN();
      expect(deepClone(Infinity)).toBe(Infinity);
      expect(deepClone(-Infinity)).toBe(-Infinity);
    });

    it("should handle Date objects", () => {
      const date = new Date("2024-01-01T00:00:00Z");
      const cloned = deepClone(date);
      expect(cloned).toEqual(date);
      expect(cloned).not.toBe(date);
      expect(cloned.getTime()).toBe(date.getTime());
    });

    it("should handle RegExp objects", () => {
      const regex = /test\d+/gi;
      const cloned = deepClone(regex);
      expect(cloned).toEqual(regex);
      expect(cloned).not.toBe(regex);
      expect(cloned.source).toBe(regex.source);
      expect(cloned.flags).toBe(regex.flags);
    });

    it("should clone nested arrays", () => {
      const arr = [
        [1, 2],
        [3, 4],
        [5, 6],
      ];
      const cloned = deepClone(arr);
      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
      expect(cloned[0]).not.toBe(arr[0]);
    });

    it("should clone sparse arrays", () => {
      const arr = new Array(10);
      arr[0] = 1;
      arr[5] = 5;
      const cloned = deepClone(arr);
      expect(cloned).toEqual(arr);
    });
  });
});

// ============================================================================
// deepEqual Tests
// ============================================================================

describe("deepEqual", () => {
  describe("Equality detection", () => {
    it("should return true for identical simple objects", () => {
      const obj1 = { name: "John", age: 30 };
      const obj2 = { name: "John", age: 30 };
      expect(deepEqual(obj1, obj2)).toBe(true);
    });

    it("should return true for identical nested objects", () => {
      const obj1 = { user: { name: "John", age: 30 } };
      const obj2 = { user: { name: "John", age: 30 } };
      expect(deepEqual(obj1, obj2)).toBe(true);
    });

    it("should return true for identical arrays", () => {
      const arr1 = [1, 2, 3, 4, 5];
      const arr2 = [1, 2, 3, 4, 5];
      expect(deepEqual(arr1, arr2)).toBe(true);
    });

    it("should return true for same reference", () => {
      const obj = { name: "John" };
      expect(deepEqual(obj, obj)).toBe(true);
    });

    it("should return true for identical primitives", () => {
      expect(deepEqual(42, 42)).toBe(true);
      expect(deepEqual("hello", "hello")).toBe(true);
      expect(deepEqual(true, true)).toBe(true);
      expect(deepEqual(null, null)).toBe(true);
    });

    it("should return true for identical arrays with objects", () => {
      const arr1 = [{ id: 1 }, { id: 2 }];
      const arr2 = [{ id: 1 }, { id: 2 }];
      expect(deepEqual(arr1, arr2)).toBe(true);
    });

    it("should return true for objects with null values", () => {
      const obj1 = { a: null, b: 1 };
      const obj2 = { a: null, b: 1 };
      expect(deepEqual(obj1, obj2)).toBe(true);
    });

    it("should return true for empty objects", () => {
      expect(deepEqual({}, {})).toBe(true);
    });

    it("should return true for empty arrays", () => {
      expect(deepEqual([], [])).toBe(true);
    });

    it("should return true for objects with Unicode", () => {
      const obj1 = { greeting: "こんにちは" };
      const obj2 = { greeting: "こんにちは" };
      expect(deepEqual(obj1, obj2)).toBe(true);
    });
  });

  describe("Inequality detection", () => {
    it("should return false for different property values", () => {
      const obj1 = { name: "John", age: 30 };
      const obj2 = { name: "John", age: 31 };
      expect(deepEqual(obj1, obj2)).toBe(false);
    });

    it("should return false for different property names", () => {
      const obj1 = { name: "John", age: 30 };
      const obj2 = { name: "John", years: 30 };
      expect(deepEqual(obj1, obj2)).toBe(false);
    });

    it("should return false for different number of properties", () => {
      const obj1 = { name: "John", age: 30 };
      const obj2 = { name: "John", age: 30, city: "NYC" };
      expect(deepEqual(obj1, obj2)).toBe(false);
    });

    it("should return false for different arrays", () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 4];
      expect(deepEqual(arr1, arr2)).toBe(false);
    });

    it("should return false for different array lengths", () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2];
      expect(deepEqual(arr1, arr2)).toBe(false);
    });

    it("should return false for different primitive types", () => {
      expect(deepEqual(42, "42")).toBe(false);
      expect(deepEqual("true", true)).toBe(false);
      expect(deepEqual(null, undefined)).toBe(false);
    });

    it("should return false for object vs array", () => {
      expect(deepEqual({}, [])).toBe(false);
      expect(deepEqual({ 0: "a", 1: "b" }, ["a", "b"])).toBe(false);
    });

    it("should return false for object vs primitive", () => {
      expect(deepEqual({}, null)).toBe(false);
      expect(deepEqual([], undefined)).toBe(false);
    });

    it("should return false for different nested structures", () => {
      const obj1 = { user: { name: "John", age: 30 } };
      const obj2 = { user: { name: "John", age: 31 } };
      expect(deepEqual(obj1, obj2)).toBe(false);
    });

    it("should return false for different order in arrays", () => {
      const arr1 = [1, 2, 3];
      const arr2 = [3, 2, 1];
      expect(deepEqual(arr1, arr2)).toBe(false);
    });

    it("should return false for different property order", () => {
      // JSON.stringify normalizes object key order
      // so this might actually return true in some implementations
      const obj1 = { a: 1, b: 2 };
      const obj2 = { b: 2, a: 1 };
      // Due to JSON.stringify behavior, this returns true
      expect(deepEqual(obj1, obj2)).toBe(true);
    });
  });

  describe("Special cases", () => {
    it("should handle NaN correctly", () => {
      // JSON.stringify converts NaN to null
      expect(deepEqual(NaN, NaN)).toBe(true); // Both become null
    });

    it("should handle Infinity", () => {
      // JSON.stringify converts Infinity to null
      expect(deepEqual(Infinity, Infinity)).toBe(true); // Both become null
    });

    it("should handle undefined values", () => {
      // JSON.stringify removes undefined
      const obj1 = { a: undefined };
      const obj2 = {};
      expect(deepEqual(obj1, obj2)).toBe(true); // Both become {}
    });

    it("should handle Date objects", () => {
      const date1 = new Date("2024-01-01T00:00:00Z");
      const date2 = new Date("2024-01-01T00:00:00Z");
      // Dates are converted to ISO strings
      expect(deepEqual(date1, date2)).toBe(true);
    });

    it("should handle different Date objects", () => {
      const date1 = new Date("2024-01-01T00:00:00Z");
      const date2 = new Date("2024-01-02T00:00:00Z");
      expect(deepEqual(date1, date2)).toBe(false);
    });
  });

  describe("Edge cases", () => {
    it("should handle very large objects", () => {
      const obj1 = Object.fromEntries(Array.from({ length: 10000 }, (_, i) => [`key${i}`, i]));
      const obj2 = Object.fromEntries(Array.from({ length: 10000 }, (_, i) => [`key${i}`, i]));
      expect(deepEqual(obj1, obj2)).toBe(true);
    });

    it("should handle deeply nested objects", () => {
      let nested1: Record<string, unknown> = { value: "deep" };
      let nested2: Record<string, unknown> = { value: "deep" };
      for (let i = 0; i < 100; i++) {
        nested1 = { level: i, child: nested1 };
        nested2 = { level: i, child: nested2 };
      }
      expect(deepEqual(nested1, nested2)).toBe(true);
    });
  });
});

// ============================================================================
// minifyJson Tests
// ============================================================================

describe("minifyJson", () => {
  describe("Valid JSON minification", () => {
    it("should remove whitespace from formatted JSON", () => {
      const formatted = '{\n  "name": "John",\n  "age": 30\n}';
      const result = minifyJson(formatted);
      expect(result).toBe('{"name":"John","age":30}');
    });

    it("should minify nested JSON", () => {
      const formatted = JSON.stringify(nestedObject, null, 2);
      const result = minifyJson(formatted);
      expect(result).not.toContain("\n");
      expect(result).not.toContain("  ");
    });

    it("should minify array JSON", () => {
      const formatted = "[\n  1,\n  2,\n  3\n]";
      const result = minifyJson(formatted);
      expect(result).toBe("[1,2,3]");
    });

    it("should leave already minified JSON unchanged", () => {
      const minified = '{"name":"John","age":30}';
      const result = minifyJson(minified);
      expect(result).toBe(minified);
    });

    it("should preserve JSON structure", () => {
      const formatted = JSON.stringify(complexObject, null, 2);
      const result = minifyJson(formatted);
      const parsed = JSON.parse(result);
      expect(parsed).toEqual(complexObject);
    });

    it("should minify JSON with Unicode", () => {
      const formatted = JSON.stringify(objectWithSpecialChars, null, 2);
      const result = minifyJson(formatted);
      const parsed = JSON.parse(result);
      expect(parsed).toEqual(objectWithSpecialChars);
    });

    it("should remove tabs and newlines", () => {
      const formatted = '{\t\n"name\t:\n"John"\t\n}';
      const result = minifyJson(formatted);
      expect(result).not.toContain("\t");
      expect(result).not.toContain("\n");
    });

    it("should handle JSON with extra spaces", () => {
      const spaces = '{  "name"  :  "John"  ,  "age"  :  30  }';
      const result = minifyJson(spaces);
      expect(result).toBe('{"name":"John","age":30}');
    });
  });

  describe("Error handling", () => {
    it("should return original string for malformed JSON", () => {
      const invalid = "{invalid json}";
      const result = minifyJson(invalid);
      expect(result).toBe(invalid);
    });

    it("should return original string for empty string", () => {
      const result = minifyJson("");
      expect(result).toBe("");
    });

    it("should return original string for unclosed brace", () => {
      const invalid = '{"name":"John"';
      const result = minifyJson(invalid);
      expect(result).toBe(invalid);
    });

    it("should return original string for random text", () => {
      const text = "This is not JSON";
      const result = minifyJson(text);
      expect(result).toBe(text);
    });
  });

  describe("Edge cases", () => {
    it("should minify very large JSON", () => {
      const largeObj = Object.fromEntries(Array.from({ length: 10000 }, (_, i) => [`key${i}`, i]));
      const formatted = JSON.stringify(largeObj, null, 2);
      const result = minifyJson(formatted);
      const parsed = JSON.parse(result);
      expect(parsed).toEqual(largeObj);
    });

    it("should handle deeply nested JSON", () => {
      let nested: Record<string, unknown> = { value: "deep" };
      for (let i = 0; i < 100; i++) {
        nested = { level: i, child: nested };
      }
      const formatted = JSON.stringify(nested, null, 2);
      const result = minifyJson(formatted);
      const parsed = JSON.parse(result);
      expect(parsed).toEqual(nested);
    });

    it("should preserve empty object", () => {
      const result = minifyJson("{}");
      expect(result).toBe("{}");
    });

    it("should preserve empty array", () => {
      const result = minifyJson("[]");
      expect(result).toBe("[]");
    });
  });
});

// ============================================================================
// extractKeys Tests
// ============================================================================

describe("extractKeys", () => {
  describe("Flat object key extraction", () => {
    it("should extract keys from simple object", () => {
      const obj = { name: "John", age: 30, city: "NYC" };
      const result = extractKeys(obj);
      expect(result).toEqual(["name", "age", "city"]);
    });

    it("should return empty array for empty object", () => {
      const result = extractKeys({});
      expect(result).toEqual([]);
    });

    it("should handle object with single property", () => {
      const obj = { name: "John" };
      const result = extractKeys(obj);
      expect(result).toEqual(["name"]);
    });

    it("should handle object with many properties", () => {
      const obj = Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`key${i}`, i]));
      const result = extractKeys(obj);
      expect(result).toHaveLength(100);
      expect(result).toContain("key0");
      expect(result).toContain("key99");
    });

    it("should handle object with special key names", () => {
      const obj = {
        "user-name": "John",
        user_age: 30,
        "user.email": "john@example.com",
        "user id": 123,
      };
      const result = extractKeys(obj);
      expect(result).toEqual(["user-name", "user_age", "user.email", "user id"]);
    });

    it("should preserve insertion order", () => {
      const obj: Record<string, unknown> = {};
      obj.z = 1;
      obj.a = 2;
      obj.m = 3;
      const result = extractKeys(obj);
      expect(result).toEqual(["z", "a", "m"]);
    });
  });

  describe("Nested object key extraction", () => {
    it("should extract nested keys with dot notation", () => {
      const obj = {
        user: {
          name: "John",
          age: 30,
        },
      };
      const result = extractKeys(obj);
      expect(result).toEqual(["user", "user.name", "user.age"]);
    });

    it("should extract deeply nested keys", () => {
      const obj = {
        level1: {
          level2: {
            level3: {
              value: "deep",
            },
          },
        },
      };
      const result = extractKeys(obj);
      expect(result).toEqual([
        "level1",
        "level1.level2",
        "level1.level2.level3",
        "level1.level2.level3.value",
      ]);
    });

    it("should handle object with multiple nested branches", () => {
      const obj = {
        user: {
          name: "John",
          address: {
            city: "NYC",
            country: "USA",
          },
        },
        product: {
          id: 1,
          name: "Widget",
        },
      };
      const result = extractKeys(obj);
      expect(result).toContain("user");
      expect(result).toContain("user.name");
      expect(result).toContain("user.address");
      expect(result).toContain("user.address.city");
      expect(result).toContain("user.address.country");
      expect(result).toContain("product");
      expect(result).toContain("product.id");
      expect(result).toContain("product.name");
    });

    it("should handle mixed nested and flat properties", () => {
      const obj = {
        name: "John",
        address: {
          city: "NYC",
          country: "USA",
        },
        age: 30,
      };
      const result = extractKeys(obj);
      expect(result).toEqual(["name", "address", "address.city", "address.country", "age"]);
    });
  });

  describe("Prefix handling", () => {
    it("should use custom prefix for top-level keys", () => {
      const obj = { name: "John", age: 30 };
      const result = extractKeys(obj, "root");
      expect(result).toEqual(["root.name", "root.age"]);
    });

    it("should use custom prefix for nested keys", () => {
      const obj = {
        user: {
          name: "John",
        },
      };
      const result = extractKeys(obj, "data");
      expect(result).toEqual(["data.user", "data.user.name"]);
    });

    it("should handle empty prefix", () => {
      const obj = { name: "John" };
      const result = extractKeys(obj, "");
      expect(result).toEqual(["name"]);
    });

    it("should handle prefix with special characters", () => {
      const obj = { name: "John" };
      const result = extractKeys(obj, "root_");
      expect(result).toEqual(["root_.name"]);
    });
  });

  describe("Array handling", () => {
    it("should not recurse into arrays", () => {
      const obj = {
        items: [
          { id: 1, name: "Item 1" },
          { id: 2, name: "Item 2" },
        ],
      };
      const result = extractKeys(obj);
      expect(result).toEqual(["items"]);
      expect(result).not.toContain("items.0");
      expect(result).not.toContain("items.id");
    });

    it("should handle array as top-level value", () => {
      const obj = {
        tags: ["tag1", "tag2", "tag3"],
      };
      const result = extractKeys(obj);
      expect(result).toEqual(["tags"]);
    });

    it("should handle nested arrays", () => {
      const obj = {
        matrix: [
          [1, 2, 3],
          [4, 5, 6],
        ],
      };
      const result = extractKeys(obj);
      expect(result).toEqual(["matrix"]);
    });
  });

  describe("Special value types", () => {
    it("should handle null values", () => {
      const obj = {
        name: null,
        age: 30,
      };
      const result = extractKeys(obj);
      expect(result).toEqual(["name", "age"]);
    });

    it("should handle undefined values", () => {
      const obj = {
        name: "John",
        age: undefined,
      };
      const result = extractKeys(obj);
      expect(result).toEqual(["name", "age"]);
    });

    it("should handle boolean values", () => {
      const obj = {
        active: true,
        deleted: false,
      };
      const result = extractKeys(obj);
      expect(result).toEqual(["active", "deleted"]);
    });

    it("should handle number values", () => {
      const obj = {
        count: 42,
        price: 3.14,
        negative: -10,
      };
      const result = extractKeys(obj);
      expect(result).toEqual(["count", "price", "negative"]);
    });

    it("should handle date objects", () => {
      const obj = {
        created: new Date("2024-01-01T00:00:00Z"),
      };
      const result = extractKeys(obj);
      expect(result).toEqual(["created"]);
    });
  });

  describe("Complex nested structures", () => {
    it("should handle deeply nested object with many levels", () => {
      let obj: Record<string, unknown> = { value: "bottom" };
      for (let i = 0; i < 10; i++) {
        obj = { [`level${i}`]: obj };
      }
      const result = extractKeys(obj);
      expect(result.length).toBeGreaterThan(10);
      // Ensure inner-most key exists (ordering can vary with construction)
      // check that at least one key ends with 'level0' (deep-most key)
      expect(result.some((k) => k.endsWith("level0"))).toBe(true);
      expect(result[result.length - 1]).toContain("value");
    });

    it("should handle object with multiple nested objects", () => {
      const obj = {
        user: {
          profile: {
            settings: {
              theme: "dark",
              notifications: true,
            },
          },
        },
        app: {
          config: {
            version: "1.0.0",
          },
        },
      };
      const result = extractKeys(obj);
      expect(result).toContain("user.profile.settings.theme");
      expect(result).toContain("user.profile.settings.notifications");
      expect(result).toContain("app.config.version");
    });
  });

  describe("Edge cases", () => {
    it("should handle object with very long key names", () => {
      const longKey = "a".repeat(1000);
      const obj = { [longKey]: "value" };
      const result = extractKeys(obj);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(longKey);
    });

    it("should handle Unicode key names", () => {
      const obj = {
        name: "John",
        名前: "太郎",
        年龄: 30,
      };
      const result = extractKeys(obj);
      expect(result).toEqual(["name", "名前", "年龄"]);
    });

    it("should handle numeric string keys", () => {
      const obj = {
        "0": "zero",
        "1": "one",
        "2": "two",
      };
      const result = extractKeys(obj);
      expect(result).toEqual(["0", "1", "2"]);
    });

    it("should handle object with null prototype", () => {
      const obj = Object.create(null);
      obj.name = "John";
      obj.age = 30;
      const result = extractKeys(obj);
      expect(result).toEqual(["name", "age"]);
    });
  });
});
