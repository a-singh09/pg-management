/**
 * Authentication service for JWT-based authentication
 */

import { apiClient, ApiError, ApiErrorType } from "./api-client";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "owner" | "tenant";
  ownerId?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

class AuthService {
  private authStateKey = "auth_state";
  private tokenKey = "auth_token";

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        "/api/auth/login",
        credentials,
      );

      // Store token and user data
      this.setAuthData(response);

      return response;
    } catch (error) {
      // Handle specific authentication errors
      if (error && typeof error === "object" && "type" in error) {
        const apiError = error as ApiError;
        if (apiError.type === ApiErrorType.AUTHENTICATION_ERROR) {
          throw new Error("Invalid email or password");
        }
        if (apiError.type === ApiErrorType.VALIDATION_ERROR) {
          throw new Error("Please provide valid email and password");
        }
        if (apiError.type === ApiErrorType.NETWORK_ERROR) {
          throw new Error("Unable to connect to server. Please try again.");
        }
      }

      throw new Error("Login failed. Please try again.");
    }
  }

  /**
   * Logout user and clear stored data
   */
  logout(): void {
    // Clear token from API client
    apiClient.clearAuthToken();

    // Clear stored auth data
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.authStateKey);
    }
  }

  /**
   * Get current authentication state
   */
  getAuthState(): AuthState {
    if (typeof window === "undefined") {
      return {
        isAuthenticated: false,
        user: null,
        token: null,
      };
    }

    const token = localStorage.getItem(this.tokenKey);
    const authStateStr = localStorage.getItem(this.authStateKey);

    if (!token || !authStateStr) {
      return {
        isAuthenticated: false,
        user: null,
        token: null,
      };
    }

    try {
      const authState = JSON.parse(authStateStr);

      // Check if token is expired
      if (this.isTokenExpired(token)) {
        this.logout();
        return {
          isAuthenticated: false,
          user: null,
          token: null,
        };
      }

      return {
        isAuthenticated: true,
        user: authState.user,
        token,
      };
    } catch {
      // If parsing fails, clear invalid data
      this.logout();
      return {
        isAuthenticated: false,
        user: null,
        token: null,
      };
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getAuthState().isAuthenticated;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.getAuthState().user;
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.getAuthState().token;
  }

  /**
   * Store authentication data
   */
  private setAuthData(authResponse: AuthResponse): void {
    if (typeof window === "undefined") return;

    // Set token in API client
    apiClient.setAuthToken(authResponse.token);

    // Store token and user data
    localStorage.setItem(this.tokenKey, authResponse.token);
    localStorage.setItem(
      this.authStateKey,
      JSON.stringify({
        user: authResponse.user,
        expiresIn: authResponse.expiresIn,
        loginTime: Date.now(),
      }),
    );
  }

  /**
   * Check if JWT token is expired
   */
  private isTokenExpired(token: string): boolean {
    try {
      // Decode JWT payload (without verification)
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      return payload.exp < currentTime;
    } catch {
      // If token is malformed, consider it expired
      return true;
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<string> {
    try {
      const response = await apiClient.post<{ token: string }>(
        "/api/auth/refresh",
      );

      // Update stored token
      apiClient.setAuthToken(response.token);
      if (typeof window !== "undefined") {
        localStorage.setItem(this.tokenKey, response.token);
      }

      return response.token;
    } catch (error) {
      // If refresh fails, logout user
      this.logout();
      throw new Error("Session expired. Please login again.");
    }
  }

  /**
   * Handle authentication redirects
   */
  redirectToLogin(): void {
    if (typeof window !== "undefined") {
      // Store current path for redirect after login
      const currentPath = window.location.pathname;
      if (currentPath !== "/login") {
        localStorage.setItem("redirect_after_login", currentPath);
      }

      // Redirect to login page
      window.location.href = "/login";
    }
  }

  /**
   * Handle redirect after successful login
   */
  handlePostLoginRedirect(): void {
    if (typeof window !== "undefined") {
      const redirectPath = localStorage.getItem("redirect_after_login");
      localStorage.removeItem("redirect_after_login");

      if (redirectPath && redirectPath !== "/login") {
        window.location.href = redirectPath;
      } else {
        window.location.href = "/";
      }
    }
  }

  /**
   * Initialize auth service (call on app startup)
   */
  initialize(): void {
    const authState = this.getAuthState();

    if (authState.isAuthenticated && authState.token) {
      // Set token in API client if user is authenticated
      apiClient.setAuthToken(authState.token);
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
