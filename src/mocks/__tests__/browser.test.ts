import { vi, beforeEach, afterEach, describe, it, expect } from "vitest";

// Mock msw's setupWorker to return a worker with a start fn
vi.mock("msw/browser", () => ({
  setupWorker: vi.fn(() => ({ start: vi.fn() })),
}));

// Use a fresh module import after setting env flags
const resetAndImport = async () => {
  vi.resetModules();
  return import("../browser");
};

describe("startMockServiceWorker", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = OLD_ENV;
    vi.clearAllMocks();
  });

  it("does not start the worker when not in dev or e2e mode", async () => {
    // Ensure flags are not set
    delete process.env.VITE_E2E_MODE;
    process.env.NODE_ENV = "test";

    const mod = await resetAndImport();

    const startSpy = (mod as any).worker.start as any;

    await mod.startMockServiceWorker();

    expect(startSpy).not.toHaveBeenCalled();
  });

  it("starts the worker when VITE_E2E_MODE=true", async () => {
    process.env.VITE_E2E_MODE = "true";
    process.env.NODE_ENV = "development";

    const mod = await resetAndImport();

    const startSpy = (mod as any).worker.start as any;

    await mod.startMockServiceWorker();

    expect(startSpy).toHaveBeenCalled();
  });
});
