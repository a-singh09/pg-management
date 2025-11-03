/**
 * Food data transformer for converting between frontend and backend models
 */

import { BaseTransformer } from "./base-transformer";

// Frontend Food model (from lib/data.ts)
export interface Food {
  id: string;
  pg_id: string;
  date: string;
  meal_type: string;
  menu_items: string[];
  cost_per_person: number;
  total_cost: number;
  people_prepared_for: number;
  people_actually_ate: number;
  prepared_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Backend Food model (expected from API)
export interface BackendFood {
  id: string;
  propertyId: string;
  date: string;
  meal_type: string;
  menu_items: string[];
  cost_per_person: number;
  total_cost: number;
  people_prepared_for: number;
  people_actually_ate: number;
  prepared_by?: string;
  notes?: string;
  ownerId: string;
  created_at?: Date | any; // Firebase Timestamp or Date
  updated_at?: Date | any; // Firebase Timestamp or Date
}

// Food analytics response from backend
export interface FoodAnalytics {
  totalMeals: number;
  averageMealsPerDay: number;
  mostPopularItems: Array<{ item: string; count: number }>;
  dailyTrends: Array<{ date: string; meals: number }>;
}

// Kitchen insights response from backend
export interface KitchenInsights {
  recommendations: string[];
  costOptimization: Array<{ suggestion: string; potentialSaving: number }>;
  popularityTrends: Array<{ item: string; trend: "up" | "down" | "stable" }>;
}

// Create Food data (for POST requests)
export interface CreateFoodData {
  pg_id: string;
  date: string;
  meal_type: string;
  menu_items: string[];
  cost_per_person: number;
  total_cost: number;
  people_prepared_for: number;
  people_actually_ate: number;
  prepared_by?: string;
  notes?: string;
}

// Update Food data (for PUT requests)
export interface UpdateFoodData extends Partial<CreateFoodData> {}

export class FoodTransformer extends BaseTransformer<Food, BackendFood> {
  /**
   * Transform frontend Food to backend Food
   */
  toBackend(food: Food): BackendFood {
    // Validate required fields
    this.validateRequiredFields(food, [
      "pg_id",
      "date",
      "meal_type",
      "menu_items",
      "cost_per_person",
      "total_cost",
      "people_prepared_for",
      "people_actually_ate",
    ]);

    const backendFood: BackendFood = {
      id: food.id,
      propertyId: food.pg_id,
      date: food.date,
      meal_type: food.meal_type,
      menu_items: food.menu_items || [],
      cost_per_person: food.cost_per_person,
      total_cost: food.total_cost,
      people_prepared_for: food.people_prepared_for,
      people_actually_ate: food.people_actually_ate,
      prepared_by: food.prepared_by,
      notes: food.notes,
      ownerId: "", // This will be set by the backend based on JWT token
      created_at: this.isoToDate(food.created_at),
      updated_at: this.isoToDate(food.updated_at),
    };

    return this.cleanObject(backendFood) as BackendFood;
  }

  /**
   * Transform backend Food to frontend Food
   */
  toFrontend(backendFood: BackendFood): Food {
    const food: Food = {
      id: backendFood.id,
      pg_id: backendFood.propertyId,
      date: backendFood.date,
      meal_type: backendFood.meal_type,
      menu_items: backendFood.menu_items || [],
      cost_per_person: backendFood.cost_per_person,
      total_cost: backendFood.total_cost,
      people_prepared_for: backendFood.people_prepared_for,
      people_actually_ate: backendFood.people_actually_ate,
      prepared_by: backendFood.prepared_by,
      notes: backendFood.notes,
      created_at: this.timestampToISO(backendFood.created_at),
      updated_at: this.timestampToISO(backendFood.updated_at),
    };

    return food;
  }

  /**
   * Transform create food data for API request
   */
  toCreateRequest(data: CreateFoodData): any {
    this.validateRequiredFields(data, [
      "pg_id",
      "date",
      "meal_type",
      "menu_items",
      "cost_per_person",
      "total_cost",
      "people_prepared_for",
      "people_actually_ate",
    ]);

    return {
      propertyId: data.pg_id, // Backend expects 'propertyId'
      date: data.date,
      meal_type: data.meal_type,
      menu_items: data.menu_items || [],
      cost_per_person: data.cost_per_person,
      total_cost: data.total_cost,
      people_prepared_for: data.people_prepared_for,
      people_actually_ate: data.people_actually_ate,
      prepared_by: data.prepared_by || "",
      notes: data.notes || "",
    };
  }

  /**
   * Transform update food data for API request
   */
  toUpdateRequest(data: UpdateFoodData): any {
    const updateData: any = {};

    if (data.pg_id !== undefined) updateData.propertyId = data.pg_id;
    if (data.date !== undefined) updateData.date = data.date;
    if (data.meal_type !== undefined) updateData.meal_type = data.meal_type;
    if (data.menu_items !== undefined) updateData.menu_items = data.menu_items;
    if (data.cost_per_person !== undefined)
      updateData.cost_per_person = data.cost_per_person;
    if (data.total_cost !== undefined) updateData.total_cost = data.total_cost;
    if (data.people_prepared_for !== undefined)
      updateData.people_prepared_for = data.people_prepared_for;
    if (data.people_actually_ate !== undefined)
      updateData.people_actually_ate = data.people_actually_ate;
    if (data.prepared_by !== undefined)
      updateData.prepared_by = data.prepared_by;
    if (data.notes !== undefined) updateData.notes = data.notes;

    return this.cleanObject(updateData);
  }

  /**
   * Transform form data to create request
   */
  fromFormDataToCreateRequest(formData: any): CreateFoodData {
    return {
      pg_id: formData.pg_id,
      date: formData.date,
      meal_type: formData.meal_type,
      menu_items: formData.menu_items || [],
      cost_per_person: Number(formData.cost_per_person),
      total_cost: Number(formData.total_cost),
      people_prepared_for: Number(formData.people_prepared_for),
      people_actually_ate: Number(formData.people_actually_ate),
      prepared_by: formData.prepared_by || "",
      notes: formData.notes || "",
    };
  }

  /**
   * Transform form data to update request
   */
  fromFormDataToUpdateRequest(formData: any): UpdateFoodData {
    const updateData: UpdateFoodData = {};

    if (formData.pg_id !== undefined) updateData.pg_id = formData.pg_id;
    if (formData.date !== undefined) updateData.date = formData.date;
    if (formData.meal_type !== undefined)
      updateData.meal_type = formData.meal_type;
    if (formData.menu_items !== undefined)
      updateData.menu_items = formData.menu_items;
    if (formData.cost_per_person !== undefined)
      updateData.cost_per_person = Number(formData.cost_per_person);
    if (formData.total_cost !== undefined)
      updateData.total_cost = Number(formData.total_cost);
    if (formData.people_prepared_for !== undefined)
      updateData.people_prepared_for = Number(formData.people_prepared_for);
    if (formData.people_actually_ate !== undefined)
      updateData.people_actually_ate = Number(formData.people_actually_ate);
    if (formData.prepared_by !== undefined)
      updateData.prepared_by = formData.prepared_by;
    if (formData.notes !== undefined) updateData.notes = formData.notes;

    return updateData;
  }
}

// Export singleton instance
export const foodTransformer = new FoodTransformer();
