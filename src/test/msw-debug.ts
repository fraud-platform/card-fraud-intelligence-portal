// Temporary MSW debug helper for unhandled requests during test runs
export function mswUnhandledErrorLogger(req: any) {
  // Log method and URL to stderr so Vitest captures it
  console.error("[MSW-Unhandled] %s %s", req.method, req.url.href);
  return "error";
}
