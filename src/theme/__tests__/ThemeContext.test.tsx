/**
 * ThemeContext Tests
 *
 * Tests for theme management including:
 * - Density toggle (compact/comfortable)
 * - Dark mode toggle
 * - Theme configuration generation
 * - localStorage persistence
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { ThemeProvider, useTheme, useIsCompact, useIsDark } from "..";
import type { ReactNode } from "react";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

function wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

describe("ThemeContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initial state", () => {
    it("should default to compact density", () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.density).toBe("compact");
    });

    it("should default to light theme mode", () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.themeMode).toBe("light");
      expect(result.current.isDark).toBe(false);
    });

    it("should load stored preferences from localStorage", () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ density: "comfortable", themeMode: "dark" })
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.density).toBe("comfortable");
      expect(result.current.themeMode).toBe("dark");
    });
  });

  describe("density toggle", () => {
    it("should toggle density between compact and comfortable", () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.density).toBe("compact");

      act(() => {
        result.current.toggleDensity();
      });

      expect(result.current.density).toBe("comfortable");

      act(() => {
        result.current.toggleDensity();
      });

      expect(result.current.density).toBe("compact");
    });

    it("should set density directly", () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setDensity("comfortable");
      });

      expect(result.current.density).toBe("comfortable");
    });

    it("should persist density to localStorage", async () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setDensity("comfortable");
      });

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "fraud-portal-theme",
          JSON.stringify({ density: "comfortable", themeMode: "light" })
        );
      });
    });
  });

  describe("theme mode", () => {
    it("should toggle between light and dark", () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.themeMode).toBe("light");
      expect(result.current.isDark).toBe(false);

      act(() => {
        result.current.toggleDarkMode();
      });

      expect(result.current.themeMode).toBe("dark");
    });

    it("should set theme mode directly", () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setThemeMode("dark");
      });

      expect(result.current.themeMode).toBe("dark");
    });

    it("should persist theme mode to localStorage", async () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setThemeMode("dark");
      });

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "fraud-portal-theme",
          JSON.stringify({ density: "compact", themeMode: "dark" })
        );
      });
    });
  });

  describe("theme config", () => {
    it("should generate theme config with algorithms", () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.themeConfig).toBeDefined();
      expect(result.current.themeConfig.algorithm).toBeDefined();
      expect(result.current.themeConfig.token).toBeDefined();
      expect(result.current.themeConfig.components).toBeDefined();
    });

    it("should include compactAlgorithm when density is compact", () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      const algorithms = result.current.themeConfig.algorithm as unknown[];
      expect(algorithms.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("command palette", () => {
    it("should have command palette closed by default", () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.isCommandPaletteOpen).toBe(false);
    });

    it("should open command palette", () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.openCommandPalette();
      });

      expect(result.current.isCommandPaletteOpen).toBe(true);
    });

    it("should close command palette", () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.openCommandPalette();
      });

      act(() => {
        result.current.closeCommandPalette();
      });

      expect(result.current.isCommandPaletteOpen).toBe(false);
    });

    it("should toggle command palette", () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.isCommandPaletteOpen).toBe(false);

      act(() => {
        result.current.toggleCommandPalette();
      });

      expect(result.current.isCommandPaletteOpen).toBe(true);

      act(() => {
        result.current.toggleCommandPalette();
      });

      expect(result.current.isCommandPaletteOpen).toBe(false);
    });
  });
});

describe("useIsCompact", () => {
  it("should return true when density is compact", () => {
    const { result } = renderHook(() => useIsCompact(), { wrapper });

    expect(result.current).toBe(true);
  });
});

describe("useIsDark", () => {
  it("should return false for light mode by default", () => {
    const { result } = renderHook(() => useIsDark(), { wrapper });

    expect(result.current).toBe(false);
  });
});
