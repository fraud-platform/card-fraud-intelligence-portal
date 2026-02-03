import type { RouteObject } from "react-router";
import type { RouteConfig } from "./types";

/**
 * Convert RouteConfig to react-router RouteObject
 */
export function convertToRouteObjects(config: RouteConfig[]): RouteObject[] {
  return config.map((route) => {
    if (route.index === true) {
      // Index route - no children allowed
      const indexRoute: RouteObject = {
        index: true,
        element: route.element,
      };
      return indexRoute;
    }

    // Non-index route
    const routeObj: RouteObject = {
      path: route.path,
      element: route.element,
    };

    if (route.children !== undefined && route.children.length > 0) {
      routeObj.children = convertToRouteObjects(route.children);
    }

    return routeObj;
  });
}

/**
 * Flatten routes for easier lookup
 */
export function flattenRoutes(
  routes: RouteConfig[],
  parentPath = ""
): Array<{ path: string; title: string; meta?: RouteConfig["meta"] }> {
  const result: Array<{ path: string; title: string; meta?: RouteConfig["meta"] }> = [];

  for (const route of routes) {
    const fullPath =
      route.path === "/" ? parentPath : `${parentPath}/${route.path}`.replace(/\/+/g, "/");

    if (route.meta?.title !== undefined && route.meta.title !== "") {
      result.push({
        path: fullPath,
        title: route.meta.title,
        meta: route.meta,
      });
    }

    if (route.children !== undefined && route.children.length > 0) {
      result.push(...flattenRoutes(route.children, fullPath));
    }
  }

  return result;
}

/**
 * Get all route paths for command palette
 */
export function getCommandPaletteRoutes(config: RouteConfig[]): Array<{
  path: string;
  title: string;
  keywords?: string[];
}> {
  const allRoutes = flattenRoutes(config);

  // Filter out non-navigable routes and add keywords
  return (
    allRoutes
      .filter((route) => !route.path.includes(":") && !route.path.includes("*"))
      // Remove duplicate paths
      .filter((route, index, self) => index === self.findIndex((r) => r.path === route.path))
      .map((route) => ({
        path: route.path,
        title: route.title,
        keywords: generateKeywords(route.title, route.path),
      }))
  );
}

function generateKeywords(title: string, path: string): string[] {
  const keywords: string[] = [];

  // Add title parts
  keywords.push(...title.toLowerCase().split(" "));

  // Add path segments
  const segments = path.split("/").filter(Boolean);
  keywords.push(...segments);

  // Add common synonyms
  if (title.includes("Rule")) {
    keywords.push("policy", "condition", "logic");
  }
  if (title.includes("Transaction")) {
    keywords.push("txn", "payment", "charge");
  }
  if (title.includes("Case")) {
    keywords.push("investigation", "fraud", "review");
  }
  if (title.includes("Worklist")) {
    keywords.push("queue", "tasks", "pending");
  }

  return [...new Set(keywords)];
}
