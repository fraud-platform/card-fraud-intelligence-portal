import { describe, it, expect, beforeEach, vi } from "vitest";
import { authProvider, getCurrentUser, getCurrentUserRoles } from "../authProvider";
import * as auth0 from "../auth0Client";

beforeEach(() => {
  // Clear session storage between tests
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe("authProvider (dev session flow)", () => {
  beforeEach(() => {
    // Force dev-mode behavior (Auth0 disabled) for these unit tests
    vi.spyOn(auth0, "isAuth0Enabled").mockReturnValue(false as any);
  });

  it("login returns error when username missing", async () => {
    const res = await authProvider.login({} as any);
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });

  it("login returns error for invalid role", async () => {
    const res = await authProvider.login({ username: "tom", roles: ["INVALID"] } as any);
    expect(res.success).toBe(false);
    expect(res.error?.message).toMatch(/At least one valid role is required/);
  });

  it("successful login stores session and returns redirect", async () => {
    const res = await authProvider.login({ username: "alice", roles: ["RULE_MAKER"] } as any);
    expect(res.success).toBe(true);
    expect(res.redirectTo).toBe("/");

    const user = getCurrentUser();
    expect(user?.username).toBe("alice");
    expect(getCurrentUserRoles()).toEqual(expect.arrayContaining(["RULE_MAKER"]));
  });

  it("logout clears session", async () => {
    await authProvider.login({ username: "bob", roles: ["RULE_MAKER"] } as any);
    expect(getCurrentUser()).not.toBeNull();

    const out = await authProvider.logout();
    expect(out.success).toBe(true);
    expect(getCurrentUser()).toBeNull();
  });

  it("check returns authenticated false when no session", async () => {
    const res = await authProvider.check();
    expect(res.authenticated).toBe(false);
    expect(res.redirectTo).toBe("/login");
  });

  it("check returns authenticated true when session exists", async () => {
    await authProvider.login({ username: "test", roles: ["RULE_MAKER"] } as any);
    const res = await authProvider.check();
    expect(res.authenticated).toBe(true);
  });

  it("onError handles string and Error and status codes", async () => {
    const s = await authProvider.onError("simple");
    expect(s.error).toBeDefined();

    const e = await authProvider.onError(new Error("boom"));
    expect(e.error).toBeInstanceOf(Error);

    const unauthorized = await authProvider.onError({ status: 401, message: "x" } as any);
    expect(unauthorized.logout).toBe(true);
    expect(unauthorized.redirectTo).toBe("/login");

    const forbidden = await authProvider.onError({ status: 403 } as any);
    expect(forbidden.logout).toBe(true);
  });

  it("onError handles unknown error type", async () => {
    const res = await authProvider.onError({ custom: "error" });
    expect(res.error).toBeDefined();
  });

  it("onError handles object without status", async () => {
    const res = await authProvider.onError({ data: "some data" });
    expect(res.error).toBeDefined();
    expect(res.logout).toBeUndefined();
  });

  it("onError handles 404 without logout", async () => {
    const res = await authProvider.onError({ status: 404 } as any);
    expect(res.error).toBeDefined();
    expect(res.logout).toBeUndefined();
  });

  it("onError handles circular JSON", async () => {
    const circular: any = { data: "test" };
    circular.self = circular;
    const res = await authProvider.onError(circular);
    expect(res.error).toBeDefined();
  });

  it("getPermissions returns roles when logged in", async () => {
    await authProvider.login({ username: "lucy", roles: ["RULE_CHECKER"] } as any);
    expect(await authProvider.getPermissions()).toEqual(expect.arrayContaining(["RULE_CHECKER"]));
  });

  it("getPermissions returns null when not logged in", async () => {
    expect(await authProvider.getPermissions()).toBeNull();
  });

  it("getIdentity returns null when not logged in", async () => {
    expect(await authProvider.getIdentity()).toBeNull();
  });

  it("getIdentity returns user when logged in", async () => {
    await authProvider.login({ username: "john", roles: ["RULE_MAKER"] } as any);
    const user = await authProvider.getIdentity();
    expect(user).not.toBeNull();
    expect(user?.username).toBe("john");
  });
});

describe("authProvider (Auth0 enabled flow)", () => {
  beforeEach(() => {
    vi.spyOn(auth0, "isAuth0Enabled").mockReturnValue(true as any);
  });

  it("login calls loginWithRedirect when Auth0 enabled", async () => {
    vi.spyOn(auth0, "loginWithRedirect").mockResolvedValue(undefined);

    const res = await authProvider.login({ returnTo: "/dashboard" } as any);
    expect(res.success).toBe(true);
    expect(auth0.loginWithRedirect).toHaveBeenCalledWith("/dashboard");
  });

  it("login handles loginWithRedirect errors", async () => {
    vi.spyOn(auth0, "loginWithRedirect").mockRejectedValue(new Error("Auth0 login failed"));

    const res = await authProvider.login({ returnTo: "/" } as any);
    expect(res.success).toBe(false);
    expect(res.error?.message).toBe("Auth0 login failed");
  });

  it("logout calls logoutToHome when Auth0 enabled", async () => {
    vi.spyOn(auth0, "logoutToHome").mockResolvedValue(undefined);

    const res = await authProvider.logout();
    expect(res.success).toBe(true);
    expect(auth0.logoutToHome).toHaveBeenCalled();
  });

  it("logout handles logoutToHome errors", async () => {
    vi.spyOn(auth0, "logoutToHome").mockRejectedValue(new Error("Logout failed"));

    const res = await authProvider.logout();
    expect(res.success).toBe(false);
    expect(res.error?.message).toBe("Logout failed");
  });

  it("check returns authenticated when Auth0 isAuthenticated is true", async () => {
    vi.spyOn(auth0, "isAuthenticated").mockResolvedValue(true);

    const res = await authProvider.check();
    expect(res.authenticated).toBe(true);
  });

  it("check returns not authenticated when Auth0 isAuthenticated is false", async () => {
    vi.spyOn(auth0, "isAuthenticated").mockResolvedValue(false);

    const res = await authProvider.check();
    expect(res.authenticated).toBe(false);
    expect(res.redirectTo).toBe("/login");
  });

  it("check handles Auth0 authentication errors", async () => {
    vi.spyOn(auth0, "isAuthenticated").mockRejectedValue(new Error("Auth check failed"));

    const res = await authProvider.check();
    expect(res.authenticated).toBe(false);
    expect(res.redirectTo).toBe("/login");
  });

  it("getIdentity returns user from Auth0 profile", async () => {
    const mockProfile: Record<string, unknown> = {
      sub: "auth0|123",
      nickname: "testuser",
      email: "test@example.com",
      name: "Test User",
    };

    vi.spyOn(auth0, "getUserProfile").mockResolvedValue(mockProfile as any);
    vi.spyOn(auth0, "getAppRoles").mockResolvedValue(["RULE_MAKER"] as any);

    const user = await authProvider.getIdentity();
    expect(user).not.toBeNull();
    expect(user?.username).toBe("testuser");
    expect(user?.email).toBe("test@example.com");
    expect(user?.roles).toEqual(expect.arrayContaining(["RULE_MAKER"]));
  });

  it("getIdentity returns null when Auth0 profile is null", async () => {
    vi.spyOn(auth0, "getUserProfile").mockResolvedValue(null);
    vi.spyOn(auth0, "getAppRoles").mockResolvedValue([] as any);

    const user = await authProvider.getIdentity();
    expect(user).toBeNull();
  });

  it("getIdentity handles missing profile fields gracefully", async () => {
    const minimalProfile: Record<string, unknown> = {
      sub: "minimal-123",
    };

    vi.spyOn(auth0, "getUserProfile").mockResolvedValue(minimalProfile as any);
    vi.spyOn(auth0, "getAppRoles").mockResolvedValue(["RULE_CHECKER"] as any);

    const user = await authProvider.getIdentity();
    expect(user).not.toBeNull();
    expect(user?.user_id).toBe("minimal-123");
    expect(user?.username).toBe("user"); // fallback
    expect(user?.display_name).toBe("User"); // fallback
    expect(user?.roles).toEqual(expect.arrayContaining(["RULE_CHECKER"]));
  });

  it("getIdentity handles profile with nickname", async () => {
    const mockProfile: Record<string, unknown> = {
      sub: "auth0|456",
      nickname: "testnick",
    };

    vi.spyOn(auth0, "getUserProfile").mockResolvedValue(mockProfile as any);
    vi.spyOn(auth0, "getAppRoles").mockResolvedValue(["RULE_MAKER"] as any);

    const user = await authProvider.getIdentity();
    expect(user?.username).toBe("testnick");
    expect(user?.display_name).toBe("testnick");
  });

  it("getPermissions returns roles from Auth0", async () => {
    vi.spyOn(auth0, "getAppRoles").mockResolvedValue(["RULE_CHECKER"] as any);

    const role = await authProvider.getPermissions();
    expect(role).toEqual(expect.arrayContaining(["RULE_CHECKER"]));
  });

  it("getPermissions returns null when Auth0 has no roles", async () => {
    vi.spyOn(auth0, "getAppRoles").mockResolvedValue([] as any);

    const role = await authProvider.getPermissions();
    expect(role).toBeNull();
  });
});

describe("authProvider session integrity", () => {
  beforeEach(() => {
    vi.spyOn(auth0, "isAuth0Enabled").mockReturnValue(false as any);
  });

  it("rejects expired session", async () => {
    // Manually create an expired session
    const expiredSession = {
      token: "test-token",
      user: {
        user_id: "1",
        username: "test",
        display_name: "Test",
        roles: ["RULE_MAKER"] as const,
        email: "test@example.com",
      },
      expiresAt: Date.now() - 1000, // expired
      checksum: "abc",
    };
    sessionStorage.setItem("auth_session", JSON.stringify(expiredSession));

    expect(await authProvider.check()).toMatchObject({ authenticated: false });
    expect(sessionStorage.getItem("auth_session")).toBeNull();
  });

  it("rejects session with invalid checksum", async () => {
    const tamperedSession = {
      token: "test-token",
      user: {
        user_id: "1",
        username: "hacker",
        display_name: "Hacker",
        roles: ["RULE_MAKER"] as const,
        email: "hacker@example.com",
      },
      expiresAt: Date.now() + 1000000,
      checksum: "invalid",
    };
    sessionStorage.setItem("auth_session", JSON.stringify(tamperedSession));

    expect(await authProvider.check()).toMatchObject({ authenticated: false });
    expect(sessionStorage.getItem("auth_session")).toBeNull();
  });

  it("rejects malformed JSON session", async () => {
    sessionStorage.setItem("auth_session", "invalid-json{");

    expect(await authProvider.check()).toMatchObject({ authenticated: false });
    expect(sessionStorage.getItem("auth_session")).toBeNull();
  });

  it("accepts valid session", async () => {
    await authProvider.login({ username: "valid", roles: ["RULE_MAKER"] } as any);

    const check = await authProvider.check();
    expect(check.authenticated).toBe(true);
  });
});
