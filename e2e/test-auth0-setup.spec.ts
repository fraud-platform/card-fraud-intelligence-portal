/**
 * Quick test to verify Auth0 E2E setup
 *
 * Run this to verify your Auth0 configuration is correct:
 * pnpm exec playwright test e2e/test-auth0-setup.ts
 */

import { test, expect } from "@playwright/test";
import { getAuth0Config, getAuth0TokensViaPassword } from "./auth-helper";

const shouldRun = process.env.E2E_USE_REAL_AUTH0 === "true";
const testIf = shouldRun ? test : test.skip;

testIf("verify Auth0 credentials are configured", () => {
  const config = getAuth0Config();
  expect(config.domain).toBeTruthy();
  expect(config.clientId).toBeTruthy();
  expect(config.username).toBeTruthy();
  expect(config.password).toBeTruthy();
  console.log("✓ Auth0 credentials loaded");
  console.log("  Domain:", config.domain);
  console.log("  Client ID:", config.clientId);
  console.log("  Username:", config.username);
});

testIf("verify Auth0 password-realm grant works", async () => {
  const config = getAuth0Config();
  const tokens = await getAuth0TokensViaPassword(config);

  expect(tokens.access_token).toBeTruthy();
  expect(tokens.id_token).toBeTruthy();
  expect(tokens.token_type).toBe("Bearer");

  console.log("✓ Auth0 password-realm grant successful");
  console.log("  Token type:", tokens.token_type);
  console.log("  Expires in:", tokens.expires_in, "seconds");

  // Decode and log ID token contents
  const parts = tokens.id_token.split(".");
  const payload = JSON.parse(atob(parts[1]));
  console.log("  ID Token claims:", JSON.stringify(payload, null, 2));
});

testIf("check if user has roles in ID token", async () => {
  const config = getAuth0Config();
  const tokens = await getAuth0TokensViaPassword(config);

  // Decode ID token
  const parts = tokens.id_token.split(".");
  const payload = JSON.parse(atob(parts[1]));

  // Check for roles in different possible locations
  const roleLocations = [
    "https://fraud-governance-api/roles",
    "roles",
    "https://fraud-governance-api/claims",
    "namespace/roles",
  ];

  console.log("Checking for roles in ID token...");
  let foundRoles = false;

  for (const location of roleLocations) {
    if (payload[location]) {
      console.log(`  ✓ Found roles at "${location}":`, payload[location]);
      foundRoles = true;
    }
  }

  if (!foundRoles) {
    console.log("  ✗ No roles found in token!");
    console.log("  Full token payload:", JSON.stringify(payload, null, 2));
  }

  expect(foundRoles).toBeTruthy();
});
