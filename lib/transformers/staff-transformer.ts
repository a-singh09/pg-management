/**
 * Staff data transformer for converting between frontend and backend models
 */

import { BaseTransformer } from "./base-transformer";

// Frontend staff model (matches current lib/data.ts structure)
export interface Staff {
  id: string;
  name: string;
  role: string;
  pg_id: string;
  phone: string;
  email: string;
  salary: number;
  joining_date: string;
  address?: string;
  emergency_contact?: string;
  emergency_contact_name?: string;
  id_proof_type?: string;
  id_proof_number?: string;
  created_at: string;
  updated_at: string;
}

// Backend staff model (matches backend API structure)
export interface BackendStaff {
  id: string;
  name: string;
  position: string;
  propertyId?: string;
  phone: string;
  email: string;
  salary: number;
  joining_date: Date | any; // Firebase Timestamp
  address?: string;
  emergency_contact?: string;
  emergency_contact_name?: string;
  id_proof_type?: string;
  id_proof_number?: string;
  ownerId: string;
  created_at: Date | any; // Firebase Timestamp
  updated_at: Date | any; // Firebase Timestamp
}

// Create staff request data
export interface CreateStaffData {
  name: string;
  role: string;
  pg_id?: string;
  phone: string;
  email: string;
  salary: number;
  joining_date: string;
  address: string;
  emergency_contact: string;
  emergency_contact_name: string;
  id_proof_type: string;
  id_proof_number: string;
}

// Update staff request data
export interface UpdateStaffData {
  name?: string;
  role?: string;
  pg_id?: string;
  phone?: string;
  email?: string;
  salary?: number;
  joining_date?: string;
  address?: string;
  emergency_contact?: string;
  emergency_contact_name?: string;
  id_proof_type?: string;
  id_proof_number?: string;
}

// Backend create request
export interface BackendCreateStaffRequest {
  name: string;
  position: string;
  propertyId?: string;
  phone: string;
  email: string;
  salary: number;
  joining_date: Date;
  address: string;
  emergency_contact: string;
  emergency_contact_name: string;
  id_proof_type: string;
  id_proof_number: string;
}

// Backend update request
export interface BackendUpdateStaffRequest {
  name?: string;
  position?: string;
  propertyId?: string;
  phone?: string;
  email?: string;
  salary?: number;
  joining_date?: Date;
  address?: string;
  emergency_contact?: string;
  emergency_contact_name?: string;
  id_proof_type?: string;
  id_proof_number?: string;
}

class StaffTransformer extends BaseTransformer<Staff, BackendStaff> {
  /**
   * Convert backend staff to frontend staff
   */
  toFrontend(backendStaff: BackendStaff): Staff {
    return {
      id: backendStaff.id,
      name: backendStaff.name,
      role: backendStaff.position,
      pg_id: backendStaff.propertyId || "",
      phone: backendStaff.phone,
      email: backendStaff.email,
      salary: backendStaff.salary,
      joining_date: this.timestampToISO(backendStaff.joining_date),
      address: backendStaff.address,
      emergency_contact: backendStaff.emergency_contact,
      emergency_contact_name: backendStaff.emergency_contact_name,
      id_proof_type: backendStaff.id_proof_type,
      id_proof_number: backendStaff.id_proof_number,
      created_at: this.timestampToISO(backendStaff.created_at),
      updated_at: this.timestampToISO(backendStaff.updated_at),
    };
  }

  /**
   * Convert frontend staff to backend staff (not typically used)
   */
  toBackend(frontendStaff: Staff): BackendStaff {
    return {
      id: frontendStaff.id,
      name: frontendStaff.name,
      position: frontendStaff.role,
      propertyId: frontendStaff.pg_id,
      phone: frontendStaff.phone,
      email: frontendStaff.email,
      salary: frontendStaff.salary,
      joining_date: this.isoToDate(frontendStaff.joining_date),
      address: frontendStaff.address,
      emergency_contact: frontendStaff.emergency_contact,
      emergency_contact_name: frontendStaff.emergency_contact_name,
      id_proof_type: frontendStaff.id_proof_type,
      id_proof_number: frontendStaff.id_proof_number,
      ownerId: "", // Will be set by backend
      created_at: this.isoToDate(frontendStaff.created_at),
      updated_at: this.isoToDate(frontendStaff.updated_at),
    };
  }

  /**
   * Convert create staff data to backend request format
   */
  toCreateRequest(data: CreateStaffData): BackendCreateStaffRequest {
    return {
      name: data.name,
      position: data.role,
      propertyId: data.pg_id,
      phone: data.phone,
      email: data.email,
      salary: data.salary,
      joining_date: this.isoToDate(data.joining_date),
      address: data.address,
      emergency_contact: data.emergency_contact,
      emergency_contact_name: data.emergency_contact_name,
      id_proof_type: data.id_proof_type,
      id_proof_number: data.id_proof_number,
    };
  }

  /**
   * Convert update staff data to backend request format
   */
  toUpdateRequest(data: UpdateStaffData): BackendUpdateStaffRequest {
    const request: BackendUpdateStaffRequest = {};

    if (data.name !== undefined) request.name = data.name;
    if (data.role !== undefined) request.position = data.role;
    if (data.pg_id !== undefined) request.propertyId = data.pg_id;
    if (data.phone !== undefined) request.phone = data.phone;
    if (data.email !== undefined) request.email = data.email;
    if (data.salary !== undefined) request.salary = data.salary;
    if (data.joining_date !== undefined) {
      request.joining_date = this.isoToDate(data.joining_date);
    }
    if (data.address !== undefined) request.address = data.address;
    if (data.emergency_contact !== undefined)
      request.emergency_contact = data.emergency_contact;
    if (data.emergency_contact_name !== undefined)
      request.emergency_contact_name = data.emergency_contact_name;
    if (data.id_proof_type !== undefined)
      request.id_proof_type = data.id_proof_type;
    if (data.id_proof_number !== undefined)
      request.id_proof_number = data.id_proof_number;

    return request;
  }

  /**
   * Convert array of backend staff to frontend staff
   */
  toFrontendArray(backendStaff: BackendStaff[]): Staff[] {
    return backendStaff.map((staff) => this.toFrontend(staff));
  }
}

// Export singleton instance
export const staffTransformer = new StaffTransformer();
export default staffTransformer;
