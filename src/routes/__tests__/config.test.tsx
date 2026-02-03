/**
 * Router Config Tests
 *
 * Tests for route configuration:
 * - Route definitions exist
 * - Route conversion works
 * - Command palette routes are generated
 */

import { describe, it, expect } from "vitest";
import {
  routeConfig,
  convertToRouteObjects,
  getCommandPaletteRoutes,
  flattenRoutes,
} from "../config";

describe("Router Config", () => {
  describe("routeConfig", () => {
    it("should have route definitions", () => {
      expect(routeConfig).toBeDefined();
      expect(routeConfig.length).toBeGreaterThan(0);
    });

    it("should have login route", () => {
      const loginRoute = routeConfig.find((r) => r.path === "/login");
      expect(loginRoute).toBeDefined();
    });

    it("should have callback route", () => {
      const callbackRoute = routeConfig.find((r) => r.path === "/callback");
      expect(callbackRoute).toBeDefined();
    });

    it("should have root route with children", () => {
      const rootRoute = routeConfig.find((r) => r.path === "/");
      expect(rootRoute).toBeDefined();
      expect(rootRoute?.children).toBeDefined();
      expect(rootRoute?.children?.length).toBeGreaterThan(0);
    });
  });

  describe("convertToRouteObjects", () => {
    it("should convert config to RouteObjects", () => {
      const routeObjects = convertToRouteObjects(routeConfig);
      expect(routeObjects).toBeDefined();
      expect(routeObjects.length).toBe(routeConfig.length);
    });
  });

  describe("flattenRoutes", () => {
    it("should flatten routes for lookup", () => {
      const flatRoutes = flattenRoutes(routeConfig);
      expect(flatRoutes).toBeDefined();
      expect(flatRoutes.length).toBeGreaterThan(0);
    });

    it("should include route titles", () => {
      const flatRoutes = flattenRoutes(routeConfig);
      const routesWithTitles = flatRoutes.filter((r) => r.title);
      expect(routesWithTitles.length).toBeGreaterThan(0);
    });
  });

  describe("getCommandPaletteRoutes", () => {
    it("should generate command palette routes", () => {
      const paletteRoutes = getCommandPaletteRoutes();
      expect(paletteRoutes).toBeDefined();
      expect(paletteRoutes.length).toBeGreaterThan(0);
    });

    it("should have paths and titles", () => {
      const paletteRoutes = getCommandPaletteRoutes();
      const firstRoute = paletteRoutes[0];
      expect(firstRoute.path).toBeDefined();
      expect(firstRoute.title).toBeDefined();
    });

    it("should include keywords for search", () => {
      const paletteRoutes = getCommandPaletteRoutes();
      const routesWithKeywords = paletteRoutes.filter((r) => r.keywords && r.keywords.length > 0);
      expect(routesWithKeywords.length).toBeGreaterThan(0);
    });
  });
});
