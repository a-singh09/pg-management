/**
 * Staff service for handling staff-related API operations
 */

import { apiClient, ApiError } from "../api-client";
import {
  staffTransformer,
  Staff,
  BackendStaff,
  CreateStaffData,
  UpdateStaffData,
} from "../transformers/staff-transformer";

export interface StaffService {
  getStaff(): Promise<Staff[]>;
  getStaffMember(id: string): Promise<Staff>;
  createStaff(data: CreateStaffData): Promise<Staff>;
  updateStaff(id: string, data: UpdateStaffData): Promise<Staff>;
  deleteStaff(id: string): Promise<void>;
}

class StaffServiceImpl implements StaffService {
  private readonly endpoint = "/api/staff";

  /**
   * Get all staff members for the authenticated owner
   */
  async getStaff(): Promise<Staff[]> {
    try {
      const backendStaff: BackendStaff[] = await apiClient.get(this.endpoint);
      return staffTransformer.toFrontendArray(backendStaff);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      throw error;
    }
  }

  /**
   * Get a specific staff member by ID
   */
  async getStaffMember(id: string): Promise<Staff> {
    try {
      const backendStaff: BackendStaff = await apiClient.get(
        `${this.endpoint}/${id}`,
      );
      return staffTransformer.toFrontend(backendStaff);
    } catch (error) {
      console.error(`Failed to fetch staff member ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new staff member
   */
  async createStaff(data: CreateStaffData): Promise<Staff> {
    try {
      const requestData = staffTransformer.toCreateRequest(data);
      const response: { id: string } = await apiClient.post(
        this.endpoint,
        requestData,
      );

      // After creating, fetch the full staff data
      return await this.getStaffMember(response.id);
    } catch (error) {
      console.error("Failed to create staff member:", error);
      throw error;
    }
  }

  /**
   * Update an existing staff member
   */
  async updateStaff(id: string, data: UpdateStaffData): Promise<Staff> {
    try {
      const requestData = staffTransformer.toUpdateRequest(data);
      await apiClient.put(`${this.endpoint}/${id}`, requestData);

      // After updating, fetch the updated staff data
      return await this.getStaffMember(id);
    } catch (error) {
      console.error(`Failed to update staff member ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a staff member
   */
  async deleteStaff(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error(`Failed to delete staff member ${id}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const staffService = new StaffServiceImpl();
export default staffService;
