import { setupServer } from "msw/node";
import { handlers } from "../mocks/handlers";

/**
 * Shared MSW Server Instance
 *
 * This server is used by all tests to intercept requests.
 * Having a single shared instance avoids race conditions and memory leaks
 * caused by multiple tests creating their own servers.
 */
export const server = setupServer(...handlers);
