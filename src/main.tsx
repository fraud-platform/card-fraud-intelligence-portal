import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import { initSentry } from "./shared/utils/sentry";
import "./index.css";

// Initialize Sentry first (before any errors can occur)
initSentry();

// Compatibility: ensure Refine's Link does not leak DOM props like `replace`.
// This patches the runtime Link implementation so native anchors don't receive
// non-DOM boolean props (avoids React warnings during dev and tests).
import "./shared/compat/refineLinkCompat";

async function enableMocking(): Promise<void> {
  // Enable MSW in DEV mode (unless disabled) or always in E2E mode
  const disableMocks = import.meta.env.VITE_DISABLE_MOCKS === "true";
  const isDevMode = import.meta.env.DEV;
  const isE2EMode = import.meta.env.VITE_E2E_MODE === "true";

  console.warn("[main.tsx] Environment check:", {
    VITE_E2E_MODE: import.meta.env.VITE_E2E_MODE as string | undefined,
    VITE_DISABLE_MOCKS: import.meta.env.VITE_DISABLE_MOCKS as string | undefined,
    isE2EMode,
    isDevMode,
    disableMocks,
    willEnableMocks: isE2EMode || (isDevMode && !disableMocks),
  });

  // E2E mode always needs mocks, dev mode can be disabled
  if (isE2EMode || (isDevMode && !disableMocks)) {
    const { startMockServiceWorker } = await import("./mocks");
    await startMockServiceWorker();
  }
}

const rootElement = document.getElementById("root");

if (rootElement === null) {
  throw new Error("Failed to find the root element");
}

await enableMocking();

ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
