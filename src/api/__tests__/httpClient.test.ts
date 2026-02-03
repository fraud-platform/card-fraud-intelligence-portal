import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AxiosError } from "axios";
import httpClient, { get, post, put, patch, del, request } from "../httpClient";

vi.mock("../../app/auth0Client", () => ({
  getAccessToken: vi.fn(),
  isAuth0Enabled: vi.fn(),
}));

import { getAccessToken, isAuth0Enabled } from "../../app/auth0Client";

describe("httpClient helpers and interceptors", () => {
  let originalLocalStorage: Storage;
  beforeEach(() => {
    originalLocalStorage = global.localStorage;
    const store: Record<string, string> = {};
    // minimal localStorage mock
    (global as any).localStorage = {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
    } as unknown as Storage;

    vi.restoreAllMocks();
  });

  afterEach(() => {
    (global as any).localStorage = originalLocalStorage;
  });

  it("get/post/put/patch/del call request and return data", async () => {
    const fakeData = { ok: true };
    const reqSpy = vi.spyOn(httpClient, "request").mockResolvedValue({ data: fakeData } as any);

    const g = await get("/foo");
    expect(g).toEqual(fakeData);
    expect(reqSpy).toHaveBeenCalledWith(expect.objectContaining({ method: "GET", url: "/foo" }));

    const p = await post("/foo", { a: 1 });
    expect(p).toEqual(fakeData);
    expect(reqSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: "POST", url: "/foo", data: { a: 1 } })
    );

    const pu = await put("/foo", { b: 2 });
    expect(pu).toEqual(fakeData);
    expect(reqSpy).toHaveBeenCalledWith(expect.objectContaining({ method: "PUT", url: "/foo" }));

    const pat = await patch("/foo", { c: 3 });
    expect(pat).toEqual(fakeData);
    expect(reqSpy).toHaveBeenCalledWith(expect.objectContaining({ method: "PATCH", url: "/foo" }));

    const d = await del("/foo");
    expect(d).toEqual(fakeData);
    expect(reqSpy).toHaveBeenCalledWith(expect.objectContaining({ method: "DELETE", url: "/foo" }));
  });

  it("request bubbles errors when httpClient.request rejects", async () => {
    const err = new Error("network");
    vi.spyOn(httpClient, "request").mockRejectedValue(err as any);
    await expect(request({ url: "/x" } as any)).rejects.toThrow("network");
  });

  it("request interceptor attaches Auth0 token when enabled", async () => {
    // access request interceptor handlers
    (isAuth0Enabled as any).mockReturnValue(true);
    (getAccessToken as any).mockResolvedValue("token-xyz");

    const handlers = (httpClient.interceptors.request as any).handlers as Array<any>;
    const fulfilled = handlers[0].fulfilled;

    const cfg = { headers: {} } as any;
    const res = await fulfilled(cfg);
    expect(res.headers.Authorization).toBe("Bearer token-xyz");
  });

  it("request interceptor falls back to localStorage token when auth0 disabled", async () => {
    (isAuth0Enabled as any).mockReturnValue(false);
    // put token into localStorage mock
    localStorage.setItem("auth_token", "local-123");

    const handlers = (httpClient.interceptors.request as any).handlers as Array<any>;
    const fulfilled = handlers[0].fulfilled;

    const cfg = { headers: {} } as any;
    const res = await fulfilled(cfg);
    expect(res.headers.Authorization).toBe("Bearer local-123");
  });

  it("response interceptor transforms 401 into Authentication required and clears storage", async () => {
    const handlers = (httpClient.interceptors.response as any).handlers as Array<any>;
    const rejected = handlers.find((h: any) => h.rejected).rejected;

    // mock error that resembles AxiosError
    const mockError: Partial<AxiosError> = {
      response: { status: 401, data: { message: "Bad token" } } as any,
      message: "Request failed",
    };

    // set items in localStorage
    localStorage.setItem("auth_token", "t");
    localStorage.setItem("user", "u");

    await expect(rejected(mockError as any)).rejects.toMatchObject({
      message: "Authentication required",
      status: 401,
    });
    expect(localStorage.getItem("auth_token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("response interceptor maps 403 to permission message", async () => {
    const handlers = (httpClient.interceptors.response as any).handlers as Array<any>;
    const rejected = handlers.find((h: any) => h.rejected).rejected;

    const mockError: Partial<AxiosError> = {
      response: { status: 403, data: { message: "Forbidden" } } as any,
      message: "Request failed",
    };

    await expect(rejected(mockError as any)).rejects.toMatchObject({
      message: "You do not have permission to perform this action",
      status: 403,
    });
  });

  it("response interceptor preserves non-JSON message", async () => {
    const handlers = (httpClient.interceptors.response as any).handlers as Array<any>;
    const rejected = handlers.find((h: any) => h.rejected).rejected;

    const mockError: Partial<AxiosError> = {
      message: "network error happened",
    };

    await expect(rejected(mockError as any)).rejects.toMatchObject({
      message: "network error happened",
    });
  });

  it("request interceptor attaches nothing when Auth0 returns null token", async () => {
    (isAuth0Enabled as any).mockReturnValue(true);
    (getAccessToken as any).mockResolvedValue(null);

    const handlers = (httpClient.interceptors.request as any).handlers as Array<any>;
    const fulfilled = handlers[0].fulfilled;

    const cfg: any = { headers: {} };
    const res = await fulfilled(cfg);
    expect(res.headers.Authorization).toBeUndefined();
  });

  it("request interceptor rejects error with thrown error message", async () => {
    const handlers = (httpClient.interceptors.request as any).handlers as Array<any>;
    const rejected = handlers[0].rejected;

    await expect(rejected(new Error("boom"))).rejects.toThrow("boom");
  });

  it("response interceptor maps server data code and errors to ApiError", async () => {
    const handlers = (httpClient.interceptors.response as any).handlers as Array<any>;
    const rejected = handlers.find((h: any) => h.rejected).rejected;

    const mockError: Partial<AxiosError> = {
      response: {
        status: 400,
        data: { message: "Bad Request", code: "BAD", errors: { field: ["err"] } },
      } as any,
      message: "Request failed",
    };

    await expect(rejected(mockError as any)).rejects.toMatchObject({
      message: "Bad Request",
      code: "BAD",
      errors: { field: ["err"] },
    });
  });
});
