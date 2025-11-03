/**
 * Centralized API client with JWT authentication and error handling
 */

import { config } from "./config";

export enum ApiErrorType {
  NETWORK_ERROR = "NETWORK_ERROR",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  SERVER_ERROR = "SERVER_ERROR",
  NOT_FOUND = "NOT_FOUND",
}

export interface ApiError {
  type: ApiErrorType;
  message: string;
  statusCode?: number;
  details?: any;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;

  constructor(
    baseURL: string = process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://localhost:3000",
    timeout: number = 10000,
  ) {
    this.baseURL = baseURL;
    this.defaultTimeout = timeout;
  }

  /**
   * Get JWT token from localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  }

  /**
   * Build request headers with authentication
   */
  private buildHeaders(config?: RequestConfig): HeadersInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...config?.headers,
    };

    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Build URL with query parameters
   */
  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint, this.baseURL);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Handle API errors and convert to ApiError
   */
  private async handleError(response: Response): Promise<ApiError> {
    let errorMessage = "An unexpected error occurred";
    let errorDetails: any = null;

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
      errorDetails = errorData;
    } catch {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }

    let errorType: ApiErrorType;
    switch (response.status) {
      case 401:
        errorType = ApiErrorType.AUTHENTICATION_ERROR;
        // Clear invalid token
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
        }
        break;
      case 403:
        errorType = ApiErrorType.AUTHORIZATION_ERROR;
        break;
      case 404:
        errorType = ApiErrorType.NOT_FOUND;
        break;
      case 400:
      case 422:
        errorType = ApiErrorType.VALIDATION_ERROR;
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        errorType = ApiErrorType.SERVER_ERROR;
        break;
      default:
        errorType = ApiErrorType.NETWORK_ERROR;
    }

    return {
      type: errorType,
      message: errorMessage,
      statusCode: response.status,
      details: errorDetails,
    };
  }

  /**
   * Make HTTP request with error handling and retries
   */
  private async makeRequest<T>(
    method: string,
    endpoint: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<T> {
    const url = this.buildURL(endpoint, config?.params);
    const headers = this.buildHeaders(config);
    const timeout = config?.timeout || this.defaultTimeout;

    const requestOptions: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(timeout),
    };

    if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
      requestOptions.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        const error = await this.handleError(response);
        throw error;
      }

      // Handle empty responses (like DELETE operations)
      if (
        response.status === 204 ||
        response.headers.get("content-length") === "0"
      ) {
        return {} as T;
      }

      const result: ApiResponse<T> = await response.json();
      return result.data !== undefined ? result.data : (result as T);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError" || error.name === "TimeoutError") {
          throw {
            type: ApiErrorType.NETWORK_ERROR,
            message: "Request timeout",
            details: error,
          } as ApiError;
        }

        if (error.message.includes("fetch")) {
          throw {
            type: ApiErrorType.NETWORK_ERROR,
            message: "Network connection failed",
            details: error,
          } as ApiError;
        }
      }

      // Re-throw ApiError instances
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>("GET", endpoint, undefined, config);
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<T> {
    return this.makeRequest<T>("POST", endpoint, data, config);
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<T> {
    return this.makeRequest<T>("PUT", endpoint, data, config);
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<T> {
    return this.makeRequest<T>("PATCH", endpoint, data, config);
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>("DELETE", endpoint, undefined, config);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getAuthToken() !== null;
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    }
  }

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  }
}

// Export singleton instance with configuration
export const apiClient = new ApiClient(config.api.baseURL, config.api.timeout);
export default apiClient;

// Explicit re-exports to ensure they're available
export type { ApiError, RequestConfig, ApiResponse };
