/**
 * Auth0 Client (SPA)
 *
 * This module wraps Auth0 SPA JS in a singleton to be used by:
 * - Refine authProvider
 * - Axios httpClient interceptor
 * - RBAC (RULE_MAKER / RULE_CHECKER) role extraction
 */

import {
  createAuth0Client,
  Auth0Client,
  Auth0ClientOptions,
  GetTokenSilentlyOptions,
  RedirectLoginOptions,
} from "@auth0/auth0-spa-js";

import type { SystemRole } from "../types/domain";

type Auth0AppState = {
  returnTo?: string;
};

const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN as string | undefined;
const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID as string | undefined;
const AUTH0_AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE as string | undefined;
const FORCE_DEV_AUTH = import.meta.env.VITE_FORCE_DEV_AUTH === "true";
const AUTH0_ROLE_CLAIM =
  (import.meta.env.VITE_AUTH0_ROLE_CLAIM as string | undefined) ??
  "https://fraud-governance-api/roles";

// Debug logging for Auth0 (only in development with explicit flag enabled)
const DEBUG_AUTH0 = import.meta.env.DEV && import.meta.env.VITE_DEBUG_AUTH0 === "true";

function debugLog(...args: unknown[]): void {
  if (DEBUG_AUTH0) {
    console.warn("[Auth0]", ...args);
  }
}

export let __test_forceAuth0Enabled: boolean | undefined;

export function isAuth0Enabled(): boolean {
  if (typeof __test_forceAuth0Enabled !== "undefined") {
    return __test_forceAuth0Enabled;
  }
  // Disable Auth0 in E2E mode to use dev mode sessionStorage auth
  const isE2EMode = import.meta.env.VITE_E2E_MODE === "true";
  debugLog("VITE_E2E_MODE:", import.meta.env.VITE_E2E_MODE);
  debugLog("isE2EMode:", isE2EMode);
  debugLog("VITE_FORCE_DEV_AUTH:", import.meta.env.VITE_FORCE_DEV_AUTH);
  debugLog("forceDevAuth:", FORCE_DEV_AUTH);
  debugLog("AUTH0_DOMAIN:", AUTH0_DOMAIN);
  debugLog("AUTH0_CLIENT_ID:", AUTH0_CLIENT_ID);
  if (FORCE_DEV_AUTH) {
    debugLog("Auth0 disabled due to VITE_FORCE_DEV_AUTH");
    return false;
  }
  if (isE2EMode) {
    debugLog("Auth0 disabled due to E2E mode");
    return false;
  }
  const result =
    AUTH0_DOMAIN != null &&
    AUTH0_DOMAIN !== "" &&
    AUTH0_CLIENT_ID != null &&
    AUTH0_CLIENT_ID !== "";
  debugLog("Auth0 enabled (normal):", result);
  return result;
}

let clientPromise: Promise<Auth0Client> | null = null;
let redirectHandled = false;

function getRedirectUri(): string {
  const env = import.meta.env.VITE_AUTH0_REDIRECT_URI as string | undefined;
  // Default to a dedicated callback route so OAuth redirects are handled consistently.
  // (Must be added to Auth0 Allowed Callback URLs.)
  return env ?? `${globalThis.location.origin}/callback`;
}

function buildClientOptions(): Auth0ClientOptions {
  // Use localstorage cache on localhost for easier debugging
  // Use memory cache in production for better security
  const hostname = globalThis.location?.hostname;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";

  const options: Auth0ClientOptions = {
    domain: AUTH0_DOMAIN ?? "",
    clientId: AUTH0_CLIENT_ID ?? "",
    cacheLocation: isLocalhost ? "localstorage" : "memory",
    useRefreshTokens: true,
    authorizationParams: {
      redirect_uri: getRedirectUri(),
    },
  };

  if (AUTH0_AUDIENCE != null && AUTH0_AUDIENCE !== "") {
    options.authorizationParams = {
      ...options.authorizationParams,
      audience: AUTH0_AUDIENCE,
    };
  }

  return options;
}

function urlHasAuth0CallbackParams(): boolean {
  const search = globalThis.location.search;
  return search.includes("code=") && search.includes("state=");
}

async function handleRedirectIfPresent(client: Auth0Client): Promise<void> {
  if (redirectHandled) {
    return;
  }

  if (!urlHasAuth0CallbackParams()) {
    redirectHandled = true;
    return;
  }

  debugLog("Processing callback with code/state params...");

  // Process the callback - this exchanges code for tokens
  await client.handleRedirectCallback<Auth0AppState>();

  debugLog("Callback processed successfully");

  // Clean up query params (code/state)
  globalThis.history.replaceState({}, globalThis.document.title, globalThis.location.pathname);

  // Mark as handled - let Callback page handle navigation
  redirectHandled = true;
}

export async function getAuth0Client(): Promise<Auth0Client> {
  if (!isAuth0Enabled()) {
    throw new Error("Auth0 is not configured (missing VITE_AUTH0_DOMAIN / VITE_AUTH0_CLIENT_ID)");
  }

  const promise = clientPromise ?? (clientPromise = createAuth0Client(buildClientOptions()));
  const client = await promise;
  await handleRedirectIfPresent(client);
  return client;
}

export async function loginWithRedirect(returnTo?: string): Promise<void> {
  debugLog("loginWithRedirect called, returnTo:", returnTo);

  const client = await getAuth0Client();
  const redirectUri = getRedirectUri();

  debugLog("Redirect URI:", redirectUri);
  debugLog("Auth0 Domain:", AUTH0_DOMAIN ?? "(not set)");
  debugLog("Auth0 Client ID:", AUTH0_CLIENT_ID ?? "(not set)");

  const options: RedirectLoginOptions<Auth0AppState> = {
    appState: {
      returnTo: returnTo ?? globalThis.location.pathname,
    },
    authorizationParams: {
      redirect_uri: redirectUri,
    },
  };

  if (AUTH0_AUDIENCE != null && AUTH0_AUDIENCE !== "") {
    options.authorizationParams = {
      ...options.authorizationParams,
      audience: AUTH0_AUDIENCE,
    };
  }

  debugLog("Calling loginWithRedirect with options:", JSON.stringify(options, null, 2));
  await client.loginWithRedirect(options);
  debugLog("This should not appear - page should have redirected");
}

export async function logoutToHome(): Promise<void> {
  const client = await getAuth0Client();

  await client.logout({
    logoutParams: {
      returnTo: globalThis.location.origin,
    },
  });
}

export async function isAuthenticated(): Promise<boolean> {
  const client = await getAuth0Client();
  return client.isAuthenticated();
}

export async function getAccessToken(): Promise<string | null> {
  const client = await getAuth0Client();

  const opts: GetTokenSilentlyOptions = {};

  // Prefer import.meta.env value; in test environments attempt to fall back to process.env safely
  const envProcess = (globalThis as unknown as { process?: { env?: Record<string, string> } })
    .process;
  const envAudience = envProcess?.env?.VITE_AUTH0_AUDIENCE;
  const resolvedAudience = AUTH0_AUDIENCE ?? envAudience ?? "https://fraud-governance-api";

  if (typeof resolvedAudience === "string" && resolvedAudience !== "") {
    opts.authorizationParams = { audience: resolvedAudience };
  }

  try {
    return await client.getTokenSilently(opts);
  } catch {
    return null;
  }
}

/**
 * Decode a JWT payload (no verification) and return the JSON object.
 * Safe for client-side inspection only.
 */
export function decodeJwtPayload(token: string | null): Record<string, unknown> | null {
  if (token == null || token === "") return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1] ?? "";
    // base64url -> base64
    const base64 = payload.split("-").join("+").split("_").join("/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          const cp = c.codePointAt(0) ?? 0;
          const hex = cp.toString(16).padStart(2, "0");
          return `%${hex}`;
        })
        .join("")
    );
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function getAccessTokenClaims(): Promise<Record<string, unknown> | null> {
  const token = await getAccessToken();
  return decodeJwtPayload(token);
}

/**
 * Extract scopes/permissions from the access token claims.
 * - `scope` claim is a space-separated string (OAuth2 scopes)
 * - `permissions` or `scp` may be present as array
 */
export async function getAccessTokenScopes(): Promise<string[]> {
  const claims = await getAccessTokenClaims();
  if (claims == null) {
    return [];
  }

  const scopesRaw = claims["scope"] ?? claims["scp"] ?? claims["permissions"];

  if (scopesRaw == null) {
    return [];
  }

  if (typeof scopesRaw === "string") {
    return scopesRaw.split(" ").filter((s) => s.length > 0);
  }

  if (Array.isArray(scopesRaw)) {
    return scopesRaw.filter((s): s is string => typeof s === "string");
  }

  return [];
}

export async function getIdTokenClaims(): Promise<Record<string, unknown> | null> {
  const client = await getAuth0Client();
  const claims = await client.getIdTokenClaims();
  return (claims as unknown as Record<string, unknown>) ?? null;
}

export async function getUserProfile(): Promise<Record<string, unknown> | null> {
  const client = await getAuth0Client();
  const user = await client.getUser();
  return (user as unknown as Record<string, unknown>) ?? null;
}

export async function getRoles(): Promise<string[]> {
  const claims = await getIdTokenClaims();
  if (claims == null) {
    return [];
  }

  const raw =
    claims[AUTH0_ROLE_CLAIM] ?? claims["roles"] ?? claims["https://fraud-governance-api/roles"];

  if (Array.isArray(raw)) {
    return raw.filter((v): v is string => typeof v === "string");
  }

  if (typeof raw === "string") {
    return [raw];
  }

  return [];
}

export async function getAppRoles(): Promise<SystemRole[]> {
  const roles = await getRoles();
  const normalized = new Set(roles.map((r) => r.toUpperCase()));

  const allowed: SystemRole[] = [
    "PLATFORM_ADMIN",
    "RULE_MAKER",
    "RULE_CHECKER",
    "RULE_VIEWER",
    "FRAUD_ANALYST",
    "FRAUD_SUPERVISOR",
  ];

  return Array.from(normalized).filter((r): r is SystemRole => allowed.includes(r as SystemRole));
}

// Test helpers (only used by unit tests)
export function __test_setClientForTest(client: Auth0Client | null): void {
  clientPromise = client != null ? Promise.resolve(client) : null;
  redirectHandled = false;
}

export function __test_resetForceEnabled(): void {
  __test_forceAuth0Enabled = undefined;
}

export function __test_setForceEnabled(flag?: boolean): void {
  __test_forceAuth0Enabled = flag;
}
