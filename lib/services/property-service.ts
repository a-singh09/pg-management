/**
 * Property service for handling property-related API operations
 */

import { apiClient, ApiError } from "../api-client";
import {
  propertyTransformer,
  Property,
  BackendProperty,
  BackendCreateResponse,
  CreatePropertyData,
  UpdatePropertyData,
} from "../transformers/property-transformer";

export interface PropertyService {
  getProperties(): Promise<Property[]>;
  getProperty(id: string): Promise<Property>;
  createProperty(data: CreatePropertyData): Promise<Property>;
  updateProperty(id: string, data: UpdatePropertyData): Promise<Property>;
  deleteProperty(id: string): Promise<void>;
}

class PropertyServiceImpl implements PropertyService {
  private readonly endpoint = "/api/property";

  /**
   * Get all properties for the authenticated owner
   */
  async getProperties(): Promise<Property[]> {
    try {
      const backendProperties: BackendProperty[] = await apiClient.get(
        this.endpoint,
      );
      return propertyTransformer.toFrontendArray(backendProperties);
    } catch (error) {
      console.error("Failed to fetch properties:", error);
      throw error;
    }
  }

  /**
   * Get a specific property by ID
   */
  async getProperty(id: string): Promise<Property> {
    try {
      const backendProperty: BackendProperty = await apiClient.get(
        `${this.endpoint}/${id}`,
      );
      return propertyTransformer.toFrontend(backendProperty);
    } catch (error) {
      console.error(`Failed to fetch property ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new property
   */
  async createProperty(data: CreatePropertyData): Promise<Property> {
    try {
      const requestData = propertyTransformer.toCreateRequest(data);
      const response: { propertyId: string; message: string } =
        await apiClient.post(this.endpoint, requestData);

      // After creating, fetch the full property data
      return await this.getProperty(response.propertyId);
    } catch (error) {
      console.error("Failed to create property:", error);
      throw error;
    }
  }

  /**
   * Update an existing property
   */
  async updateProperty(
    id: string,
    data: UpdatePropertyData,
  ): Promise<Property> {
    try {
      const requestData = propertyTransformer.toUpdateRequest(data);
      const backendProperty: BackendProperty = await apiClient.put(
        `${this.endpoint}/${id}`,
        requestData,
      );
      return propertyTransformer.toFrontend(backendProperty);
    } catch (error) {
      console.error(`Failed to update property ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a property
   */
  async deleteProperty(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error(`Failed to delete property ${id}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const propertyService = new PropertyServiceImpl();
export default propertyService;

// Re-export types for convenience
export type {
  Property,
  CreatePropertyData,
  UpdatePropertyData,
} from "../transformers/property-transformer";
