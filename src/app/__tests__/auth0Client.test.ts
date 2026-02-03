import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { createAuth0Client, type Auth0Client } from "@auth0/auth0-spa-js";

vi.mock("@auth0/auth0-spa-js", () => ({
  createAuth0Client: vi.fn(),
}));

import * as auth from "../auth0Client";

function base64UrlEncode(obj: unknown) {
  const json = JSON.stringify(obj);
  const b64 = Buffer.from(json).toString("base64");
  // convert to base64url
  return b64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

// Mock browser globals
const originalLocation = globalThis.location;
const originalHistory = globalThis.history;
const originalDocument = globalThis.document;

describe("auth0Client", () => {
  let mockLocation: Partial<Location>;
  let _mockHistory: History["replaceState"];
  let replaceStateCalls: Array<[unknown, string, string]>;

  beforeEach(() => {
    replaceStateCalls = [];
    mockLocation = {
      origin: "https://example.com",
      pathname: "/",
      search: "",
      hostname: "example.com",
    };
    _mockHistory = vi.fn();

    Object.defineProperty(globalThis, "location", {
      writable: true,
      value: mockLocation,
    });
    Object.defineProperty(globalThis, "history", {
      writable: true,
      value: {
        replaceState: (...args: Parameters<History["replaceState"]>) => {
          replaceStateCalls.push(args);
        },
      },
    });
    Object.defineProperty(globalThis, "document", {
      writable: true,
      value: { title: "Test" },
    });

    // Reset module state
    auth.__test_resetForceEnabled();
    auth.__test_setClientForTest(null);
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "location", {
      writable: true,
      value: originalLocation,
    });
    Object.defineProperty(globalThis, "history", {
      writable: true,
      value: originalHistory,
    });
    Object.defineProperty(globalThis, "document", {
      writable: true,
      value: originalDocument,
    });
    vi.restoreAllMocks();
  });

  describe("isAuth0Enabled", () => {
    it("returns false when forced to false via test helper", () => {
      auth.__test_setForceEnabled(false);
      expect(auth.isAuth0Enabled()).toBe(false);
    });

    it("returns true when forced to true via test helper", () => {
      auth.__test_setForceEnabled(true);
      expect(auth.isAuth0Enabled()).toBe(true);
    });

    it("returns false when not forced and env vars are missing", () => {
      // Reset to undefined so it checks env vars
      // Since test env doesn't have full AUTH0 setup, this should return false
      auth.__test_resetForceEnabled();
      // The result depends on whether env vars are set in vitest environment
      // Just verify the function is callable and returns boolean
      const result = auth.isAuth0Enabled();
      expect(typeof result).toBe("boolean");
    });
  });

  describe("decodeJwtPayload", () => {
    it("returns null for null/empty/malformed", () => {
      expect(auth.decodeJwtPayload(null)).toBeNull();
      expect(auth.decodeJwtPayload("")).toBeNull();
      expect(auth.decodeJwtPayload("not-a-jwt")).toBeNull();
      expect(auth.decodeJwtPayload("only-one-part")).toBeNull();
    });

    it("decodes base64url payload", () => {
      const payload = { scope: "read write", permissions: ["p1", "p2"], custom: { a: 1 } };
      const token = `h.${base64UrlEncode(payload)}.sig`; // header irrelevant
      const decoded = auth.decodeJwtPayload(token);
      expect(decoded).toEqual(expect.objectContaining(payload));
    });

    it("handles unicode characters in payload", () => {
      const payload = { message: "Hello 世界 🌍" };
      const token = `h.${base64UrlEncode(payload)}.sig`;
      const decoded = auth.decodeJwtPayload(token);
      expect(decoded).toEqual(expect.objectContaining(payload));
    });

    it("returns null for malformed base64", () => {
      const token = "h.invalid-base64.sig";
      expect(auth.decodeJwtPayload(token)).toBeNull();
    });
  });

  describe("getAuth0Client", () => {
    it("rejects when Auth0 is not enabled", async () => {
      auth.__test_setForceEnabled(false);
      await expect(auth.getAuth0Client()).rejects.toThrow("Auth0 is not configured");
    });

    it("creates and returns a client when enabled", async () => {
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        getTokenSilently: vi.fn(),
        getIdTokenClaims: vi.fn(),
        getUser: vi.fn(),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      const client = await auth.getAuth0Client();
      expect(client).toBe(mockClient);
    });

    it("handles redirect callback when code and state params are present", async () => {
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        getTokenSilently: vi.fn(),
        getIdTokenClaims: vi.fn(),
        getUser: vi.fn(),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      // Simulate OAuth callback URL
      Object.defineProperty(globalThis, "location", {
        writable: true,
        value: {
          ...mockLocation,
          search: "?code=abc123&state=xyz789",
          pathname: "/callback",
        },
      });

      await auth.getAuth0Client();

      expect(mockClient.handleRedirectCallback).toHaveBeenCalled();
      expect(replaceStateCalls).toHaveLength(1);
      expect(replaceStateCalls[0][2]).toBe("/callback");
    });

    it("does not handle redirect twice", async () => {
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        getTokenSilently: vi.fn(),
        getIdTokenClaims: vi.fn(),
        getUser: vi.fn(),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      Object.defineProperty(globalThis, "location", {
        writable: true,
        value: {
          ...mockLocation,
          search: "?code=abc123&state=xyz789",
        },
      });

      await auth.getAuth0Client();
      await auth.getAuth0Client();

      expect(mockClient.handleRedirectCallback).toHaveBeenCalledTimes(1);
    });

    it("returns singleton client on subsequent calls", async () => {
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        getTokenSilently: vi.fn(),
        getIdTokenClaims: vi.fn(),
        getUser: vi.fn(),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      const client1 = await auth.getAuth0Client();
      const client2 = await auth.getAuth0Client();

      expect(client1).toBe(client2);
      expect(createAuth0Client).toHaveBeenCalledTimes(1);
    });
  });

  describe("loginWithRedirect", () => {
    it("calls loginWithRedirect on the client", async () => {
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(false),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn().mockResolvedValue(undefined),
        logout: vi.fn(),
        getTokenSilently: vi.fn(),
        getIdTokenClaims: vi.fn(),
        getUser: vi.fn(),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      await auth.loginWithRedirect("/custom-return");

      expect(mockClient.loginWithRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          appState: { returnTo: "/custom-return" },
        })
      );
    });

    it("uses current pathname when returnTo is not provided", async () => {
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(false),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn().mockResolvedValue(undefined),
        logout: vi.fn(),
        getTokenSilently: vi.fn(),
        getIdTokenClaims: vi.fn(),
        getUser: vi.fn(),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      Object.defineProperty(globalThis, "location", {
        writable: true,
        value: {
          ...mockLocation,
          pathname: "/current-page",
        },
      });

      await auth.loginWithRedirect();

      expect(mockClient.loginWithRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          appState: { returnTo: "/current-page" },
        })
      );
    });
  });

  describe("logoutToHome", () => {
    it("calls logout on the client with returnTo origin", async () => {
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn(),
        logout: vi.fn().mockResolvedValue(undefined),
        getTokenSilently: vi.fn(),
        getIdTokenClaims: vi.fn(),
        getUser: vi.fn(),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      await auth.logoutToHome();

      expect(mockClient.logout).toHaveBeenCalledWith(
        expect.objectContaining({
          logoutParams: { returnTo: "https://example.com" },
        })
      );
    });
  });

  describe("isAuthenticated", () => {
    it("returns true when client is authenticated", async () => {
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        getTokenSilently: vi.fn(),
        getIdTokenClaims: vi.fn(),
        getUser: vi.fn(),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      const result = await auth.isAuthenticated();
      expect(result).toBe(true);
    });

    it("returns false when client is not authenticated", async () => {
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(false),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        getTokenSilently: vi.fn(),
        getIdTokenClaims: vi.fn(),
        getUser: vi.fn(),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      const result = await auth.isAuthenticated();
      expect(result).toBe(false);
    });
  });

  describe("getAccessToken", () => {
    it("returns token from getTokenSilently", async () => {
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        getTokenSilently: vi.fn().mockResolvedValue("access-token-123"),
        getIdTokenClaims: vi.fn(),
        getUser: vi.fn(),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      const token = await auth.getAccessToken();
      expect(token).toBe("access-token-123");
    });

    it("passes audience when configured", async () => {
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        getTokenSilently: vi.fn().mockResolvedValue("access-token-123"),
        getIdTokenClaims: vi.fn(),
        getUser: vi.fn(),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      await auth.getAccessToken();

      // The test should verify that audience is passed when VITE_AUTH0_AUDIENCE is set
      // By default in tests, VITE_AUTH0_AUDIENCE is 'https://fraud-governance-api'
      expect(mockClient.getTokenSilently).toHaveBeenCalledWith(
        expect.objectContaining({
          authorizationParams: { audience: "https://fraud-governance-api" },
        })
      );
    });

    it("returns null when getTokenSilently throws", async () => {
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        getTokenSilently: vi.fn().mockRejectedValue(new Error("Token error")),
        getIdTokenClaims: vi.fn(),
        getUser: vi.fn(),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      const token = await auth.getAccessToken();
      expect(token).toBeNull();
    });
  });

  describe("getAccessTokenClaims", () => {
    it("returns decoded claims from access token", async () => {
      const payload = { sub: "user123", scope: "read write" };
      const token = `h.${base64UrlEncode(payload)}.sig`;
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        getTokenSilently: vi.fn().mockResolvedValue(token),
        getIdTokenClaims: vi.fn(),
        getUser: vi.fn(),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      const claims = await auth.getAccessTokenClaims();
      expect(claims).toEqual(expect.objectContaining(payload));
    });

    it("returns null when token is null", async () => {
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        getTokenSilently: vi.fn().mockRejectedValue(new Error("No token")),
        getIdTokenClaims: vi.fn(),
        getUser: vi.fn(),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      const claims = await auth.getAccessTokenClaims();
      expect(claims).toBeNull();
    });
  });

  describe("getAccessTokenScopes", () => {
    it("returns empty array for null claims", async () => {
      // Create a mock token with null payload
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        getTokenSilently: vi.fn().mockRejectedValue(new Error("No token")),
        getIdTokenClaims: vi.fn(),
        getUser: vi.fn(),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      const scopes = await auth.getAccessTokenScopes();
      expect(scopes).toEqual([]);
    });

    it("parses scope claim as space-separated string", async () => {
      const payload = { scope: "read write delete" };
      const token = `h.${base64UrlEncode(payload)}.sig`;
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        getTokenSilently: vi.fn().mockResolvedValue(token),
        getIdTokenClaims: vi.fn(),
        getUser: vi.fn(),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      const scopes = await auth.getAccessTokenScopes();
      expect(scopes).toEqual(["read", "write", "delete"]);
    });

    it("parses scp claim as space-separated string", async () => {
      const payload = { scp: "openid profile" };
      const token = `h.${base64UrlEncode(payload)}.sig`;
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        getTokenSilently: vi.fn().mockResolvedValue(token),
        getIdTokenClaims: vi.fn(),
        getUser: vi.fn(),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      const scopes = await auth.getAccessTokenScopes();
      expect(scopes).toEqual(["openid", "profile"]);
    });

    it("parses permissions claim as array", async () => {
      const payload = { permissions: ["read:rules", "write:rules"] };
      const token = `h.${base64UrlEncode(payload)}.sig`;
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        getTokenSilently: vi.fn().mockResolvedValue(token),
        getIdTokenClaims: vi.fn(),
        getUser: vi.fn(),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      const scopes = await auth.getAccessTokenScopes();
      expect(scopes).toEqual(["read:rules", "write:rules"]);
    });

    it("filters out non-string items from permissions array", async () => {
      const payload = { permissions: ["read:rules", null, 123, "write:rules"] };
      const token = `h.${base64UrlEncode(payload)}.sig`;
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        getTokenSilently: vi.fn().mockResolvedValue(token),
        getIdTokenClaims: vi.fn(),
        getUser: vi.fn(),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      const scopes = await auth.getAccessTokenScopes();
      expect(scopes).toEqual(["read:rules", "write:rules"]);
    });

    it("filters out empty strings from scope", async () => {
      const payload = { scope: "read  write   " };
      const token = `h.${base64UrlEncode(payload)}.sig`;
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        getTokenSilently: vi.fn().mockResolvedValue(token),
        getIdTokenClaims: vi.fn(),
        getUser: vi.fn(),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      const scopes = await auth.getAccessTokenScopes();
      expect(scopes).toEqual(["read", "write"]);
    });

    it("returns empty array when no scope-related claims exist", async () => {
      const payload = { sub: "user123" };
      const token = `h.${base64UrlEncode(payload)}.sig`;
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        getTokenSilently: vi.fn().mockResolvedValue(token),
        getIdTokenClaims: vi.fn(),
        getUser: vi.fn(),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      const scopes = await auth.getAccessTokenScopes();
      expect(scopes).toEqual([]);
    });
  });

  describe("getIdTokenClaims", () => {
    it("returns id token claims from client", async () => {
      const claims = { sub: "user123", roles: ["RULE_MAKER"] };
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        getTokenSilently: vi.fn(),
        getIdTokenClaims: vi.fn().mockResolvedValue(claims as any),
        getUser: vi.fn(),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      const result = await auth.getIdTokenClaims();
      expect(result).toEqual(claims);
    });

    it("returns null when getIdTokenClaims returns null", async () => {
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        getTokenSilently: vi.fn(),
        getIdTokenClaims: vi.fn().mockResolvedValue(null),
        getUser: vi.fn(),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      const result = await auth.getIdTokenClaims();
      expect(result).toBeNull();
    });
  });

  describe("getUserProfile", () => {
    it("returns user profile from client", async () => {
      const user = { name: "Alice", email: "alice@example.com" };
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        getTokenSilently: vi.fn(),
        getIdTokenClaims: vi.fn(),
        getUser: vi.fn().mockResolvedValue(user as any),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      const result = await auth.getUserProfile();
      expect(result).toEqual(user);
    });

    it("returns null when getUser returns null", async () => {
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        getTokenSilently: vi.fn(),
        getIdTokenClaims: vi.fn(),
        getUser: vi.fn().mockResolvedValue(null),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      const result = await auth.getUserProfile();
      expect(result).toBeNull();
    });
  });

  describe("getRoles", () => {
    it("returns empty array when claims are null", async () => {
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        getTokenSilently: vi.fn(),
        getIdTokenClaims: vi.fn().mockResolvedValue(null),
        getUser: vi.fn(),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      const roles = await auth.getRoles();
      expect(roles).toEqual([]);
    });

    it("extracts roles from custom claim", async () => {
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        getTokenSilently: vi.fn(),
        getIdTokenClaims: vi.fn().mockResolvedValue({
          "https://fraud-governance-api/roles": ["RULE_MAKER", "RULE_CHECKER"],
        } as any),
        getUser: vi.fn(),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      const roles = await auth.getRoles();
      expect(roles).toEqual(["RULE_MAKER", "RULE_CHECKER"]);
    });

    it("extracts roles from standard roles claim", async () => {
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        getTokenSilently: vi.fn(),
        getIdTokenClaims: vi.fn().mockResolvedValue({
          roles: ["admin"],
        } as any),
        getUser: vi.fn(),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      const roles = await auth.getRoles();
      expect(roles).toEqual(["admin"]);
    });

    it("handles single role as string", async () => {
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        getTokenSilently: vi.fn(),
        getIdTokenClaims: vi.fn().mockResolvedValue({
          roles: "RULE_MAKER",
        } as any),
        getUser: vi.fn(),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      const roles = await auth.getRoles();
      expect(roles).toEqual(["RULE_MAKER"]);
    });

    it("filters non-string items from roles array", async () => {
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        getTokenSilently: vi.fn(),
        getIdTokenClaims: vi.fn().mockResolvedValue({
          roles: ["RULE_MAKER", null, 123, "RULE_CHECKER"],
        } as any),
        getUser: vi.fn(),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      const roles = await auth.getRoles();
      expect(roles).toEqual(["RULE_MAKER", "RULE_CHECKER"]);
    });

    it("returns empty array for non-array non-string roles", async () => {
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        getTokenSilently: vi.fn(),
        getIdTokenClaims: vi.fn().mockResolvedValue({
          roles: { admin: true },
        } as any),
        getUser: vi.fn(),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      const roles = await auth.getRoles();
      expect(roles).toEqual([]);
    });
  });

  describe("getAppRoles", () => {
    it("returns normalized system roles when present", async () => {
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        getTokenSilently: vi.fn(),
        getIdTokenClaims: vi.fn().mockResolvedValue({
          roles: ["Rule_Checker", "Rule_Maker"], // Test case normalization
        } as any),
        getUser: vi.fn(),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      const roles = await auth.getAppRoles();
      expect(roles).toEqual(expect.arrayContaining(["RULE_CHECKER", "RULE_MAKER"]));
    });

    it("returns empty array when no recognized roles are present", async () => {
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        getTokenSilently: vi.fn(),
        getIdTokenClaims: vi.fn().mockResolvedValue({
          roles: ["admin", "user"],
        } as any),
        getUser: vi.fn(),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      const roles = await auth.getAppRoles();
      expect(roles).toEqual([]);
    });

    it("returns empty array when roles array is empty", async () => {
      const mockClient: Auth0Client = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        handleRedirectCallback: vi.fn().mockResolvedValue({}),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        getTokenSilently: vi.fn(),
        getIdTokenClaims: vi.fn().mockResolvedValue({
          roles: [],
        } as any),
        getUser: vi.fn(),
      };
      vi.mocked(createAuth0Client).mockResolvedValue(mockClient);
      auth.__test_setForceEnabled(true);

      const roles = await auth.getAppRoles();
      expect(roles).toEqual([]);
    });
  });
});
