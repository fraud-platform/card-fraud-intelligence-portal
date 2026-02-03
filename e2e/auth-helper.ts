/**
 * Auth0 Authentication Helper for E2E Tests
 *
 * Provides automated authentication using Resource Owner Password flow.
 * This enables fully automated E2E tests without manual intervention.
 *
 * SETUP REQUIRED:
 * 1. Enable "Password Grant" in Auth0 API settings
 * 2. Create a test user in Auth0 (disable MFA)
 * 3. Add credentials to Doppler (project: card-fraud-intelligence-portal, config: local)
 * 4. Add VITE_AUTH0_CLIENT_ID to Auth0 allowed origins (for localhost)
 */

import { Page, BrowserContext } from "@playwright/test";

const E2E_DEBUG_AUTH = process.env.E2E_DEBUG_AUTH === "true";

const authDebugLog = (...args: unknown[]): void => {
  if (E2E_DEBUG_AUTH) console.log(...args);
};

const authDebugWarn = (...args: unknown[]): void => {
  if (E2E_DEBUG_AUTH) console.warn(...args);
};

export interface Auth0Tokens {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

export interface Auth0TestConfig {
  domain: string;
  clientId: string;
  audience: string;
  username: string;
  password: string;
}

/**
 * Get Auth0 configuration from environment variables
 *
 * Note: Playwright runs in Node.js context, so we use process.env
 * (not import.meta.env which only works in Vite/browser context)
 */
export function getAuth0Config(): Auth0TestConfig {
  const domain = process.env.VITE_AUTH0_DOMAIN || "";
  const clientId = process.env.VITE_AUTH0_CLIENT_ID || "";
  const audience = process.env.VITE_AUTH0_AUDIENCE || "https://fraud-governance-api";
  const username = process.env.E2E_TEST_USERNAME || "e2e-playwright@fraud-governance.test";
  const password = process.env.E2E_TEST_PASSWORD || "";

  return {
    domain,
    clientId,
    audience,
    username,
    password,
  };
}

/**
 * Check if Auth0 is configured for real authentication
 *
 * Requires both:
 * 1. E2E_USE_REAL_AUTH0=true environment variable
 * 2. Auth0 credentials (domain, clientId, password)
 */
export function isAuth0Configured(): boolean {
  // Check E2E_USE_REAL_AUTH0 flag first
  const useRealAuth0 = process.env.E2E_USE_REAL_AUTH0 === "true";

  if (!useRealAuth0) {
    return false; // Explicitly disabled
  }

  // Then check if credentials are available
  const config = getAuth0Config();
  return !!(config.domain && config.clientId && config.password);
}

/**
 * Obtain Auth0 tokens using Resource Owner Password flow
 *
 * This requires:
 * - Password Grant enabled in Auth0 API settings
 * - Test user with known credentials
 * - MFA disabled for test user
 */
export async function getAuth0TokensViaPassword(config: Auth0TestConfig): Promise<Auth0Tokens> {
  const url = `https://${config.domain}/oauth/token`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "http://auth0.com/oauth/grant-type/password-realm",
      client_id: config.clientId,
      username: config.username,
      password: config.password,
      realm: "Username-Password-Authentication",
      audience: config.audience,
      scope: "openid profile email",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      `Auth0 token request failed: ${response.status}\n${error}\n\n` +
        "Make sure:\n" +
        "1. Password Grant is enabled in Auth0\n" +
        "2. Test user credentials are correct\n" +
        "3. MFA is disabled for test user"
    );
  }

  const tokens = (await response.json()) as Auth0Tokens;
  return tokens;
}

/**
 * Inject Auth0 tokens into browser storage
 *
 * This works in two modes:
 * 1. Real Auth0: Injects actual Auth0 tokens from password-realm grant
 * 2. Dev Mode: Simulates authentication using dev mode sessionStorage
 */
export async function injectAuth0Tokens(
  page: Page,
  tokens: Auth0Tokens | null,
  role: "maker" | "checker" | "admin" = "maker"
): Promise<void> {
  // Attach verbose browser logs only when debugging auth/E2E issues.
  if (E2E_DEBUG_AUTH) {
    page.on("console", (msg) => console.log("[page.console]", msg.type(), msg.text()));
    page.on("pageerror", (err) => console.log("[page.error]", err.message));
  }

  const config = getAuth0Config();
  const useRealAuth0 = isAuth0Configured() && tokens && tokens.access_token;

  if (useRealAuth0) {
    // Real Auth0 mode: inject actual tokens
    await page.addInitScript(
      ({ auth0Tokens, roleClaim, debug }) => {
        // Store tokens in the format expected by Auth0 React SDK
        const auth0Data = {
          body: {
            client_id: auth0Tokens.client_id,
            access_token: auth0Tokens.access_token,
            id_token: auth0Tokens.id_token,
            scope: "openid profile email",
            expires_in: auth0Tokens.expires_in,
            token_type: auth0Tokens.token_type,
            decodedToken: {
              user: JSON.parse(atob(auth0Tokens.id_token.split(".")[1])),
            },
          },
          expiresAt: Math.floor(Date.now() / 1000) + auth0Tokens.expires_in,
        };

        // Store in the key format used by Auth0 React SDK
        // Use localStorage since auth0Client.ts uses localStorage on localhost
        const key = `@@auth0spajs@@::${auth0Tokens.client_id}::${auth0Tokens.audience}::openid profile email`;
        localStorage.setItem(key, JSON.stringify(auth0Data));

        // Also store a simplified version for easier access in tests
        localStorage.setItem(
          "auth0_tokens",
          JSON.stringify({
            accessToken: auth0Tokens.access_token,
            idToken: auth0Tokens.id_token,
            expiresAt: Math.floor(Date.now() / 1000) + auth0Tokens.expires_in,
          })
        );

        if (debug) {
          console.log("Real Auth0 tokens injected:", {
            audience: auth0Tokens.audience,
            expiresIn: auth0Tokens.expires_in,
            roleClaim,
          });
        }
      },
      {
        auth0Tokens: {
          ...tokens,
          client_id: config.clientId,
          audience: config.audience,
        },
        roleClaim: config.audience ? `${config.audience}/roles` : "roles",
        debug: E2E_DEBUG_AUTH,
      }
    );
  } else {
    // Dev mode: use sessionStorage auth (simpler, no Auth0 needed)
    await page.addInitScript(
      ({ userRole, username, debug }) => {
        // Map short role names used in tests to SystemRole values
        const roleMap: Record<string, string[]> = {
          maker: ["RULE_MAKER"],
          checker: ["RULE_CHECKER"],
          admin: ["PLATFORM_ADMIN"],
        };

        const roles = roleMap[userRole] ?? ["RULE_MAKER"];

        const user = {
          user_id: `user-${username}`,
          username: username,
          display_name: username.charAt(0).toUpperCase() + username.slice(1),
          roles,
          email: `${username}@example.com`,
        };

        const token = `mock-token-${user.user_id}`;
        const expiresAt = Date.now() + 8 * 60 * 60 * 1000; // 8 hours

        // Generate checksum - must match authProvider.ts exactly
        const dataString = JSON.stringify({ token, user, expiresAt });

        // Copy exact algorithm from authProvider.ts
        let hash = 0;
        for (let i = 0; i < dataString.length; i++) {
          const char = dataString.charCodeAt(i);
          hash = (hash << 5) - hash + char;
          hash = hash & hash; // Convert to 32-bit integer
        }
        const checksum = hash.toString(16);

        const session = {
          token,
          user,
          expiresAt,
          checksum,
        };

        // Store in sessionStorage (matches authProvider.ts dev mode)
        sessionStorage.setItem("auth_session", JSON.stringify(session));
        // Also store active role for quick switching in tests
        if (Array.isArray(roles) && roles.length > 0) {
          sessionStorage.setItem("active_role", roles[0]);
        }

        if (debug) {
          console.log("Dev mode session stored:", {
            username,
            roles,
            expiresAt: new Date(expiresAt).toISOString(),
            checksum,
          });
        }
      },
      {
        userRole: role,
        username: config.username.split("@")[0] || "e2e-playwright",
        debug: E2E_DEBUG_AUTH,
      }
    );
  }

  // Navigate to the app - init script will run before page loads
  await page.goto("/");

  // Wait for page to load with injected session
  await page.waitForLoadState("domcontentloaded");
  if (E2E_DEBUG_AUTH) {
    const ss = await page.evaluate(() => ({
      auth_session: sessionStorage.getItem("auth_session"),
      active_role: sessionStorage.getItem("active_role"),
      auth0_tokens: sessionStorage.getItem("auth0_tokens"),
    }));
    authDebugLog("[e2e-debug] sessionStorage after inject:", JSON.stringify(ss));

    const roleLabelText = await page.evaluate(() => {
      const el = document.querySelector(".role-label");
      return el ? el.textContent : null;
    });
    authDebugLog("[e2e-debug] roleLabelText:", roleLabelText);

    const headerSnippet = await page.evaluate(() => {
      const h = document.querySelector(".app-header");
      return h ? h.outerHTML.slice(0, 1000) : null;
    });
    authDebugLog("[e2e-debug] headerSnippet:", headerSnippet);

    const pageContent = await page.content();
    authDebugLog("[e2e-debug] page.content (first 2k chars):", pageContent.slice(0, 2000));
  }
  // Firefox has slower sessionStorage initialization - give it time to sync
  // This prevents race conditions where tests try to access auth before it's ready
  await page.waitForTimeout(200);

  // WebKit-specific wait for page initialization
  const browserName = await page.evaluate(() => navigator.userAgent);
  if (browserName.includes("WebKit")) {
    await page.waitForTimeout(300);
  }
}

/**
 * Authenticate a page using Auth0 Password flow or dev mode
 *
 * Automatically detects if Auth0 is configured and uses:
 * - Real Auth0 password-realm grant if configured
 * - Dev mode sessionStorage auth if not configured
 *
 * Usage:
 * ```ts
 * test('authenticated user can create rules', async ({ page }) => {
 *   await authenticateWithAuth0(page);
 *   // Now you're logged in!
 * });
 * ```
 */
export async function authenticateWithAuth0(
  page: Page,
  role: "maker" | "checker" | "admin" = "maker"
): Promise<void> {
  let tokens: Auth0Tokens | null = null;

  // Try to get real Auth0 tokens if configured
  if (isAuth0Configured()) {
    try {
      const config = getAuth0Config();
      tokens = await getAuth0TokensViaPassword(config);
      authDebugLog("Using real Auth0 authentication");
    } catch (error) {
      authDebugWarn("Auth0 authentication failed, falling back to dev mode:", error);
      tokens = null;
    }
  } else {
    authDebugLog("Using dev mode authentication (Auth0 not configured)");
  }

  await injectAuth0Tokens(page, tokens, role);

  // Verify authentication was successful by checking for the user role in the header
  // Prefer the visible role label element (friendly UI text) but fall back to the legacy system-role codes
  await page.waitForSelector(".role-label", { timeout: 10000 }).catch(async () => {
    await page.waitForSelector(
      "text=/RULE_MAKER|RULE_CHECKER|PLATFORM_ADMIN|FRAUD_ANALYST|FRAUD_SUPERVISOR|RULE_VIEWER/i",
      { timeout: 10000 }
    );
  });
}

/**
 * Create authenticated page fixture
 *
 * Extend Playwright test with authenticated page:
 * ```ts
 * import { test as authTest } from './auth-helper';
 *
 * authTest('authenticated test', async ({ authenticatedPage }) => {
 *   // Already logged in!
 * });
 * ```
 */
export async function createAuthenticatedPage(
  context: BrowserContext,
  role: "maker" | "checker" | "admin" = "maker"
): Promise<Page> {
  const page = await context.newPage();

  let tokens: Auth0Tokens | null = null;

  // Try to get real Auth0 tokens if configured
  if (isAuth0Configured()) {
    try {
      const config = getAuth0Config();
      tokens = await getAuth0TokensViaPassword(config);
    } catch (error) {
      authDebugWarn("Auth0 authentication failed, falling back to dev mode:", error);
      tokens = null;
    }
  }

  await injectAuth0Tokens(page, tokens, role);

  // Wait for the app to mount (app-root) — sometimes hydration is delayed in CI/local runs
  await page.waitForSelector(".app-root", { timeout: 15000 }).catch(() => {
    authDebugWarn("[e2e-debug] .app-root not found within 15s � continuing to role checks");
  });

  // Prefer the visible role label element (friendly UI text) but fall back to legacy system-role codes
  // Give extra time for UI to render
  await page.waitForSelector(".role-label", { timeout: 10000 }).catch(async () => {
    await page.waitForSelector(
      "text=/RULE_MAKER|RULE_CHECKER|PLATFORM_ADMIN|FRAUD_ANALYST|FRAUD_SUPERVISOR|RULE_VIEWER/i",
      { timeout: 10000 }
    );
  });

  // If role still not found, dump a short body snapshot to help debugging
  const maybeRole = await page.evaluate(
    () => document.querySelector(".role-label")?.textContent ?? null
  );
  if (!maybeRole) {
    const bodyHtml = await page.evaluate(() => document.body.innerHTML.slice(0, 2000));
    authDebugLog("[e2e-debug] body snapshot (first 2k):", bodyHtml);
  }

  // Firefox extra stabilization wait for sessionStorage and React hydration
  await page.waitForTimeout(300);

  // WebKit-specific wait - WebKit has different timing for page initialization
  const browserName = await page.evaluate(() => navigator.userAgent);
  if (browserName.includes("WebKit")) {
    await page.waitForTimeout(500);
  }

  return page;
}

/**
 * Alternative: UI-based login (slower, more realistic)
 *
 * Use this if you cannot enable Password Grant in Auth0.
 */
export async function loginViaUI(page: Page): Promise<void> {
  const config = getAuth0Config();

  await page.goto("/");
  await page.click("text=Login");

  // Wait for Auth0 Universal Login
  await page.waitForURL(new RegExp(config.domain));

  // Fill credentials
  await page.fill('input[name="username"]', config.username);
  await page.fill('input[name="password"]', config.password);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for redirect back to app
  await page.waitForURL("/");
  await page.waitForLoadState("networkidle");

  // Verify login
  await page.waitForSelector("text=Logout", { timeout: 15000 });
}

/**
 * Logout from the application
 */
export async function logout(page: Page): Promise<void> {
  await page.click("text=Logout");
  await page.waitForURL("/");
  await page.waitForLoadState("networkidle");
}

/**
 * Get current user roles from ID token
 */
export async function getUserRoles(page: Page): Promise<string[]> {
  const roles = await page.evaluate(() => {
    const tokenData = sessionStorage.getItem("auth0_tokens");
    if (!tokenData) return [];

    const { idToken } = JSON.parse(tokenData);
    const payload = JSON.parse(atob(idToken.split(".")[1]));

    const roleClaim =
      payload["https://fraud-governance-api/roles"] || payload["roles"] || payload["role"];

    return Array.isArray(roleClaim) ? roleClaim : typeof roleClaim === "string" ? [roleClaim] : [];
  });

  return roles;
}

/**
 * Check if current user has specific role
 */
export async function hasRole(page: Page, role: "maker" | "checker"): Promise<boolean> {
  const roles = await getUserRoles(page);
  return roles.some((r) => r.toLowerCase() === role);
}
