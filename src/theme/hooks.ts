import { useContext, useMemo } from "react";
import { ThemeContext } from "./context";
import type { ThemeContextValue } from "./types";

/**
 * Hook to access theme context
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

/**
 * Hook to check if compact density is active
 */
export function useIsCompact(): boolean {
  const { density } = useTheme();
  return density === "compact";
}

/**
 * Hook to check if dark mode is active
 */
export function useIsDark(): boolean {
  const { isDark } = useTheme();
  return isDark;
}

/**
 * Compact table props helper
 * Returns table props based on current density
 */
export function useCompactTableProps(): {
  size: "small" | "middle" | "large";
  bordered: boolean;
  scroll: { x: number; y: number };
} {
  const { density } = useTheme();
  const isCompact = density === "compact";

  return useMemo(
    () => ({
      size: isCompact ? "small" : "middle",
      bordered: true,
      scroll: { x: 1200, y: isCompact ? 500 : 600 },
    }),
    [isCompact]
  );
}
