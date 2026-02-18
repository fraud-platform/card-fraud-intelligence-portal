/**
 * API versioning strategy:
 * - All first-party service routes are rooted under `/api/v1`.
 * - Version upgrades should be introduced as `/api/v2` side-by-side,
 *   then consumers can migrate endpoint-by-endpoint.
 */

export const API_VERSION_PREFIX = "/api/v1";
