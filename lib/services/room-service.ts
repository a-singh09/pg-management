/**
 * Room service for handling room and bed management API operations
 */

import { apiClient, ApiError } from "../api-client";
import {
  roomTransformer,
  Room,
  BackendRoom,
  CreateRoomData,
  UpdateRoomData,
  BedAssignmentData,
  BedReleaseData,
  BedRentUpdateData,
  AvailableBed,
} from "../transformers/room-transformer";

export interface RoomService {
  // Room CRUD operations
  getRooms(propertyId?: string): Promise<Room[]>;
  getRoom(id: string): Promise<Room>;
  createRoom(data: CreateRoomData): Promise<Room>;
  updateRoom(id: string, data: UpdateRoomData): Promise<Room>;
  deleteRoom(id: string): Promise<void>;

  // Bed management operations
  assignBed(data: BedAssignmentData): Promise<void>;
  releaseBed(data: BedReleaseData): Promise<void>;
  updateBedRent(data: BedRentUpdateData): Promise<void>;
  getAvailableBeds(roomId: string): Promise<AvailableBed[]>;
  getRoomsByProperty(propertyId: string): Promise<Room[]>;
}

class RoomServiceImpl implements RoomService {
  private readonly baseEndpoint = "/api/rooms";

  /**
   * Get all rooms, optionally filtered by property
   */
  async getRooms(propertyId?: string): Promise<Room[]> {
    try {
      const params = propertyId ? { propertyId } : {};
      const backendRooms: BackendRoom[] = await apiClient.get(
        this.baseEndpoint,
        {
          params,
        },
      );
      return roomTransformer.toFrontendArray(backendRooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      throw error;
    }
  }

  /**
   * Get a specific room by ID
   */
  async getRoom(id: string): Promise<Room> {
    try {
      const backendRoom: BackendRoom = await apiClient.get(
        `${this.baseEndpoint}/${id}`,
      );
      return roomTransformer.toFrontend(backendRoom);
    } catch (error) {
      console.error(`Error fetching room ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new room
   */
  async createRoom(data: CreateRoomData): Promise<Room> {
    try {
      const requestData = roomTransformer.toCreateRequest(data);
      const backendRoom: BackendRoom = await apiClient.post(
        this.baseEndpoint,
        requestData,
      );
      return roomTransformer.toFrontend(backendRoom);
    } catch (error) {
      console.error("Error creating room:", error);
      throw error;
    }
  }

  /**
   * Update an existing room
   */
  async updateRoom(id: string, data: UpdateRoomData): Promise<Room> {
    try {
      const requestData = roomTransformer.toUpdateRequest(data);
      const backendRoom: BackendRoom = await apiClient.put(
        `${this.baseEndpoint}/${id}`,
        requestData,
      );
      return roomTransformer.toFrontend(backendRoom);
    } catch (error) {
      console.error(`Error updating room ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a room
   */
  async deleteRoom(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseEndpoint}/${id}`);
    } catch (error) {
      console.error(`Error deleting room ${id}:`, error);
      throw error;
    }
  }

  /**
   * Assign a bed to a tenant
   */
  async assignBed(data: BedAssignmentData): Promise<void> {
    try {
      const requestData = roomTransformer.toBedAssignmentRequest(data);
      await apiClient.post(`${this.baseEndpoint}/beds/assign`, requestData);
    } catch (error) {
      console.error("Error assigning bed:", error);
      throw error;
    }
  }

  /**
   * Release a bed from a tenant
   */
  async releaseBed(data: BedReleaseData): Promise<void> {
    try {
      const requestData = roomTransformer.toBedReleaseRequest(data);
      await apiClient.post(`${this.baseEndpoint}/beds/release`, requestData);
    } catch (error) {
      console.error("Error releasing bed:", error);
      throw error;
    }
  }

  /**
   * Get available beds for a specific room
   */
  async getAvailableBeds(roomId: string): Promise<AvailableBed[]> {
    try {
      const response = await apiClient.get(
        `${this.baseEndpoint}/${roomId}/beds/available`,
      );
      return roomTransformer.transformAvailableBeds(response);
    } catch (error) {
      console.error(`Error fetching available beds for room ${roomId}:`, error);
      throw error;
    }
  }

  /**
   * Update bed rent
   */
  async updateBedRent(data: BedRentUpdateData): Promise<void> {
    try {
      const requestData = roomTransformer.toBedRentUpdateRequest(data);
      await apiClient.put(`${this.baseEndpoint}/beds/rent`, requestData);
    } catch (error) {
      console.error("Error updating bed rent:", error);
      throw error;
    }
  }

  /**
   * Get rooms by property ID (convenience method)
   */
  async getRoomsByProperty(propertyId: string): Promise<Room[]> {
    return this.getRooms(propertyId);
  }

  /**
   * Helper method to create room from form data
   */
  async createRoomFromForm(formData: any): Promise<Room> {
    const createData = roomTransformer.fromFormDataToCreateRequest(formData);
    return this.createRoom(createData);
  }

  /**
   * Helper method to update room from form data
   */
  async updateRoomFromForm(id: string, formData: any): Promise<Room> {
    const updateData = roomTransformer.fromFormDataToUpdateRequest(formData);
    return this.updateRoom(id, updateData);
  }

  /**
   * Get room occupancy statistics
   */
  async getRoomOccupancyStats(propertyId?: string): Promise<{
    totalRooms: number;
    totalBeds: number;
    occupiedBeds: number;
    availableBeds: number;
    occupancyRate: number;
  }> {
    try {
      const rooms = await this.getRooms(propertyId);

      const totalRooms = rooms.length;
      const totalBeds = rooms.reduce((sum, room) => sum + room.total_beds, 0);
      const availableBeds = rooms.reduce(
        (sum, room) => sum + room.available_beds,
        0,
      );
      const occupiedBeds = totalBeds - availableBeds;
      const occupancyRate =
        totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;

      return {
        totalRooms,
        totalBeds,
        occupiedBeds,
        availableBeds,
        occupancyRate: Math.round(occupancyRate * 100) / 100, // Round to 2 decimal places
      };
    } catch (error) {
      console.error("Error calculating room occupancy stats:", error);
      throw error;
    }
  }

  /**
   * Search rooms by room number or property name
   */
  async searchRooms(searchTerm: string, propertyId?: string): Promise<Room[]> {
    try {
      const rooms = await this.getRooms(propertyId);

      if (!searchTerm.trim()) {
        return rooms;
      }

      const searchLower = searchTerm.toLowerCase();
      return rooms.filter((room) =>
        room.room_number.toLowerCase().includes(searchLower),
      );
    } catch (error) {
      console.error(`Error searching rooms with term ${searchTerm}:`, error);
      throw error;
    }
  }

  /**
   * Filter rooms by availability status
   */
  async filterRoomsByStatus(
    status: "available" | "occupied" | "all",
    propertyId?: string,
  ): Promise<Room[]> {
    try {
      const rooms = await this.getRooms(propertyId);

      if (status === "all") {
        return rooms;
      }

      return rooms.filter((room) => {
        if (status === "available") {
          return room.available_beds > 0;
        } else if (status === "occupied") {
          return room.available_beds < room.total_beds;
        }
        return true;
      });
    } catch (error) {
      console.error(`Error filtering rooms by status ${status}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const roomService = new RoomServiceImpl();

// Export types for use in components
export type {
  Room,
  CreateRoomData,
  UpdateRoomData,
  BedAssignmentData,
  BedReleaseData,
  BedRentUpdateData,
  AvailableBed,
};

export default roomService;
