/**
 * Room transformer for converting between frontend and backend room data models
 */

import { BaseTransformer, FIELD_MAPPINGS } from "./base-transformer";

// Bed interface for individual bed data
export interface Bed {
  bedNumber: number;
  rent: number;
  isOccupied: boolean;
  tenantId: string | null;
  occupiedAt: string | null;
}

// Frontend room model (updated for bed management)
export interface Room {
  id: string;
  pg_id: string;
  room_number: string;
  total_beds: number;
  available_beds: number;
  tenants: string[];
  beds: Bed[];
  default_rent: number;
  created_at: string;
  updated_at: string;
}

// Backend room model (expected from API)
export interface BackendRoom {
  id: string;
  propertyId: string;
  roomNumber: number;
  beds: number;
  availableBeds: number;
  bedsArray: Array<{
    bedNumber: number;
    rent: number;
    isOccupied: boolean;
    tenantId: string | null;
    occupiedAt: Date | null;
  }>;
  defaultRent: number;
  ownerId: string;
  created_at: Date;
  updated_at: Date;
}

// Create room data interface
export interface CreateRoomData {
  propertyId: string;
  beds: number;
  defaultRent: number;
}

// Update room data interface
export interface UpdateRoomData {
  beds?: number;
  defaultRent?: number;
}

// Bed assignment data interface
export interface BedAssignmentData {
  roomId: string;
  bedNumber: number;
  tenantId: string;
  customRent: number;
}

// Bed release data interface
export interface BedReleaseData {
  roomId: string;
  bedNumber: number;
}

// Bed rent update data interface
export interface BedRentUpdateData {
  roomId: string;
  bedNumber: number;
  newRent: number;
}

// Available beds response
export interface AvailableBed {
  bedNumber: number;
  rent: number;
  isOccupied: boolean;
  tenantId: string | null;
  occupiedAt: string | null;
}

class RoomTransformer extends BaseTransformer<Room, BackendRoom> {
  /**
   * Transform backend room data to frontend room model
   */
  toFrontend(backendRoom: BackendRoom): Room {
    const beds: Bed[] = (backendRoom.bedsArray || []).map((bed) => ({
      bedNumber: bed.bedNumber,
      rent: bed.rent,
      isOccupied: bed.isOccupied,
      tenantId: bed.tenantId,
      occupiedAt: bed.occupiedAt ? this.timestampToISO(bed.occupiedAt) : null,
    }));

    const tenants = beds
      .filter((bed) => bed.isOccupied && bed.tenantId)
      .map((bed) => bed.tenantId!);

    return {
      id: backendRoom.id,
      pg_id: backendRoom.propertyId,
      room_number: backendRoom.roomNumber.toString(),
      total_beds: backendRoom.beds,
      available_beds: backendRoom.availableBeds || 0,
      tenants,
      beds,
      default_rent: backendRoom.defaultRent || 0,
      created_at: this.timestampToISO(backendRoom.created_at),
      updated_at: this.timestampToISO(backendRoom.updated_at),
    };
  }

  /**
   * Transform frontend room data to backend room model
   */
  toBackend(frontendRoom: Room): BackendRoom {
    const bedsArray = frontendRoom.beds.map((bed) => ({
      bedNumber: bed.bedNumber,
      rent: bed.rent,
      isOccupied: bed.isOccupied,
      tenantId: bed.tenantId,
      occupiedAt: bed.occupiedAt ? this.isoToDate(bed.occupiedAt) : null,
    }));

    return {
      id: frontendRoom.id,
      propertyId: frontendRoom.pg_id,
      roomNumber: parseInt(frontendRoom.room_number),
      beds: frontendRoom.total_beds,
      availableBeds: frontendRoom.available_beds,
      bedsArray,
      defaultRent: frontendRoom.default_rent,
      ownerId: "", // Will be set by backend
      created_at: this.isoToDate(frontendRoom.created_at),
      updated_at: this.isoToDate(frontendRoom.updated_at),
    };
  }

  /**
   * Transform create room data for API request
   */
  toCreateRequest(data: CreateRoomData): any {
    return this.cleanObject({
      propertyId: data.propertyId,
      beds: data.beds,
      defaultRent: data.defaultRent,
    });
  }

  /**
   * Transform update room data for API request
   */
  toUpdateRequest(data: UpdateRoomData): any {
    return this.cleanObject({
      beds: data.beds,
      defaultRent: data.defaultRent,
    });
  }

  /**
   * Transform bed assignment data for API request
   */
  toBedAssignmentRequest(data: BedAssignmentData): any {
    return {
      roomId: data.roomId,
      bedNumber: data.bedNumber,
      tenantId: data.tenantId,
      customRent: data.customRent,
    };
  }

  /**
   * Transform bed release data for API request
   */
  toBedReleaseRequest(data: BedReleaseData): any {
    return {
      roomId: data.roomId,
      bedNumber: data.bedNumber,
    };
  }

  /**
   * Transform bed rent update data for API request
   */
  toBedRentUpdateRequest(data: BedRentUpdateData): any {
    return {
      roomId: data.roomId,
      bedNumber: data.bedNumber,
      newRent: data.newRent,
    };
  }

  /**
   * Transform available beds response from backend
   */
  transformAvailableBeds(backendData: any[]): AvailableBed[] {
    return backendData.map((bed) => ({
      bedNumber: bed.bedNumber,
      rent: bed.rent,
      isOccupied: bed.isOccupied,
      tenantId: bed.tenantId,
      occupiedAt: bed.occupiedAt ? this.timestampToISO(bed.occupiedAt) : null,
    }));
  }

  /**
   * Helper method to create room from form data
   */
  fromFormDataToCreateRequest(formData: any): CreateRoomData {
    this.validateRequiredFields(formData, [
      "propertyId",
      "beds",
      "defaultRent",
    ]);

    return {
      propertyId: formData.propertyId || formData.pg_id,
      beds: parseInt(formData.beds, 10),
      defaultRent: parseFloat(formData.defaultRent),
    };
  }

  /**
   * Helper method to update room from form data
   */
  fromFormDataToUpdateRequest(formData: any): UpdateRoomData {
    const updateData: UpdateRoomData = {};

    if (formData.beds !== undefined) {
      updateData.beds = parseInt(formData.beds, 10);
    }

    if (formData.defaultRent !== undefined) {
      updateData.defaultRent = parseFloat(formData.defaultRent);
    }

    return updateData;
  }
}

// Export singleton instance
export const roomTransformer = new RoomTransformer();

// Types are already exported as interfaces above
