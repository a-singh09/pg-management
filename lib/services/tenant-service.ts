/**
 * Tenant service for handling tenant-related API operations
 */

import { apiClient, ApiError } from "../api-client";
import {
  tenantTransformer,
  Tenant,
  BackendTenant,
  CreateTenantData,
  UpdateTenantData,
} from "../transformers/tenant-transformer";

export interface TenantService {
  getTenants(): Promise<Tenant[]>;
  getTenant(id: string): Promise<Tenant>;
  createTenant(data: CreateTenantData): Promise<Tenant>;
  updateTenant(id: string, data: UpdateTenantData): Promise<Tenant>;
  deleteTenant(id: string): Promise<void>;
}

class TenantServiceImpl implements TenantService {
  private readonly baseEndpoint = "/api/tenants";

  /**
   * Get all tenants for the authenticated owner
   */
  async getTenants(): Promise<Tenant[]> {
    try {
      const backendTenants: BackendTenant[] = await apiClient.get(
        this.baseEndpoint,
      );
      return tenantTransformer.toFrontendArray(backendTenants);
    } catch (error) {
      console.error("Error fetching tenants:", error);
      throw error;
    }
  }

  /**
   * Get a specific tenant by ID
   */
  async getTenant(id: string): Promise<Tenant> {
    try {
      const backendTenant: BackendTenant = await apiClient.get(
        `${this.baseEndpoint}/${id}`,
      );
      return tenantTransformer.toFrontend(backendTenant);
    } catch (error) {
      console.error(`Error fetching tenant ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new tenant
   */
  async createTenant(data: CreateTenantData): Promise<Tenant> {
    try {
      const requestData = tenantTransformer.toCreateRequest(data);
      const backendTenant: BackendTenant = await apiClient.post(
        this.baseEndpoint,
        requestData,
      );
      return tenantTransformer.toFrontend(backendTenant);
    } catch (error) {
      console.error("Error creating tenant:", error);
      throw error;
    }
  }

  /**
   * Update an existing tenant
   */
  async updateTenant(id: string, data: UpdateTenantData): Promise<Tenant> {
    try {
      const requestData = tenantTransformer.toUpdateRequest(data);
      const backendTenant: BackendTenant = await apiClient.put(
        `${this.baseEndpoint}/${id}`,
        requestData,
      );
      return tenantTransformer.toFrontend(backendTenant);
    } catch (error) {
      console.error(`Error updating tenant ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a tenant
   */
  async deleteTenant(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseEndpoint}/${id}`);
    } catch (error) {
      console.error(`Error deleting tenant ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get tenants by property ID
   */
  async getTenantsByProperty(propertyId: string): Promise<Tenant[]> {
    try {
      const backendTenants: BackendTenant[] = await apiClient.get(
        this.baseEndpoint,
        {
          params: { propertyId },
        },
      );
      return tenantTransformer.toFrontendArray(backendTenants);
    } catch (error) {
      console.error(
        `Error fetching tenants for property ${propertyId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get tenants by status
   */
  async getTenantsByStatus(status: string): Promise<Tenant[]> {
    try {
      const backendTenants: BackendTenant[] = await apiClient.get(
        this.baseEndpoint,
        {
          params: { status },
        },
      );
      return tenantTransformer.toFrontendArray(backendTenants);
    } catch (error) {
      console.error(`Error fetching tenants with status ${status}:`, error);
      throw error;
    }
  }

  /**
   * Search tenants by name or phone
   */
  async searchTenants(searchTerm: string): Promise<Tenant[]> {
    try {
      const backendTenants: BackendTenant[] = await apiClient.get(
        `${this.baseEndpoint}/search`,
        {
          params: { q: searchTerm },
        },
      );
      return tenantTransformer.toFrontendArray(backendTenants);
    } catch (error) {
      console.error(`Error searching tenants with term ${searchTerm}:`, error);
      throw error;
    }
  }

  /**
   * Helper method to create tenant from form data
   */
  async createTenantFromForm(formData: any): Promise<Tenant> {
    try {
      // Import propertyService here to avoid circular dependency
      const { propertyService } = await import("./property-service");

      // Validate that property ID is provided
      if (!formData.pg_id) {
        throw new ApiError(
          "Property selection is required",
          "VALIDATION_ERROR",
          400,
        );
      }

      // Get property name from property ID
      const properties = await propertyService.getProperties();
      const property = properties.find((p) => p.id === formData.pg_id);

      if (!property) {
        throw new ApiError("Selected property not found", "NOT_FOUND", 404);
      }

      // Add property name to form data
      const formDataWithPropertyName = {
        ...formData,
        propertyName: property.name,
      };

      const createData = tenantTransformer.fromFormDataToCreateRequest(
        formDataWithPropertyName,
      );

      return this.createTenant(createData);
    } catch (error) {
      // Re-throw ApiError instances as-is
      if (error instanceof ApiError || (error as any).type) {
        throw error;
      }

      // Convert other errors to ApiError
      throw new ApiError(
        error.message || "Failed to create tenant",
        "VALIDATION_ERROR",
        400,
      );
    }
  }

  /**
   * Helper method to update tenant from form data
   */
  async updateTenantFromForm(id: string, formData: any): Promise<Tenant> {
    // Import propertyService here to avoid circular dependency
    const { propertyService } = await import("./property-service");

    // Get property name from property ID if property is being updated
    let formDataWithPropertyName = formData;
    if (formData.pg_id) {
      const properties = await propertyService.getProperties();
      const property = properties.find((p) => p.id === formData.pg_id);

      if (!property) {
        throw new ApiError("Property not found", "NOT_FOUND", 404);
      }

      formDataWithPropertyName = {
        ...formData,
        propertyName: property.name,
      };
    }

    const updateData = tenantTransformer.fromFormDataToUpdateRequest(
      formDataWithPropertyName,
    );
    return this.updateTenant(id, updateData);
  }
}

// Export singleton instance
export const tenantService = new TenantServiceImpl();

// Export types for use in components
export type { Tenant, CreateTenantData, UpdateTenantData };
