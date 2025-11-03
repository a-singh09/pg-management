/**
 * Expense service for handling expense-related API operations
 */

import { apiClient, ApiError } from "../api-client";
import {
  expenseTransformer,
  Expense,
  BackendExpense,
  CreateExpenseData,
  UpdateExpenseData,
} from "../transformers/expense-transformer";

export interface ExpenseService {
  getExpenses(): Promise<Expense[]>;
  getExpense(id: string): Promise<Expense>;
  createExpense(data: CreateExpenseData): Promise<Expense>;
  updateExpense(id: string, data: UpdateExpenseData): Promise<Expense>;
  deleteExpense(id: string): Promise<void>;
}

class ExpenseServiceImpl implements ExpenseService {
  private readonly endpoint = "/api/expenses";

  /**
   * Get all expenses for the authenticated owner
   */
  async getExpenses(): Promise<Expense[]> {
    try {
      const backendExpenses: BackendExpense[] = await apiClient.get(
        this.endpoint,
      );
      return expenseTransformer.toFrontendArray(backendExpenses);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
      throw error;
    }
  }

  /**
   * Get a specific expense by ID
   */
  async getExpense(id: string): Promise<Expense> {
    try {
      const backendExpense: BackendExpense = await apiClient.get(
        `${this.endpoint}/${id}`,
      );
      return expenseTransformer.toFrontend(backendExpense);
    } catch (error) {
      console.error(`Failed to fetch expense ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new expense
   */
  async createExpense(data: CreateExpenseData): Promise<Expense> {
    try {
      const requestData = expenseTransformer.toCreateRequest(data);
      const response: { id: string } = await apiClient.post(
        this.endpoint,
        requestData,
      );

      // After creating, fetch the full expense data
      return await this.getExpense(response.id);
    } catch (error) {
      console.error("Failed to create expense:", error);
      throw error;
    }
  }

  /**
   * Update an existing expense
   */
  async updateExpense(id: string, data: UpdateExpenseData): Promise<Expense> {
    try {
      const requestData = expenseTransformer.toUpdateRequest(data);
      await apiClient.put(`${this.endpoint}/${id}`, requestData);

      // After updating, fetch the updated expense data
      return await this.getExpense(id);
    } catch (error) {
      console.error(`Failed to update expense ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an expense
   */
  async deleteExpense(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error(`Failed to delete expense ${id}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const expenseService = new ExpenseServiceImpl();
export default expenseService;
