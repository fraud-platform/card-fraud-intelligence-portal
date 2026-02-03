import { describe, it, expect } from "vitest";
import { toAuthError, getErrorMessage, toError } from "../errors";

describe("error utilities", () => {
  it("toAuthError handles string", () => {
    expect(toAuthError("oops")).toEqual({ name: "Error", message: "oops" });
  });

  it("toAuthError handles Error instance", () => {
    const e = new TypeError("bad");
    expect(toAuthError(e)).toEqual({ name: "TypeError", message: "bad" });
  });

  it("toAuthError handles unknown", () => {
    expect(toAuthError(123)).toEqual({ name: "Error", message: "Unknown error" });
  });

  it("getErrorMessage returns string for string input", () => {
    expect(getErrorMessage("hello")).toBe("hello");
  });

  it("getErrorMessage returns message for Error", () => {
    expect(getErrorMessage(new Error("boom"))).toBe("boom");
  });

  it("getErrorMessage handles unknown", () => {
    expect(getErrorMessage({})).toBe("Unknown error");
  });

  it("toError preserves Error instances", () => {
    const e = new Error("x");
    expect(toError(e)).toBe(e);
  });

  it("toError wraps non-Error values", () => {
    const wrapped = toError("str");
    expect(wrapped).toBeInstanceOf(Error);
    expect((wrapped as any).raw).toBe("str");
  });
});
