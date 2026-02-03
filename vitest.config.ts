import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import os from "os";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ["@refinedev/core", "@refinedev/react-router", "@refinedev/antd"],
  },
  test: {
    deps: {
      inline: [/^@refinedev\//],
    },
    // Enable global test APIs (describe, it, expect, etc.)
    globals: true,

    // Use happy-dom for DOM simulation (faster than jsdom)
    environment: "happy-dom",

    // Use fake timers to speed up tests with delays
    fakeTimers: {
      toFake: [
        "setTimeout",
        "clearTimeout",
        "setInterval",
        "clearInterval",
        "setImmediate",
        "clearImmediate",
        "Date",
      ],
    },

    // Setup files to run before each test file (order matters - early setup first)
    setupFiles: ["./src/test/early-setup.ts", "./src/test/setup.ts"],

    // Optimize VM threads - reuse contexts for faster runs
    experimentalVmThreads: false,

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],

      // Coverage thresholds - fails if not met (target: 85%)
      thresholds: {
        statements: 85,
        branches: 85,
        functions: 85,
        lines: 85,
      },

      // Files to exclude from coverage
      exclude: [
        "node_modules/**",
        "dist/**",
        "**/*.d.ts",
        "**/*.config.{js,ts,mjs,cjs}",
        "**/test/**",
        "**/__tests__/**",
        "**/*.test.{ts,tsx,js,jsx}",
        "**/*.spec.{ts,tsx,js,jsx}",
        "src/main.tsx",
        "src/vite-env.d.ts",
        "e2e/**",
        // Exclude complex Refine component files that have E2E coverage
        "src/resources/**/list.tsx",
        "src/resources/**/create.tsx",
        "src/resources/**/edit.tsx",
        "src/resources/**/show.tsx",
        "src/resources/rules/components/ConditionBuilder/index.tsx",
        "src/resources/rules/components/ConditionBuilder/nodeTypes.ts",
        "src/resources/rules/components/ConditionBuilder/types.ts",
        "src/shared/components/index.ts",
        "src/shared/components/Layout/index.tsx",
        "src/shared/constants/ruleTypes.ts",
        "src/types/domain.ts",
        "src/mocks/sentry.ts",
        "src/pages/Callback.tsx",
        "src/mocks/data/ruleSets.ts",
        "src/mocks/handlers.ts",
        "src/App.tsx",
        "src/index.ts",
      ],

      // Include source files
      include: ["src/**/*.{ts,tsx}"],
    },

    // CSS module mocking
    css: {
      modules: {
        classNameStrategy: "non-scoped",
      },
    },

    // Test file patterns
    include: ["src/**/*.{test,spec}.{ts,tsx}"],

    // Exclude patterns
    exclude: ["node_modules/**", "dist/**", "e2e/**", ".{idea,git,cache,output,temp}/**"],

    // PERFORMANCE OPTIMIZATIONS

    // Use 'forks' pool for better performance - threads had worker timeout issues
    pool: "forks",

    // Worker count - scale with available CPUs (defaults to cpu_count - 1), capped between 1 and 8
    maxWorkers: Number(
      process.env.VITEST_MAX_WORKERS ??
        String(Math.max(1, Math.min(4, Math.max(1, os.cpus().length - 1))))
    ),
    minWorkers: 1,

    // File parallelism - can disable for complex test suites with heavy setup
    fileParallelism: true,

    // Test timeout - optimized for faster feedback
    testTimeout: 30000,

    // Hook timeouts
    hookTimeout: 10000,

    // Reduce retry count - only retry in CI
    retry: process.env.CI ? 1 : 0,

    // Mock reset options - keep these for test isolation
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,

    // Enable test isolation - required for DOM tests to prevent state leakage
    // Keeping this true ensures tests don't interfere with each other
    isolate: true,

    // Vite cache configuration - helps with repeated runs (Vitest 4+ uses Vite's cacheDir)
    // Cache is automatically written to cacheDir/vitest

    // Log configuration - reduce logging overhead
    reporters: ["default"],
    outputFile: undefined,
  },
});
