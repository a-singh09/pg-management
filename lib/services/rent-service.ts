/**
 * Rent service for handling rent-related API operations
 */

import { apiClient, ApiError } from "../api-client";
import {
  rentTransformer,
  Rent,
  BackendRent,
  CreateRentData,
  UpdateRentData,
} from "../transformers/rent-transformer";

export interface RentService {
  getRents(): Promise<Rent[]>;
  getRent(id: string): Promise<Rent>;
  createRent(data: CreateRentData): Promise<Rent>;
  updateRent(id: string, data: UpdateRentData): Promise<Rent>;
  deleteRent(id: string): Promise<void>;
}

class RentServiceImpl implements RentService {
  private readonly baseEndpoint = "/api/rent";

  /**
   * Get all rent records for the authenticated owner
   */
  async getRents(): Promise<Rent[]> {
    try {
      const backendRents: BackendRent[] = await apiClient.get(
        this.baseEndpoint,
      );
      return rentTransformer.toFrontendArray(backendRents);
    } catch (error) {
      console.error("Error fetching rents:", error);
      throw error;
    }
  }

  /**
   * Get a specific rent record by ID
   */
  async getRent(id: string): Promise<Rent> {
    try {
      const backendRent: BackendRent = await apiClient.get(
        `${this.baseEndpoint}/${id}`,
      );
      return rentTransformer.toFrontend(backendRent);
    } catch (error) {
      console.error(`Error fetching rent ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new rent record (record rent payment)
   */
  async createRent(data: CreateRentData): Promise<Rent> {
    try {
      const requestData = rentTransformer.toCreateRequest(data);
      const backendRent: BackendRent = await apiClient.post(
        this.baseEndpoint,
        requestData,
      );
      return rentTransformer.toFrontend(backendRent);
    } catch (error) {
      console.error("Error creating rent record:", error);
      throw error;
    }
  }

  /**
   * Update an existing rent record
   */
  async updateRent(id: string, data: UpdateRentData): Promise<Rent> {
    try {
      const requestData = rentTransformer.toUpdateRequest(data);
      const backendRent: BackendRent = await apiClient.put(
        `${this.baseEndpoint}/${id}`,
        requestData,
      );
      return rentTransformer.toFrontend(backendRent);
    } catch (error) {
      console.error(`Error updating rent ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a rent record
   */
  async deleteRent(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseEndpoint}/${id}`);
    } catch (error) {
      console.error(`Error deleting rent ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get rent records by property ID
   */
  async getRentsByProperty(propertyId: string): Promise<Rent[]> {
    try {
      const backendRents: BackendRent[] = await apiClient.get(
        this.baseEndpoint,
        {
          params: { propertyId },
        },
      );
      return rentTransformer.toFrontendArray(backendRents);
    } catch (error) {
      console.error(`Error fetching rents for property ${propertyId}:`, error);
      throw error;
    }
  }

  /**
   * Get rent records by tenant ID
   */
  async getRentsByTenant(tenantId: string): Promise<Rent[]> {
    try {
      const backendRents: BackendRent[] = await apiClient.get(
        this.baseEndpoint,
        {
          params: { tenantId },
        },
      );
      return rentTransformer.toFrontendArray(backendRents);
    } catch (error) {
      console.error(`Error fetching rents for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Get rent records by status
   */
  async getRentsByStatus(status: string): Promise<Rent[]> {
    try {
      const backendRents: BackendRent[] = await apiClient.get(
        this.baseEndpoint,
        {
          params: { status },
        },
      );
      return rentTransformer.toFrontendArray(backendRents);
    } catch (error) {
      console.error(`Error fetching rents with status ${status}:`, error);
      throw error;
    }
  }

  /**
   * Get overdue rent records
   */
  async getOverdueRents(): Promise<Rent[]> {
    try {
      const backendRents: BackendRent[] = await apiClient.get(
        `${this.baseEndpoint}/overdue`,
      );
      return rentTransformer.toFrontendArray(backendRents);
    } catch (error) {
      console.error("Error fetching overdue rents:", error);
      throw error;
    }
  }

  /**
   * Get rent collection summary for a specific period
   */
  async getRentCollectionSummary(
    startDate?: string,
    endDate?: string,
  ): Promise<{
    totalCollected: number;
    totalPending: number;
    totalOverdue: number;
    collectionRate: number;
  }> {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const summary: {
        totalCollected: number;
        totalPending: number;
        totalOverdue: number;
        collectionRate: number;
      } = await apiClient.get(`${this.baseEndpoint}/summary`, {
        params,
      });
      return summary;
    } catch (error) {
      console.error("Error fetching rent collection summary:", error);
      throw error;
    }
  }

  /**
   * Record rent payment (convenience method)
   */
  async recordPayment(
    tenantId: string,
    propertyId: string,
    amount: number,
    paymentDate?: string,
  ): Promise<Rent> {
    const createData: CreateRentData = {
      tenantId,
      propertyId,
      amount_paid: amount,
      due_date: new Date().toISOString(), // Current date as due date
      status: "paid",
      payment_date: paymentDate || new Date().toISOString(),
    };

    return this.createRent(createData);
  }

  /**
   * Mark rent as paid (update existing rent record)
   */
  async markAsPaid(
    rentId: string,
    amountPaid: number,
    paymentDate?: string,
  ): Promise<Rent> {
    const updateData: UpdateRentData = {
      amount_paid: amountPaid,
      payment_date: paymentDate || new Date().toISOString(),
      status: "paid",
    };

    return this.updateRent(rentId, updateData);
  }

  /**
   * Helper method to create rent from form data
   */
  async createRentFromForm(formData: any): Promise<Rent> {
    const createData = rentTransformer.fromFormDataToCreateRequest(formData);
    return this.createRent(createData);
  }

  /**
   * Helper method to update rent from form data
   */
  async updateRentFromForm(id: string, formData: any): Promise<Rent> {
    const updateData = rentTransformer.fromFormDataToUpdateRequest(formData);
    return this.updateRent(id, updateData);
  }
}

// Export singleton instance
export const rentService = new RentServiceImpl();

// Export types for use in components
export type { Rent, CreateRentData, UpdateRentData };
