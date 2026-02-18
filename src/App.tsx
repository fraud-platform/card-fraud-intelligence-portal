/**
 * Legacy compatibility entrypoint.
 *
 * Runtime bootstrap uses `src/main.tsx` -> `src/app/App.tsx`.
 * Keep this re-export for tests/tooling that still import `src/App`.
 */
export { default } from "./app/App";
