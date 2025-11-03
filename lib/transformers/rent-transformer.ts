/**
 * Rent data transformer for converting between frontend and backend models
 */

import { BaseTransformer, FIELD_MAPPINGS } from "./base-transformer";

// Frontend Rent model (from lib/data.ts)
export interface Rent {
  id: string;
  tenant_id: string;
  pg_id: string;
  amount_paid: number;
  payment_date: string | null;
  due_date: string;
  payment_method: string;
  status: string;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
}

// Backend Rent model (expected from API)
export interface BackendRent {
  id: string;
  tenantId: string;
  propertyId: string;
  amount_paid: number;
  payment_date: Date | any | null; // Firebase Timestamp or Date
  due_date: Date | any; // Firebase Timestamp or Date
  payment_method: string;
  status: string;
  receipt_url?: string | null;
  ownerId: string;
  created_at: Date | any; // Firebase Timestamp or Date
  updated_at: Date | any; // Firebase Timestamp or Date
}

// Create Rent data (for POST requests)
export interface CreateRentData {
  tenantId: string;
  propertyId: string;
  amount_paid: number;
  due_date: string; // ISO string
  payment_method: string;
  status?: string;
  payment_date?: string | null; // ISO string
  receipt_url?: string | null;
}

// Update Rent data (for PUT requests)
export interface UpdateRentData extends Partial<CreateRentData> {
  payment_date?: string | null; // ISO string
}

export class RentTransformer extends BaseTransformer<Rent, BackendRent> {
  /**
   * Transform frontend Rent to backend Rent
   */
  toBackend(rent: Rent): BackendRent {
    // Validate required fields
    this.validateRequiredFields(rent, [
      "tenant_id",
      "pg_id",
      "amount_paid",
      "due_date",
      "payment_method",
      "status",
    ]);

    const backendRent: BackendRent = {
      id: rent.id,
      tenantId: rent.tenant_id,
      propertyId: rent.pg_id,
      amount_paid: rent.amount_paid,
      payment_date: rent.payment_date
        ? this.isoToDate(rent.payment_date)
        : null,
      due_date: this.isoToDate(rent.due_date),
      payment_method: rent.payment_method,
      status: rent.status,
      receipt_url: rent.receipt_url,
      ownerId: "", // This will be set by the backend based on JWT token
      created_at: this.isoToDate(rent.created_at),
      updated_at: this.isoToDate(rent.updated_at),
    };

    return this.cleanObject(backendRent) as BackendRent;
  }

  /**
   * Transform backend Rent to frontend Rent
   */
  toFrontend(backendRent: BackendRent): Rent {
    const rent: Rent = {
      id: backendRent.id,
      tenant_id: backendRent.tenantId,
      pg_id: backendRent.propertyId,
      amount_paid: backendRent.amount_paid,
      payment_date: backendRent.payment_date
        ? this.timestampToISO(backendRent.payment_date)
        : null,
      due_date: this.timestampToISO(backendRent.due_date),
      payment_method: backendRent.payment_method,
      status: backendRent.status,
      receipt_url: backendRent.receipt_url || null,
      created_at: this.timestampToISO(backendRent.created_at),
      updated_at: this.timestampToISO(backendRent.updated_at),
    };

    return rent;
  }

  /**
   * Transform create rent data for API request
   */
  toCreateRequest(
    data: CreateRentData,
  ): Omit<BackendRent, "id" | "ownerId" | "created_at" | "updated_at"> {
    this.validateRequiredFields(data, [
      "tenantId",
      "propertyId",
      "amount_paid",
      "due_date",
      "payment_method",
    ]);

    return {
      tenantId: data.tenantId,
      propertyId: data.propertyId,
      amount_paid: data.amount_paid,
      payment_date: data.payment_date
        ? this.isoToDate(data.payment_date)
        : null,
      due_date: this.isoToDate(data.due_date),
      payment_method: data.payment_method,
      status: data.status || "pending",
      receipt_url: data.receipt_url || null,
    };
  }

  /**
   * Transform update rent data for API request
   */
  toUpdateRequest(
    data: UpdateRentData,
  ): Partial<
    Omit<BackendRent, "id" | "ownerId" | "created_at" | "updated_at">
  > {
    const updateData: any = {};

    if (data.tenantId !== undefined) updateData.tenantId = data.tenantId;
    if (data.propertyId !== undefined) updateData.propertyId = data.propertyId;
    if (data.amount_paid !== undefined)
      updateData.amount_paid = data.amount_paid;
    if (data.payment_date !== undefined) {
      updateData.payment_date = data.payment_date
        ? this.isoToDate(data.payment_date)
        : null;
    }
    if (data.due_date !== undefined)
      updateData.due_date = this.isoToDate(data.due_date);
    if (data.payment_method !== undefined)
      updateData.payment_method = data.payment_method;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.receipt_url !== undefined)
      updateData.receipt_url = data.receipt_url;

    return this.cleanObject(updateData);
  }

  /**
   * Transform frontend form data to create request format
   */
  fromFormDataToCreateRequest(formData: any): CreateRentData {
    return {
      tenantId: formData.tenant_id,
      propertyId: formData.pg_id,
      amount_paid: Number(formData.amount_paid),
      due_date: new Date(formData.due_date).toISOString(),
      payment_method: formData.payment_method || "cash",
      status: formData.status || "pending",
      payment_date: formData.payment_date
        ? new Date(formData.payment_date).toISOString()
        : null,
      receipt_url: formData.receipt_url || null,
    };
  }

  /**
   * Transform frontend form data to update request format
   */
  fromFormDataToUpdateRequest(formData: any): UpdateRentData {
    const updateData: UpdateRentData = {};

    if (formData.tenant_id) updateData.tenantId = formData.tenant_id;
    if (formData.pg_id) updateData.propertyId = formData.pg_id;
    if (formData.amount_paid)
      updateData.amount_paid = Number(formData.amount_paid);
    if (formData.payment_date !== undefined) {
      updateData.payment_date = formData.payment_date
        ? new Date(formData.payment_date).toISOString()
        : null;
    }
    if (formData.due_date)
      updateData.due_date = new Date(formData.due_date).toISOString();
    if (formData.payment_method)
      updateData.payment_method = formData.payment_method;
    if (formData.status) updateData.status = formData.status;
    if (formData.receipt_url !== undefined)
      updateData.receipt_url = formData.receipt_url;

    return updateData;
  }
}

// Export singleton instance
export const rentTransformer = new RentTransformer();
