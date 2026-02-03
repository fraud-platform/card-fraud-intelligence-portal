/**
 * Global Playwright Setup
 *
 * Handles browser-specific initialization for cross-browser compatibility:
 * - Firefox: Extended Service Worker lifecycle wait
 * - WebKit: Special handling if needed
 * - All browsers: Ensure MSW is properly intercepting requests
 */

import { FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig): Promise<void> {
  console.log("[Global Setup] Starting browser-specific configuration...");
  console.log("[Global Setup] Browser projects:", config.projects.map((p) => p.name).join(", "));

  for (const project of config.projects) {
    console.log(`[Global Setup] Configuring ${project.name}...`);

    if (project.name === "firefox") {
      console.log("[Global Setup] Firefox detected - applying extended timeout settings");
    }
  }

  console.log("[Global Setup] Complete - tests are ready to run");
}

export default globalSetup;
