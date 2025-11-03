/**
 * Booking service for handling booking-related API operations
 */

import { apiClient, ApiError } from "../api-client";
import {
  bookingTransformer,
  Booking,
  BackendBooking,
  CreateBookingData,
  UpdateBookingData,
  BookingStats,
} from "../transformers/booking-transformer";

export interface BookingService {
  getBookings(): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking>;
  createBooking(data: CreateBookingData): Promise<Booking>;
  updateBooking(id: string, data: UpdateBookingData): Promise<Booking>;
  deleteBooking(id: string): Promise<void>;
  getBookingStats(): Promise<BookingStats>;
  searchBookings(searchTerm: string): Promise<Booking[]>;
  filterBookings(filters: any): Promise<Booking[]>;
}

class BookingServiceImpl implements BookingService {
  private readonly baseEndpoint = "/api/bookings";

  /**
   * Get all bookings for the authenticated owner
   */
  async getBookings(): Promise<Booking[]> {
    try {
      const backendBookings: BackendBooking[] = await apiClient.get(
        this.baseEndpoint,
      );
      return bookingTransformer.toFrontendArray(backendBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      throw error;
    }
  }

  /**
   * Get a specific booking by ID
   */
  async getBooking(id: string): Promise<Booking> {
    try {
      const backendBooking: BackendBooking = await apiClient.get(
        `${this.baseEndpoint}/${id}`,
      );
      return bookingTransformer.toFrontend(backendBooking);
    } catch (error) {
      console.error(`Error fetching booking ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new booking
   */
  async createBooking(data: CreateBookingData): Promise<Booking> {
    try {
      const requestData = bookingTransformer.toCreateRequest(data);
      const backendBooking: BackendBooking = await apiClient.post(
        this.baseEndpoint,
        requestData,
      );
      return bookingTransformer.toFrontend(backendBooking);
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  }

  /**
   * Update an existing booking
   */
  async updateBooking(id: string, data: UpdateBookingData): Promise<Booking> {
    try {
      const requestData = bookingTransformer.toUpdateRequest(data);
      const backendBooking: BackendBooking = await apiClient.put(
        `${this.baseEndpoint}/${id}`,
        requestData,
      );
      return bookingTransformer.toFrontend(backendBooking);
    } catch (error) {
      console.error(`Error updating booking ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a booking
   */
  async deleteBooking(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseEndpoint}/${id}`);
    } catch (error) {
      console.error(`Error deleting booking ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get booking statistics summary
   */
  async getBookingStats(): Promise<BookingStats> {
    try {
      const stats: BookingStats = await apiClient.get(
        `${this.baseEndpoint}/stats/summary`,
      );
      return stats;
    } catch (error) {
      console.error("Error fetching booking stats:", error);
      throw error;
    }
  }

  /**
   * Search bookings by term
   */
  async searchBookings(searchTerm: string): Promise<Booking[]> {
    try {
      const backendBookings: BackendBooking[] = await apiClient.get(
        `${this.baseEndpoint}/search/term`,
        {
          params: { q: searchTerm },
        },
      );
      return bookingTransformer.toFrontendArray(backendBookings);
    } catch (error) {
      console.error(`Error searching bookings with term ${searchTerm}:`, error);
      throw error;
    }
  }

  /**
   * Filter bookings with various criteria
   */
  async filterBookings(filters: any): Promise<Booking[]> {
    try {
      const backendBookings: BackendBooking[] = await apiClient.get(
        `${this.baseEndpoint}/filter/all`,
        {
          params: filters,
        },
      );
      return bookingTransformer.toFrontendArray(backendBookings);
    } catch (error) {
      console.error("Error filtering bookings:", error);
      throw error;
    }
  }

  /**
   * Get bookings by property ID
   */
  async getBookingsByProperty(propertyId: string): Promise<Booking[]> {
    try {
      const backendBookings: BackendBooking[] = await apiClient.get(
        this.baseEndpoint,
        {
          params: { propertyId },
        },
      );
      return bookingTransformer.toFrontendArray(backendBookings);
    } catch (error) {
      console.error(
        `Error fetching bookings for property ${propertyId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get bookings by status
   */
  async getBookingsByStatus(status: string): Promise<Booking[]> {
    try {
      const backendBookings: BackendBooking[] = await apiClient.get(
        this.baseEndpoint,
        {
          params: { status },
        },
      );
      return bookingTransformer.toFrontendArray(backendBookings);
    } catch (error) {
      console.error(`Error fetching bookings with status ${status}:`, error);
      throw error;
    }
  }

  /**
   * Get upcoming check-ins (next 7 days)
   */
  async getUpcomingCheckIns(): Promise<Booking[]> {
    try {
      const today = new Date();
      const sevenDaysLater = new Date(today);
      sevenDaysLater.setDate(today.getDate() + 7);

      const backendBookings: BackendBooking[] = await apiClient.get(
        this.baseEndpoint,
        {
          params: {
            check_in_from: today.toISOString().split("T")[0],
            check_in_to: sevenDaysLater.toISOString().split("T")[0],
            status: "confirmed,pending",
          },
        },
      );
      return bookingTransformer.toFrontendArray(backendBookings);
    } catch (error) {
      console.error("Error fetching upcoming check-ins:", error);
      throw error;
    }
  }

  /**
   * Helper method to create booking from form data
   */
  async createBookingFromForm(formData: any): Promise<Booking> {
    const createData = bookingTransformer.fromFormDataToCreateRequest(formData);
    return this.createBooking(createData);
  }

  /**
   * Helper method to update booking from form data
   */
  async updateBookingFromForm(id: string, formData: any): Promise<Booking> {
    const updateData = bookingTransformer.fromFormDataToUpdateRequest(formData);
    return this.updateBooking(id, updateData);
  }
}

// Export singleton instance
export const bookingService = new BookingServiceImpl();

// Export types for use in components
export type { Booking, CreateBookingData, UpdateBookingData, BookingStats };
