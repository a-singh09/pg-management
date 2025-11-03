/**
 * Authentication service with JWT token management
 */

import { apiClient, ApiError } from "./api-client";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface TenantLoginCredentials {
  tenantCode: string;
  dob: string;
}

export interface AuthResponse {
  token: string;
  tenant?: {
    id: string;
    name: string;
    email: string;
    tenantCode: string;
    propertyName: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  userType?: "owner" | "tenant";
  tenantCode?: string;
  propertyName?: string;
}

class AuthService {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        "/api/auth/login",
        credentials,
      );

      if (response.token) {
        apiClient.setAuthToken(response.token);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        "/api/auth/signup",
        credentials,
      );

      if (response.token) {
        apiClient.setAuthToken(response.token);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login tenant with tenant code and date of birth
   */
  async tenantLogin(
    credentials: TenantLoginCredentials,
  ): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        "/api/auth/tenant/login",
        credentials,
      );

      if (response.token) {
        apiClient.setAuthToken(response.token);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    apiClient.clearAuthToken();
    if (typeof window !== "undefined") {
      window.location.href = "/auth";
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  /**
   * Get current user from token
   */
  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem("auth_token");
    if (!token) return null;

    try {
      // Decode JWT token to get user info
      const payload = JSON.parse(atob(token.split(".")[1]));

      return {
        id: payload.ownerId || payload.tenantId,
        name: payload.name,
        email: payload.email,
        userType: payload.userType || "owner",
        tenantCode: payload.tenantCode,
      };
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }

  /**
   * Redirect to login if not authenticated
   */
  requireAuth(): void {
    if (!this.isAuthenticated()) {
      if (typeof window !== "undefined") {
        window.location.href = "/auth";
      }
    }
  }
}

export const authService = new AuthService();
export default authService;
