/**
 * Food service for handling food-related API operations
 */

import { apiClient, ApiError } from "../api-client";
import {
  foodTransformer,
  Food,
  BackendFood,
  CreateFoodData,
  UpdateFoodData,
  FoodAnalytics,
  KitchenInsights,
} from "../transformers/food-transformer";

export interface FoodService {
  getFoodEntries(propertyId?: string): Promise<Food[]>;
  getFoodEntry(id: string): Promise<Food>;
  createFoodEntry(data: CreateFoodData): Promise<Food>;
  updateFoodEntry(id: string, data: UpdateFoodData): Promise<Food>;
  deleteFoodEntry(id: string): Promise<void>;
  getFoodAnalytics(propertyId?: string): Promise<FoodAnalytics>;
  getFoodByDate(date: string, propertyId?: string): Promise<Food[]>;
  getKitchenInsights(propertyId?: string): Promise<KitchenInsights>;
}

class FoodServiceImpl implements FoodService {
  private readonly endpoint = "/api/food";

  /**
   * Get all food entries, optionally filtered by property
   */
  async getFoodEntries(propertyId?: string): Promise<Food[]> {
    try {
      const params = propertyId ? { propertyId } : undefined;
      const backendFoodEntries: BackendFood[] = await apiClient.get(
        this.endpoint,
        { params },
      );
      return foodTransformer.toFrontendArray(backendFoodEntries);
    } catch (error) {
      console.error("Failed to fetch food entries:", error);
      throw error;
    }
  }

  /**
   * Get a specific food entry by ID
   */
  async getFoodEntry(id: string): Promise<Food> {
    try {
      const backendFood: BackendFood = await apiClient.get(
        `${this.endpoint}/${id}`,
      );
      return foodTransformer.toFrontend(backendFood);
    } catch (error) {
      console.error(`Failed to fetch food entry ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new food entry
   */
  async createFoodEntry(data: CreateFoodData): Promise<Food> {
    try {
      const requestData = foodTransformer.toCreateRequest(data);
      const backendFood: BackendFood = await apiClient.post(
        this.endpoint,
        requestData,
      );
      return foodTransformer.toFrontend(backendFood);
    } catch (error) {
      console.error("Failed to create food entry:", error);
      throw error;
    }
  }

  /**
   * Update an existing food entry
   */
  async updateFoodEntry(id: string, data: UpdateFoodData): Promise<Food> {
    try {
      const requestData = foodTransformer.toUpdateRequest(data);
      const backendFood: BackendFood = await apiClient.put(
        `${this.endpoint}/${id}`,
        requestData,
      );
      return foodTransformer.toFrontend(backendFood);
    } catch (error) {
      console.error(`Failed to update food entry ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a food entry
   */
  async deleteFoodEntry(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error(`Failed to delete food entry ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get food analytics data
   */
  async getFoodAnalytics(propertyId?: string): Promise<FoodAnalytics> {
    try {
      const params = propertyId ? { propertyId } : undefined;
      const analytics: FoodAnalytics = await apiClient.get(
        `${this.endpoint}/analytics`,
        { params },
      );
      return analytics;
    } catch (error) {
      console.error("Failed to fetch food analytics:", error);
      throw error;
    }
  }

  /**
   * Get food entries by date
   */
  async getFoodByDate(date: string, propertyId?: string): Promise<Food[]> {
    try {
      const params: any = { date };
      if (propertyId) params.propertyId = propertyId;

      const backendFoodEntries: BackendFood[] = await apiClient.get(
        `${this.endpoint}/by-date`,
        { params },
      );
      return foodTransformer.toFrontendArray(backendFoodEntries);
    } catch (error) {
      console.error(`Failed to fetch food entries for date ${date}:`, error);
      throw error;
    }
  }

  /**
   * Get kitchen optimization insights
   */
  async getKitchenInsights(propertyId?: string): Promise<KitchenInsights> {
    try {
      const params = propertyId ? { propertyId } : undefined;
      const insights: KitchenInsights = await apiClient.get(
        `${this.endpoint}/insights`,
        { params },
      );
      return insights;
    } catch (error) {
      console.error("Failed to fetch kitchen insights:", error);
      throw error;
    }
  }

  /**
   * Helper method to create food entry from form data
   */
  async createFoodEntryFromForm(formData: any): Promise<Food> {
    const createData = foodTransformer.fromFormDataToCreateRequest(formData);
    return this.createFoodEntry(createData);
  }

  /**
   * Helper method to update food entry from form data
   */
  async updateFoodEntryFromForm(id: string, formData: any): Promise<Food> {
    const updateData = foodTransformer.fromFormDataToUpdateRequest(formData);
    return this.updateFoodEntry(id, updateData);
  }
}

// Export singleton instance
export const foodService = new FoodServiceImpl();
export default foodService;
