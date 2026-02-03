/**
 * Sentry Error Monitoring Module
 *
 * Provides error tracking and performance monitoring for production.
 * Automatically disabled in development mode.
 *
 * Configuration via environment variables:
 * - VITE_SENTRY_DSN: Sentry project DSN
 * - VITE_SENTRY_ENVIRONMENT: Environment name (production, staging)
 * - VITE_SENTRY_RELEASE: Application release version
 */

import * as Sentry from "@sentry/react";

interface CustomProcessEnv {
  [key: string]: string | undefined;
}

interface CustomProcess {
  env?: CustomProcessEnv;
}

function isProduction(): boolean {
  const processEnv = (globalThis as unknown as { process?: CustomProcess }).process?.env ?? {};
  const nodeEnv = processEnv?.NODE_ENV;
  return (
    import.meta.env.PROD === true ||
    nodeEnv === "production" ||
    import.meta.env.VITEST_ENV === "production"
  );
}

/**
 * Initialize Sentry error monitoring
 *
 * Should be called as early as possible in the application lifecycle,
 * ideally before React renders.
 */
export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT as string | undefined;
  const release = import.meta.env.VITE_SENTRY_RELEASE as string | undefined;

  // Skip initialization in development or if no DSN is configured
  if (dsn == null || dsn === "" || import.meta.env.DEV === true) {
    if (import.meta.env.DEV === true) {
      console.warn("[Sentry] Disabled in development mode");
    }
    return;
  }

  Sentry.init({
    dsn,
    environment: environment ?? "production",
    release: release ?? "1.0.0",

    // Performance monitoring integrations
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // Mask all text and block all media for privacy
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Sample rates (adjust based on traffic volume)
    tracesSampleRate: 0.1, // 10% of transactions
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

    // Scrub sensitive data before sending
    beforeSend(event) {
      // Remove authorization headers
      if (event.request?.headers != null) {
        delete event.request.headers["Authorization"];
        delete event.request.headers["authorization"];
      }

      // Remove any PII from breadcrumbs
      if (event.breadcrumbs != null) {
        event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
          const data = breadcrumb.data as Record<string, unknown> | undefined;
          const url = data?.url;
          if (url != null && typeof url === "string") {
            // Remove any tokens from URLs
            breadcrumb.data = {
              ...data,
              url: url.replace(/token=[^&]+/gi, "token=[REDACTED]"),
            };
          }
          return breadcrumb;
        });
      }

      return event;
    },
  });

  console.warn("[Sentry] Initialized for", environment ?? "production");
}

/**
 * Capture and report an error to Sentry
 *
 * In development, only logs to console.
 * In production, sends to Sentry dashboard.
 *
 * @param error - The error to capture
 * @param context - Additional context to attach to the error
 */
export function captureError(error: Error, context?: Record<string, unknown>): void {
  // Always log to console for debugging
  console.error("[Error]", error, context);

  // Send to Sentry in production
  if (isProduction()) {
    Sentry.captureException(error, {
      extra: context,
    });
  }
}

/**
 * Set user context for Sentry
 *
 * Call this after authentication to associate errors with users.
 *
 * @param user - User information (email, id, role)
 */
export function setUser(user: { id?: string; email?: string; role?: string } | null): void {
  if (isProduction()) {
    Sentry.setUser(user);
  }
}

/**
 * Add a breadcrumb for debugging
 *
 * Breadcrumbs help trace the sequence of events leading to an error.
 *
 * @param message - Description of the event
 * @param category - Category of the breadcrumb (e.g., 'navigation', 'api')
 * @param data - Additional data to attach
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>
): void {
  if (isProduction()) {
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: "info",
    });
  }
}

// Re-export Sentry for advanced usage
export { Sentry };
