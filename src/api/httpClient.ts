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

/**
 * Create axios instance with base configuration
 */
const isE2EMode = import.meta.env.VITE_E2E_MODE === "true";
const envApiUrl = import.meta.env.VITE_API_URL as string | undefined;
const resolvedBaseUrl = isE2EMode || envApiUrl == null || envApiUrl === "" ? "" : envApiUrl;

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
    // Transform axios error to ApiError
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
