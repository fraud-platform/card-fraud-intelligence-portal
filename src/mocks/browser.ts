/**
 * MSW Browser Setup
 *
 * Configures Mock Service Worker for browser environment
 */

import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

interface CustomProcessEnv {
  [key: string]: string | undefined;
}

interface CustomProcess {
  env?: CustomProcessEnv;
}

interface GlobalThisWithProcess {
  process?: CustomProcess;
}

/**
 * Configure and export the MSW worker for browser environments
 */
export const worker = setupWorker(...handlers);

/**
 * Start the MSW worker in development mode
 */
export async function startMockServiceWorker(): Promise<void> {
  // Start MSW in DEV mode or E2E mode
  // In tests import.meta.env may not reflect process.env, so support a process.env fallback
  const globalThisWithProcess = globalThis as GlobalThisWithProcess;
  const processEnv =
    typeof process === "undefined"
      ? (globalThisWithProcess.process?.env ?? {})
      : (process.env ?? {});
  const metaEnvRecord =
    "env" in (import.meta as unknown as Record<string, unknown>)
      ? (import.meta as unknown as Record<string, Record<string, unknown>>).env
      : processEnv;
  // Treat NODE_ENV=test as non-dev even if import.meta.env.DEV is truthy (keeps tests deterministic)
  const nodeEnv = (processEnv as CustomProcessEnv).NODE_ENV ?? "development";
  const metaDev = metaEnvRecord?.DEV;
  const metaE2E = metaEnvRecord?.VITE_E2E_MODE;
  const isTestEnv = nodeEnv === "test";
  const isDevMode =
    nodeEnv === "development" || ((metaDev === true || metaDev === "true") && !isTestEnv);
  const processE2E = (processEnv as CustomProcessEnv).VITE_E2E_MODE;
  const e2eMode = processE2E ?? (isTestEnv ? undefined : metaE2E);
  const isE2EMode = e2eMode === "true" || e2eMode === true;

  if (isDevMode || isE2EMode) {
    console.log("[MSW] Starting with", handlers.length, "handlers");
    console.log("[MSW] E2E mode:", isE2EMode);

    const userAgent = typeof navigator === "undefined" ? "unknown" : navigator.userAgent;
    const isFirefox = userAgent.toLowerCase().includes("firefox");

    if (isFirefox) {
      console.log("[MSW] Firefox detected - applying extended Service Worker activation wait");
    }

    await worker.start({
      serviceWorker: {
        url: "/mockServiceWorker.js",
      },
      onUnhandledRequest: "bypass",
    });

    // Extra wait for Firefox to ensure Service Worker is fully activated
    // and intercepting all network requests
    if (isFirefox) {
      console.log("[MSW] Firefox - waiting for Service Worker to claim clients...");
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.warn("[MSW] Mock Service Worker started");
    console.log("[MSW] Handlers:", handlers.map((h) => h.info?.header || "unknown").join(", "));
  }
}
