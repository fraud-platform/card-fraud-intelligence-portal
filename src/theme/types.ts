import type { ThemeConfig } from "antd";

/**
 * Density preference type
 */
export type Density = "compact" | "comfortable";

/**
 * Theme mode type
 */
export type ThemeMode = "light" | "dark" | "system";

/**
 * Theme context value interface
 */
export interface ThemeContextValue {
  /** Current density setting */
  density: Density;
  /** Set density preference */
  setDensity: (density: Density) => void;
  /** Toggle between compact and comfortable */
  toggleDensity: () => void;
  /** Current theme mode */
  themeMode: ThemeMode;
  /** Set theme mode */
  setThemeMode: (mode: ThemeMode) => void;
  /** Toggle dark mode */
  toggleDarkMode: () => void;
  /** Whether dark mode is currently active */
  isDark: boolean;
  /** Generated Ant Design theme config */
  themeConfig: ThemeConfig;
  /** Command palette open state */
  isCommandPaletteOpen: boolean;
  /** Open command palette */
  openCommandPalette: () => void;
  /** Close command palette */
  closeCommandPalette: () => void;
  /** Toggle command palette */
  toggleCommandPalette: () => void;
}

export interface ThemeStorage {
  density: Density;
  themeMode: ThemeMode;
}
