/**
 * HTTP Client
 *
 * Axios-based HTTP client with interceptors for authentication,
 * error handling, and request/response transformation.
 */

import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { ApiError } from "./types";
import { getAccessToken, isAuth0Enabled } from "../app/auth0Client";
import { readBooleanEnv, readStringEnv } from "../shared/utils/env";
import { API_VERSION_PREFIX } from "../shared/config/api";

/**
 * Create axios instance with base configuration
 */

const isE2EMode = readBooleanEnv(import.meta.env.VITE_E2E_MODE);
const envApiUrl = readStringEnv(import.meta.env.VITE_API_URL);
const resolvedBaseUrl = isE2EMode || envApiUrl == null || envApiUrl === "" ? "" : envApiUrl;
const txApiEnv =
  readStringEnv(import.meta.env.VITE_API_URL_TRANSACTION_MGMT) ??
  readStringEnv(import.meta.env.VITE_TRANSACTION_API_URL);
const opsAgentApiEnv =
  readStringEnv(import.meta.env.VITE_API_URL_OPS_ANALYST) ??
  readStringEnv(import.meta.env.VITE_OPS_ANALYST_URL);

function normalizeTxApiBase(raw: string): string {
  let base = raw.trim().replace(/\/$/, "");
  if (base.endsWith(API_VERSION_PREFIX)) {
    base = base.slice(0, -API_VERSION_PREFIX.length);
  }
  return base;
}

function resolveTransactionApiRoot(): string | null {
  if (typeof txApiEnv === "string" && txApiEnv !== "") {
    return normalizeTxApiBase(txApiEnv);
  }

  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:8002";
  }

  return null;
}

function shouldRouteToTransactionApi(url: string): boolean {
  const versionPrefix = API_VERSION_PREFIX;
  return (
    url.startsWith(`${versionPrefix}/transactions`) ||
    url.startsWith(`${versionPrefix}/worklist`) ||
    url.startsWith(`${versionPrefix}/cases`) ||
    url === `${versionPrefix}/metrics` ||
    url.startsWith(`${versionPrefix}/metrics/`)
  );
}

function resolveOpsAnalystApiRoot(): string | null {
  if (typeof opsAgentApiEnv === "string" && opsAgentApiEnv !== "") {
    return opsAgentApiEnv.replace(/\/$/, "");
  }
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:8003";
  }
  return null;
}

function shouldRouteToOpsAnalystApi(url: string): boolean {
  return url.startsWith(`${API_VERSION_PREFIX}/ops-agent/`);
}

export const httpClient = axios.create({
  baseURL: resolvedBaseUrl,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

function applyAuthHeader(
  config: InternalAxiosRequestConfig,
  token: string | null
): InternalAxiosRequestConfig {
  if (token == null || token === "") {
    return config;
  }

  if (config.headers == null) {
    config.headers = {
      Authorization: `Bearer ${token}`,
    } as unknown as InternalAxiosRequestConfig["headers"];
    return config;
  }

  (config.headers as Record<string, unknown>)["Authorization"] = `Bearer ${token}`;
  return config;
}

function getSessionToken(): string | null {
  const sessionStr = sessionStorage.getItem("auth_session");
  if (sessionStr != null && sessionStr !== "") {
    try {
      const session = JSON.parse(sessionStr) as { token?: string };
      if (typeof session.token === "string" && session.token !== "") {
        return session.token;
      }
    } catch {
      // ignore parse errors
    }
  }

  const localToken = localStorage.getItem("auth_token");
  return localToken != null && localToken !== "" ? localToken : null;
}

/**
 * Request interceptor - attach auth token
 */
httpClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (typeof config.url === "string" && !/^https?:\/\//i.test(config.url)) {
      const txApiRoot = resolveTransactionApiRoot();
      if (txApiRoot != null && shouldRouteToTransactionApi(config.url)) {
        config.baseURL = undefined;
        config.url = `${txApiRoot}${config.url}`;
      }

      const opsApiRoot = resolveOpsAnalystApiRoot();
      if (opsApiRoot != null && shouldRouteToOpsAnalystApi(config.url)) {
        config.baseURL = undefined;
        config.url = `${opsApiRoot}${config.url}`;
      }
    }

    if (isAuth0Enabled()) {
      const token = await getAccessToken();
      return applyAuthHeader(config, token);
    }

    return applyAuthHeader(config, getSessionToken());
  },
  (error) => {
    const err = error instanceof Error ? error : new Error(String(error));
    return Promise.reject(err);
  }
);

/**
 * Response interceptor - handle errors consistently
 */
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Transform axios error to ApiError.
    // Common status mappings:
    // 401 -> authentication required (session/token expired)
    // 403 -> authorization denied (insufficient role/scope)
    const apiError: ApiError = {
      message: "An unexpected error occurred",
      status: error.response?.status ?? 500,
    };

    if (error.response?.data != null) {
      const data = error.response.data as {
        message?: string;
        code?: string;
        errors?: Record<string, string[]>;
      };

      apiError.message = data.message ?? apiError.message;
      apiError.code = data.code;
      apiError.errors = data.errors;
    } else if (typeof error.message === "string" && error.message !== "") {
      apiError.message = error.message;
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      // Clear auth state
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");

      // Redirect to login (will be handled by authProvider)
      apiError.message = "Authentication required";
    }

    // Handle authorization errors
    if (error.response?.status === 403) {
      apiError.message = "You do not have permission to perform this action";
    }

    const err = Object.assign(new Error(apiError.message), apiError);
    return Promise.reject(err);
  }
);

/**
 * Type-safe request wrapper
 */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await httpClient.request<T>(config);
  return response.data;
}

/**
 * GET request helper
 */
export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return request<T>({ ...config, method: "GET", url });
}

/**
 * POST request helper
 */
export async function post<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  return request<T>({ ...config, method: "POST", url, data });
}

/**
 * PUT request helper
 */
export async function put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return request<T>({ ...config, method: "PUT", url, data });
}

/**
 * PATCH request helper
 */
export async function patch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  return request<T>({ ...config, method: "PATCH", url, data });
}

/**
 * DELETE request helper
 */
export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return request<T>({ ...config, method: "DELETE", url });
}

export default httpClient;
