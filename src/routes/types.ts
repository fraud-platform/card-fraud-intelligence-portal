import type { ReactNode } from "react";

/**
 * Route configuration object
 *
 * Defines all application routes in a data-driven format.
 */
export interface RouteConfig {
  /** Route path */
  path: string;
  /** Route element */
  element: ReactNode;
  /** Child routes */
  children?: RouteConfig[];
  /** Route metadata */
  meta?: {
    /** Whether route requires authentication */
    requiresAuth?: boolean;
    /** Required permissions */
    permissions?: string[];
    /** Route title */
    title?: string;
    /** Whether to preload the route */
    preload?: boolean;
  };
  /** Route index (for child routes) */
  index?: boolean;
}
