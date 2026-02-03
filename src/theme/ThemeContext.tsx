/**
 * Theme Context Provider
 *
 * Manages application-wide theme state including:
 * - Dark/Light mode
 * - Density (Compact vs Comfortable)
 * - Algorithm-based theme generation
 */

import { useState, useCallback, useMemo, useEffect, type JSX, type ReactNode } from "react";
import type { ThemeConfig } from "antd";

import { ThemeContext } from "./context";
import { ThemeContextValue, Density, ThemeMode } from "./types";
import {
  getInitialTheme,
  saveTheme,
  systemPrefersDark,
  createBaseTokens,
  createComponentTokens,
  compactAlgorithm,
  defaultAlgorithm,
  darkAlgorithm,
} from "./utils";

/**
 * Theme Provider Component
 */
interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps): JSX.Element {
  const initialTheme = useMemo(() => getInitialTheme(), []);
  const [density, setDensityState] = useState<Density>(initialTheme.density);
  const [themeMode, setThemeModeState] = useState<ThemeMode>(initialTheme.themeMode);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Determine if dark mode is active
  const isDark = useMemo(() => {
    if (themeMode === "system") {
      return systemPrefersDark();
    }
    return themeMode === "dark";
  }, [themeMode]);

  // Save theme changes to localStorage
  useEffect(() => {
    saveTheme({ density, themeMode });
  }, [density, themeMode]);

  // Listen for system theme changes
  useEffect(() => {
    if (themeMode !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (): void => {
      // Force re-render by updating state - this is handled by the isDark memo
      setThemeModeState("system");
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [themeMode]);

  // Apply dark mode class to document
  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [isDark]);

  // Set density with persistence
  const setDensity = useCallback((newDensity: Density) => {
    setDensityState(newDensity);
  }, []);

  // Toggle density
  const toggleDensity = useCallback(() => {
    setDensityState((prev) => (prev === "compact" ? "comfortable" : "compact"));
  }, []);

  // Set theme mode
  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setThemeModeState((prev) => {
      if (prev === "dark") return "light";
      if (prev === "light") return "dark";
      return systemPrefersDark() ? "light" : "dark";
    });
  }, []);

  // Command palette controls
  const openCommandPalette = useCallback(() => setIsCommandPaletteOpen(true), []);
  const closeCommandPalette = useCallback(() => setIsCommandPaletteOpen(false), []);
  const toggleCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen((prev) => !prev);
  }, []);

  // Generate theme config
  const themeConfig = useMemo<ThemeConfig>(() => {
    const algorithms = [defaultAlgorithm];
    if (density === "compact") algorithms.push(compactAlgorithm);
    if (isDark) algorithms.push(darkAlgorithm);

    return {
      algorithm: algorithms,
      token: createBaseTokens(density),
      components: createComponentTokens(density),
    };
  }, [density, isDark]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      density,
      setDensity,
      toggleDensity,
      themeMode,
      setThemeMode,
      toggleDarkMode,
      isDark,
      themeConfig,
      isCommandPaletteOpen,
      openCommandPalette,
      closeCommandPalette,
      toggleCommandPalette,
    }),
    [
      density,
      setDensity,
      toggleDensity,
      themeMode,
      setThemeMode,
      toggleDarkMode,
      isDark,
      themeConfig,
      isCommandPaletteOpen,
      openCommandPalette,
      closeCommandPalette,
      toggleCommandPalette,
    ]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
