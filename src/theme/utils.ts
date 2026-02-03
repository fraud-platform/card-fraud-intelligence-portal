import { theme as antdTheme, type ThemeConfig } from "antd";
import type { Density, ThemeStorage } from "./types";

const { compactAlgorithm, defaultAlgorithm, darkAlgorithm } = antdTheme;

const STORAGE_KEY = "fraud-portal-theme";

/**
 * Get initial theme from localStorage or defaults
 */
export function getInitialTheme(): ThemeStorage {
  if (typeof window === "undefined") {
    return { density: "compact", themeMode: "light" };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null && stored !== "") {
      const parsed = JSON.parse(stored) as ThemeStorage;
      return {
        density: parsed.density ?? "compact",
        themeMode: parsed.themeMode ?? "light",
      };
    }
  } catch {
    // Ignore localStorage errors
  }

  return { density: "compact", themeMode: "light" };
}

/**
 * Save theme to localStorage
 */
export function saveTheme(theme: ThemeStorage): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Check if system prefers dark mode
 */
export function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * Create base theme tokens based on density
 */
export function createBaseTokens(density: Density): ThemeConfig["token"] {
  const isCompact = density === "compact";

  return {
    ...getColorTokens(),
    ...getSpacingTokens(isCompact),
    ...getTypographyTokens(isCompact),
    borderRadius: isCompact ? 4 : 6,
    lineHeight: isCompact ? 1.4 : 1.5715,
  };
}

function getColorTokens(): ThemeConfig["token"] {
  return {
    colorPrimary: "#1f77d4",
    colorSuccess: "#2cba4a",
    colorWarning: "#ff9c3e",
    colorError: "#e74856",
    colorInfo: "#1890ff",
  };
}

function getSpacingTokens(isCompact: boolean): ThemeConfig["token"] {
  return {
    padding: isCompact ? 12 : 16,
    paddingLG: isCompact ? 16 : 24,
    paddingMD: isCompact ? 12 : 16,
    paddingSM: isCompact ? 8 : 12,
    paddingXS: isCompact ? 4 : 8,
    paddingXXS: isCompact ? 2 : 4,
    margin: isCompact ? 12 : 16,
    marginLG: isCompact ? 16 : 24,
    marginMD: isCompact ? 12 : 16,
    marginSM: isCompact ? 8 : 12,
    marginXS: isCompact ? 4 : 8,
  };
}

function getTypographyTokens(isCompact: boolean): ThemeConfig["token"] {
  return {
    fontSize: isCompact ? 13 : 14,
    fontSizeHeading1: isCompact ? 24 : 32,
    fontSizeHeading2: isCompact ? 20 : 26,
    fontSizeHeading3: isCompact ? 16 : 22,
    fontSizeHeading4: isCompact ? 14 : 18,
    fontSizeHeading5: isCompact ? 13 : 16,
  };
}

/**
 * Create component overrides based on density
 */
export function createComponentTokens(density: Density): ThemeConfig["components"] {
  const isCompact = density === "compact";

  return {
    ...getTableTokens(isCompact),
    ...getCardTokens(isCompact),
    ...getFormTokens(isCompact),
    ...getButtonTokens(isCompact),
    Tag: { defaultBg: "#f0f0f0" },
    ...getLayoutTokens(isCompact),
    ...getMenuTokens(isCompact),
    ...getSelectTokens(isCompact),
    ...getInputTokens(isCompact),
    Pagination: { itemSize: isCompact ? 28 : 32 },
    List: { itemPadding: isCompact ? "8px 0" : "12px 0" },
    Drawer: { padding: isCompact ? 16 : 24 },
    Modal: { padding: isCompact ? 16 : 24, paddingLG: isCompact ? 16 : 24 },
  };
}

function getTableTokens(isCompact: boolean): ThemeConfig["components"] {
  return {
    Table: {
      cellPaddingBlock: isCompact ? 8 : 12,
      cellPaddingInline: isCompact ? 12 : 16,
      cellFontSize: isCompact ? 13 : 14,
      headerBg: isCompact ? "#fafafa" : "#f5f5f5",
      headerColor: "#262626",
      rowHoverBg: "#f0f7ff",
      borderColor: "#e8e8e8",
    },
  };
}

function getCardTokens(isCompact: boolean): ThemeConfig["components"] {
  return {
    Card: {
      paddingLG: isCompact ? 16 : 24,
      padding: isCompact ? 12 : 16,
    },
  };
}

function getFormTokens(isCompact: boolean): ThemeConfig["components"] {
  return {
    Form: {
      itemMarginBottom: isCompact ? 12 : 20,
      verticalLabelPadding: isCompact ? "0 0 4px" : "0 0 8px",
    },
  };
}

function getButtonTokens(isCompact: boolean): ThemeConfig["components"] {
  return {
    Button: {
      paddingInline: isCompact ? 12 : 16,
      paddingBlock: isCompact ? 4 : 8,
    },
  };
}

function getLayoutTokens(isCompact: boolean): ThemeConfig["components"] {
  return {
    Layout: {
      siderBg: "#001529",
      headerBg: "#fff",
      headerPadding: isCompact ? "0 16px" : "0 24px",
      headerHeight: isCompact ? 48 : 64,
    },
  };
}

function getMenuTokens(isCompact: boolean): ThemeConfig["components"] {
  return {
    Menu: {
      itemHeight: isCompact ? 36 : 40,
      itemMarginBlock: 2,
      iconSize: isCompact ? 14 : 16,
    },
  };
}

function getSelectTokens(isCompact: boolean): ThemeConfig["components"] {
  return {
    Select: {
      optionFontSize: isCompact ? 13 : 14,
      optionPadding: isCompact ? "4px 12px" : "8px 16px",
    },
  };
}

function getInputTokens(isCompact: boolean): ThemeConfig["components"] {
  return {
    Input: {
      paddingBlock: isCompact ? 4 : 8,
      paddingInline: isCompact ? 8 : 12,
    },
  };
}

export { compactAlgorithm, defaultAlgorithm, darkAlgorithm };
