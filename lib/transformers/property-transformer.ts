/**
 * Property data transformer for converting between frontend and backend models
 */

import { BaseTransformer, FIELD_MAPPINGS } from "./base-transformer";

// Frontend Property model (from lib/data.ts)
export interface Property {
  id: string;
  name: string;
  location: string;
  owner: string;
  contact: string;
  total_rooms: number;
  total_beds: number;
  available_beds: number;
  rent_per_bed: number;
  type: string;
  facilities: string[];
  staff: string[];
  created_at: string;
  updated_at: string;
}

// Backend Property model (expected from API)
export interface BackendProperty {
  id: string;
  propertyName: string;
  location: string;
  ownerName: string;
  contactNumber: string;
  totalRooms: number;
  totalBeds: number;
  availableBeds?: number;
  rentPerBed: number;
  facilities: string[];
  type: string;
  ownerId: string;
  created_at?: Date | any; // Firebase Timestamp or Date
  updated_at?: Date | any; // Firebase Timestamp or Date
}

// Backend create response
export interface BackendCreateResponse {
  propertyId: string;
  message: string;
}

// Create Property data (for POST requests)
export interface CreatePropertyData {
  name: string;
  location: string;
  owner: string;
  contact: string;
  total_rooms: number;
  total_beds: number;
  rent_per_bed: number;
  type: string;
  facilities: string[];
}

// Update Property data (for PUT requests)
export interface UpdatePropertyData extends Partial<CreatePropertyData> {}

export class PropertyTransformer extends BaseTransformer<
  Property,
  BackendProperty
> {
  /**
   * Transform frontend Property to backend Property
   */
  toBackend(property: Property): BackendProperty {
    // Validate required fields
    this.validateRequiredFields(property, [
      "name",
      "location",
      "owner",
      "contact",
      "total_rooms",
      "total_beds",
      "rent_per_bed",
      "type",
    ]);

    const backendProperty: BackendProperty = {
      id: property.id,
      propertyName: property.name,
      location: property.location,
      ownerName: property.owner,
      contactNumber: property.contact,
      totalRooms: property.total_rooms,
      totalBeds: property.total_beds,
      availableBeds: property.available_beds,
      rentPerBed: property.rent_per_bed,
      facilities: property.facilities || [],
      type: property.type,
      ownerId: "", // This will be set by the backend based on JWT token
      created_at: this.isoToDate(property.created_at),
      updated_at: this.isoToDate(property.updated_at),
    };

    return this.cleanObject(backendProperty) as BackendProperty;
  }

  /**
   * Transform backend Property to frontend Property
   */
  toFrontend(backendProperty: BackendProperty): Property {
    const property: Property = {
      id: backendProperty.id,
      name: backendProperty.propertyName,
      location: backendProperty.location,
      owner: backendProperty.ownerName,
      contact: backendProperty.contactNumber,
      total_rooms: backendProperty.totalRooms,
      total_beds: backendProperty.totalBeds,
      available_beds: backendProperty.availableBeds || 0,
      rent_per_bed: backendProperty.rentPerBed,
      type: backendProperty.type,
      facilities: backendProperty.facilities || [],
      staff: [], // Staff will be populated separately if needed
      created_at: this.timestampToISO(backendProperty.created_at),
      updated_at: this.timestampToISO(backendProperty.updated_at),
    };

    return property;
  }

  /**
   * Transform create property data for API request
   */
  toCreateRequest(data: CreatePropertyData): any {
    this.validateRequiredFields(data, [
      "name",
      "location",
      "owner",
      "contact",
      "total_rooms",
      "total_beds",
      "rent_per_bed",
      "type",
    ]);

    return {
      propertyName: data.name, // Backend expects 'propertyName'
      location: data.location,
      ownerName: data.owner, // Backend expects 'ownerName'
      contactNumber: data.contact, // Backend expects 'contactNumber'
      totalRooms: data.total_rooms, // Backend expects 'totalRooms'
      totalBeds: data.total_beds, // Backend expects 'totalBeds'
      rentPerBed: data.rent_per_bed, // Backend expects 'rentPerBed'
      facilities: data.facilities || [],
      type: data.type, // Property type from dropdown
    };
  }

  /**
   * Transform update property data for API request
   */
  toUpdateRequest(data: UpdatePropertyData): any {
    const updateData: any = {};

    if (data.name !== undefined) updateData.propertyName = data.name;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.owner !== undefined) updateData.ownerName = data.owner;
    if (data.contact !== undefined) updateData.contactNumber = data.contact;
    if (data.total_rooms !== undefined)
      updateData.totalRooms = data.total_rooms;
    if (data.total_beds !== undefined) updateData.totalBeds = data.total_beds;
    if (data.rent_per_bed !== undefined)
      updateData.rentPerBed = data.rent_per_bed;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.facilities !== undefined) updateData.facilities = data.facilities;

    return this.cleanObject(updateData);
  }
}

// Export singleton instance
export const propertyTransformer = new PropertyTransformer();
