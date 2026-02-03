import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Production-grade Playwright Configuration
 *
 * This configuration provides comprehensive E2E testing capabilities with:
 * - Multi-browser testing (Chromium, Firefox, WebKit)
 * - CI/CD optimizations
 * - Automatic retries and parallel execution
 * - Detailed reporting with screenshots and videos
 * - Trace collection for debugging
 *
 * Environment variables are loaded from Doppler (project: card-fraud-intelligence-portal, config: local)
 * Run: doppler run -p card-fraud-intelligence-portal -c local -- pnpm test:e2e
 *
 * @see https://playwright.dev/docs/test-configuration
 */

export default defineConfig({
  // Test directory
  testDir: "./e2e",

  // Maximum time one test can run
  timeout: 60 * 1000,

  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI, // Fail CI if test.only is committed
  retries: process.env.CI ? 2 : 0, // Retry on CI to handle flakiness

  // Parallel workers - use more workers in CI for parallel execution
  workers: process.env.CI ? 4 : 2,

  // Reporter configuration
  reporter: process.env.CI
    ? [
        ["html", { outputFolder: "playwright-report" }],
        ["list"],
        ["github", { repository: "github.com/anomalyco/card-fraud-intelligence-portal" }],
      ]
    : [["html", { outputFolder: "playwright-report" }], ["list"]],

  // Development - use only Chromium for faster feedback
  // Use PLAYWRIGHT_INCLUDE_ALL_BROWSERS=true or --all-browsers flag to run Firefox/WebKit
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Firefox and WebKit - run when PLAYWRIGHT_INCLUDE_ALL_BROWSERS=true, --all-browsers flag, or in CI
    ...(process.env.CI ||
    process.env.PLAYWRIGHT_INCLUDE_ALL_BROWSERS ||
    process.env.PLAYWRIGHT_ALL_BROWSERS
      ? [
          {
            name: "firefox",
            use: { ...devices["Desktop Firefox"] },
          },
          {
            name: "webkit",
            use: { ...devices["Desktop Safari"] },
          },
        ]
      : []),
  ],

  // Optimize for speed
  use: {
    // Base URL for navigation
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:5173",

    // Collect trace on first retry for debugging
    trace: "on-first-retry",

    // Screenshot on failure
    screenshot: "only-on-failure",

    // Disable video to speed up tests
    video: "off",

    // Browser context options
    viewport: { width: 1280, height: 720 },

    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,

    // Action timeout
    actionTimeout: 10 * 1000,

    // Navigation timeout
    navigationTimeout: 30 * 1000,

    // Skip install dependencies for speed
    bypassCSP: true,
  },

  // Web server configuration - automatically starts dev server before tests
  // Doppler is baked into pnpm dev via .doppler.yaml (project: card-fraud-intelligence-portal)
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:5173",
    reuseExistingServer: true, // Reuse existing server if available
    timeout: 120 * 1000, // 2 minutes to start the server
    stdout: "pipe",
    stderr: "pipe",
  },

  // Global setup for browser-specific initialization
  globalSetup: path.resolve(__dirname, "./e2e/global-setup.ts"),

  // Output folder for test artifacts
  outputDir: "test-results/",

  // Fail the build on CI if you accidentally left test.only in the source code
  ...(process.env.CI && { forbidOnly: true }),
});
