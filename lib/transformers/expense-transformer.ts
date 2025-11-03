/**
 * Expense data transformer for converting between frontend and backend models
 */

import { BaseTransformer } from "./base-transformer";

// Frontend expense model (matches current lib/data.ts structure)
export interface Expense {
  id: string;
  pg_id: string;
  category: string;
  description: string;
  amount: number;
  expense_date: string;
  payment_method?: string;
  vendor?: string;
  receipt_number?: string;
  created_at: string;
  updated_at: string;
}

// Backend expense model (matches backend API structure)
export interface BackendExpense {
  id: string;
  propertyId: string;
  category: string;
  description: string;
  amount: number;
  expense_date: Date | any; // Firebase Timestamp
  payment_method?: string;
  vendor?: string;
  receipt_number?: string;
  ownerId: string;
  created_at: Date | any; // Firebase Timestamp
  updated_at: Date | any; // Firebase Timestamp
}

// Create expense request data
export interface CreateExpenseData {
  pg_id: string;
  category: string;
  description: string;
  amount: number;
  expense_date?: string;
  payment_method: string;
  vendor?: string;
  receipt_number?: string;
}

// Update expense request data
export interface UpdateExpenseData {
  category?: string;
  description?: string;
  amount?: number;
  expense_date?: string;
  payment_method?: string;
  vendor?: string;
  receipt_number?: string;
}

// Backend create request
export interface BackendCreateExpenseRequest {
  propertyId: string;
  category: string;
  description: string;
  amount: number;
  expense_date?: Date;
  payment_method: string;
  vendor?: string;
  receipt_number?: string;
}

// Backend update request
export interface BackendUpdateExpenseRequest {
  category?: string;
  description?: string;
  amount?: number;
  expense_date?: Date;
  payment_method?: string;
  vendor?: string;
  receipt_number?: string;
}

class ExpenseTransformer extends BaseTransformer<Expense, BackendExpense> {
  /**
   * Convert backend expense to frontend expense
   */
  toFrontend(backendExpense: BackendExpense): Expense {
    return {
      id: backendExpense.id,
      pg_id: backendExpense.propertyId,
      category: backendExpense.category,
      description: backendExpense.description,
      amount: backendExpense.amount,
      expense_date: this.timestampToISO(backendExpense.expense_date),
      payment_method: backendExpense.payment_method,
      vendor: backendExpense.vendor,
      receipt_number: backendExpense.receipt_number,
      created_at: this.timestampToISO(backendExpense.created_at),
      updated_at: this.timestampToISO(backendExpense.updated_at),
    };
  }

  /**
   * Convert frontend expense to backend expense (not typically used)
   */
  toBackend(frontendExpense: Expense): BackendExpense {
    return {
      id: frontendExpense.id,
      propertyId: frontendExpense.pg_id,
      category: frontendExpense.category,
      description: frontendExpense.description,
      amount: frontendExpense.amount,
      expense_date: this.isoToDate(frontendExpense.expense_date),
      payment_method: frontendExpense.payment_method,
      vendor: frontendExpense.vendor,
      receipt_number: frontendExpense.receipt_number,
      ownerId: "", // Will be set by backend
      created_at: this.isoToDate(frontendExpense.created_at),
      updated_at: this.isoToDate(frontendExpense.updated_at),
    };
  }

  /**
   * Convert create expense data to backend request format
   */
  toCreateRequest(data: CreateExpenseData): BackendCreateExpenseRequest {
    return {
      propertyId: data.pg_id,
      category: data.category,
      description: data.description,
      amount: data.amount,
      expense_date: data.expense_date
        ? this.isoToDate(data.expense_date)
        : undefined,
      payment_method: data.payment_method,
      vendor: data.vendor,
      receipt_number: data.receipt_number,
    };
  }

  /**
   * Convert update expense data to backend request format
   */
  toUpdateRequest(data: UpdateExpenseData): BackendUpdateExpenseRequest {
    const request: BackendUpdateExpenseRequest = {};

    if (data.category !== undefined) request.category = data.category;
    if (data.description !== undefined) request.description = data.description;
    if (data.amount !== undefined) request.amount = data.amount;
    if (data.expense_date !== undefined) {
      request.expense_date = this.isoToDate(data.expense_date);
    }
    if (data.payment_method !== undefined)
      request.payment_method = data.payment_method;
    if (data.vendor !== undefined) request.vendor = data.vendor;
    if (data.receipt_number !== undefined)
      request.receipt_number = data.receipt_number;

    return request;
  }

  /**
   * Convert array of backend expenses to frontend expenses
   */
  toFrontendArray(backendExpenses: BackendExpense[]): Expense[] {
    return backendExpenses.map((expense) => this.toFrontend(expense));
  }
}

// Export singleton instance
export const expenseTransformer = new ExpenseTransformer();
export default expenseTransformer;
