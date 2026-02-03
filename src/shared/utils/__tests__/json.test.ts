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
} from "../json";

describe("json utils", () => {
  it("safeJsonParse returns parsed object or fallback", () => {
    expect(safeJsonParse('{"a":1}', {})).toEqual({ a: 1 });
    expect(safeJsonParse("not json", { ok: true })).toEqual({ ok: true });
    expect(safeJsonParse("", null)).toBeNull();
  });

  it("safeJsonStringify handles primitives, functions, symbols, bigint and circular refs", () => {
    expect(safeJsonStringify({ a: 1 })).toBe('{"a":1}');
    const objWithFn = { a: () => 1 } as any;
    // functions are replaced with null
    expect(safeJsonStringify(objWithFn)).toBe('{"a":null}');

    const sym = Symbol("s");
    expect(safeJsonStringify({ s: sym })).toBe('{"s":null}');

    // bigint should cause stringify to return empty string
    expect(safeJsonStringify(BigInt(123) as unknown)).toBe("");

    // circular reference -> empty string
    const a: any = { n: 1 };
    a.self = a;
    expect(safeJsonStringify(a)).toBe("");

    // pretty formatting
    const pretty = safeJsonStringify({ a: 1, b: { c: 2 } }, true);
    expect(pretty).toContain('\n  "b"');
  });

  it("formatJson and isValidJson behave correctly", () => {
    const s = '{"z":2,"a":1}';
    const formatted = formatJson(s);
    expect(formatted).toContain("\n");
    expect(isValidJson(s)).toBe(true);
    expect(isValidJson("notjson")).toBe(false);

    // format returns original on parse failure
    const broken = "{a:1}";
    expect(formatJson(broken)).toBe(broken);
  });

  it("deepClone produces a separate object", () => {
    const original = { a: { b: 1 } };
    const cloned = deepClone(original);
    expect(cloned).toEqual(original);
    (cloned.a as any).b = 2;
    expect(original.a.b).toBe(1);
  });

  it("deepEqual compares many shapes", () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual(NaN, NaN)).toBe(true);
    expect(deepEqual("a", "b")).toBe(false);

    // Dates
    expect(deepEqual(new Date("2020-01-01"), new Date("2020-01-01"))).toBe(true);
    expect(deepEqual(new Date("2020-01-01"), new Date("2020-01-02"))).toBe(false);

    // RegExp
    expect(deepEqual(/a/i, /a/i)).toBe(true);
    expect(deepEqual(/a/i, /b/i)).toBe(false);

    // Arrays
    expect(deepEqual([1, 2], [1, 2])).toBe(true);
    expect(deepEqual([1, 2], [2, 1])).toBe(false);

    // Maps
    const m1 = new Map<string, number>([
      ["x", 1],
      ["y", 2],
    ]);
    const m2 = new Map<string, number>([
      ["x", 1],
      ["y", 2],
    ]);
    expect(deepEqual(m1, m2)).toBe(true);

    // Sets
    expect(deepEqual(new Set([1, 2]), new Set([1, 2]))).toBe(true);
    expect(deepEqual(new Set([1, 2]), new Set([2, 3]))).toBe(false);

    // Objects order-insensitive and undefined omitted
    const o1 = { a: 1, b: undefined, c: 3 };
    const o2 = { c: 3, a: 1 };
    expect(deepEqual(o1, o2)).toBe(true);

    // Nested
    const nestedA = { x: { y: [1, { z: "a" }] } };
    const nestedB = { x: { y: [1, { z: "a" }] } };
    expect(deepEqual(nestedA, nestedB)).toBe(true);
  });

  it("minifyJson minifies valid json and cleans invalid", () => {
    const pretty = '{\n  "a": 1,\n  "b": 2\n}';
    expect(minifyJson(pretty)).toBe('{"a":1,"b":2}');

    const invalid = "{ a: 1,\n b : 2 }";
    const cleaned = minifyJson(invalid);
    expect(cleaned).toContain("{");
    expect(cleaned).toContain(":1");
  });

  it("extractKeys returns nested keys dot-separated", () => {
    const obj = { a: 1, b: { c: 2, d: { e: 3 } } };
    const keys = extractKeys(obj);
    expect(keys).toEqual(expect.arrayContaining(["a", "b.c", "b.d.e"]));
  });
});
