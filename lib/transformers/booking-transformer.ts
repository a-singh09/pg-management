/**
 * Booking data transformer for converting between frontend and backend models
 */

import { BaseTransformer } from "./base-transformer";

// Frontend Booking model (from lib/data.ts)
export interface Booking {
  id: string;
  pg_id: string;
  tenant_name: string;
  phone: string;
  room_type: string;
  booking_date: string;
  check_in_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Backend Booking model (expected from API)
export interface BackendBooking {
  id: string;
  propertyId: string;
  tenant_name: string;
  phone: string;
  room_type: string;
  booking_date: Date | any; // Firebase Timestamp or Date
  check_in_date: Date | any; // Firebase Timestamp or Date
  status: string;
  ownerId: string;
  created_at?: Date | any; // Firebase Timestamp or Date
  updated_at?: Date | any; // Firebase Timestamp or Date
}

// Create Booking data (for POST requests)
export interface CreateBookingData {
  propertyId: string;
  tenantId: string;
  roomId: string;
  booking_date: string;
  checkIn_date: string;
  rent_amount: number;
  deposit_amount: number;
  status?: string;
}

// Update Booking data (for PUT requests)
export interface UpdateBookingData extends Partial<CreateBookingData> {}

// Booking statistics response
export interface BookingStats {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  upcoming_checkins: number;
}

export class BookingTransformer extends BaseTransformer<
  Booking,
  BackendBooking
> {
  /**
   * Transform frontend Booking to backend Booking
   */
  toBackend(booking: Booking): BackendBooking {
    // Validate required fields
    this.validateRequiredFields(booking, [
      "pg_id",
      "tenant_name",
      "phone",
      "room_type",
      "booking_date",
      "check_in_date",
      "status",
    ]);

    const backendBooking: BackendBooking = {
      id: booking.id,
      propertyId: booking.pg_id,
      tenant_name: booking.tenant_name,
      phone: booking.phone,
      room_type: booking.room_type,
      booking_date: this.isoToDate(booking.booking_date),
      check_in_date: this.isoToDate(booking.check_in_date),
      status: booking.status,
      ownerId: "", // This will be set by the backend based on JWT token
      created_at: this.isoToDate(booking.created_at),
      updated_at: this.isoToDate(booking.updated_at),
    };

    return this.cleanObject(backendBooking) as BackendBooking;
  }

  /**
   * Transform backend Booking to frontend Booking
   */
  toFrontend(backendBooking: BackendBooking): Booking {
    const booking: Booking = {
      id: backendBooking.id,
      pg_id: backendBooking.propertyId,
      tenant_name: backendBooking.tenant_name,
      phone: backendBooking.phone,
      room_type: backendBooking.room_type,
      booking_date: this.timestampToISO(backendBooking.booking_date),
      check_in_date: this.timestampToISO(backendBooking.check_in_date),
      status: backendBooking.status,
      created_at: this.timestampToISO(backendBooking.created_at),
      updated_at: this.timestampToISO(backendBooking.updated_at),
    };

    return booking;
  }

  /**
   * Transform create booking data for API request
   */
  toCreateRequest(data: CreateBookingData): any {
    this.validateRequiredFields(data, [
      "propertyId",
      "tenantId",
      "roomId",
      "booking_date",
      "checkIn_date",
      "rent_amount",
      "deposit_amount",
    ]);

    return {
      propertyId: data.propertyId,
      tenantId: data.tenantId,
      roomId: data.roomId,
      booking_date: data.booking_date,
      checkIn_date: data.checkIn_date,
      rent_amount: data.rent_amount,
      deposit_amount: data.deposit_amount,
      status: data.status || "pending",
    };
  }

  /**
   * Transform update booking data for API request
   */
  toUpdateRequest(data: UpdateBookingData): any {
    const updateData: any = {};

    if (data.propertyId !== undefined) updateData.propertyId = data.propertyId;
    if (data.tenant_name !== undefined)
      updateData.tenant_name = data.tenant_name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.room_type !== undefined) updateData.room_type = data.room_type;
    if (data.booking_date !== undefined)
      updateData.booking_date = data.booking_date;
    if (data.check_in_date !== undefined)
      updateData.check_in_date = data.check_in_date;
    if (data.status !== undefined) updateData.status = data.status;

    return this.cleanObject(updateData);
  }

  /**
   * Transform form data to create request
   */
  fromFormDataToCreateRequest(formData: any): CreateBookingData {
    return {
      propertyId: formData.pg_id,
      tenantId: formData.tenant_id,
      roomId: formData.room_id,
      booking_date: formData.booking_date,
      checkIn_date: formData.check_in_date,
      rent_amount: Number(formData.rent_amount),
      deposit_amount: Number(formData.deposit_amount),
      status: formData.status || "pending",
    };
  }

  /**
   * Transform form data to update request
   */
  fromFormDataToUpdateRequest(formData: any): UpdateBookingData {
    const updateData: UpdateBookingData = {};

    if (formData.pg_id !== undefined) updateData.propertyId = formData.pg_id;
    if (formData.tenant_id !== undefined)
      updateData.tenantId = formData.tenant_id;
    if (formData.room_id !== undefined) updateData.roomId = formData.room_id;
    if (formData.booking_date !== undefined)
      updateData.booking_date = formData.booking_date;
    if (formData.check_in_date !== undefined)
      updateData.checkIn_date = formData.check_in_date;
    if (formData.rent_amount !== undefined)
      updateData.rent_amount = Number(formData.rent_amount);
    if (formData.deposit_amount !== undefined)
      updateData.deposit_amount = Number(formData.deposit_amount);
    if (formData.status !== undefined) updateData.status = formData.status;

    return updateData;
  }
}

// Export singleton instance
export const bookingTransformer = new BookingTransformer();
