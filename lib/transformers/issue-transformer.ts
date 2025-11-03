/**
 * Issue transformer for handling issue-related data transformations
 */

import { BaseTransformer, FIELD_MAPPINGS } from "./base-transformer";

/**
 * Frontend Issue interface (matches current data structure)
 */
export interface Issue {
  id: string;
  pg_id: string;
  room_id?: string;
  tenant_id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  reported_by: string;
  contact_number: string;
  status: "pending" | "in_progress" | "resolved";
  reported_at: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Backend Issue interface (expected from API)
 */
export interface BackendIssue {
  id: string;
  propertyId: string;
  roomId?: string;
  tenantId: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  reported_by: string;
  contact_number: string;
  status: "pending" | "in_progress" | "resolved";
  reported_at: Date | any; // Firebase Timestamp or Date
  resolved_at: Date | any | null; // Firebase Timestamp or Date
  ownerId: string;
  created_at: Date | any; // Firebase Timestamp or Date
  updated_at: Date | any; // Firebase Timestamp or Date
}

/**
 * Create Issue Data interface
 */
export interface CreateIssueData {
  pg_id: string;
  room_id?: string;
  tenant_id: string;
  title: string;
  description: string;
  category: string;
  priority?: string;
  reported_by: string;
  contact_number: string;
  status?: "pending" | "in-progress" | "resolved";
}

/**
 * Update Issue Data interface
 */
export interface UpdateIssueData {
  title?: string;
  description?: string;
  category?: string;
  priority?: string;
  reported_by?: string;
  contact_number?: string;
  status?: "pending" | "in_progress" | "resolved";
  resolved_at?: string | null;
}

/**
 * Backend Create Issue Request interface
 */
export interface BackendCreateIssueRequest {
  propertyId: string;
  roomId?: string;
  tenantId: string;
  title: string;
  description: string;
  category: string;
  priority?: string;
  reported_by: string;
  contact_number: string;
  status?: "pending" | "in-progress" | "resolved";
}

/**
 * Backend Update Issue Request interface
 */
export interface BackendUpdateIssueRequest {
  title?: string;
  description?: string;
  category?: string;
  priority?: string;
  reported_by?: string;
  contact_number?: string;
  status?: "pending" | "in_progress" | "resolved";
  resolved_at?: Date | null;
}

/**
 * Issue transformer class
 */
export class IssueTransformer extends BaseTransformer<Issue, BackendIssue> {
  /**
   * Transform backend issue to frontend issue
   */
  toFrontend(backendIssue: BackendIssue): Issue {
    return {
      id: backendIssue.id,
      pg_id: backendIssue.propertyId,
      room_id: backendIssue.roomId,
      tenant_id: backendIssue.tenantId,
      title: backendIssue.title,
      description: backendIssue.description,
      category: backendIssue.category,
      priority: backendIssue.priority,
      reported_by: backendIssue.reported_by,
      contact_number: backendIssue.contact_number,
      status: backendIssue.status,
      reported_at: this.timestampToISO(backendIssue.reported_at),
      resolved_at: backendIssue.resolved_at
        ? this.timestampToISO(backendIssue.resolved_at)
        : null,
      created_at: this.timestampToISO(backendIssue.created_at),
      updated_at: this.timestampToISO(backendIssue.updated_at),
    };
  }

  /**
   * Transform frontend issue to backend issue
   */
  toBackend(frontendIssue: Issue): BackendIssue {
    return {
      id: frontendIssue.id,
      propertyId: frontendIssue.pg_id,
      roomId: frontendIssue.room_id,
      tenantId: frontendIssue.tenant_id,
      title: frontendIssue.title,
      description: frontendIssue.description,
      category: frontendIssue.category,
      priority: frontendIssue.priority,
      reported_by: frontendIssue.reported_by,
      contact_number: frontendIssue.contact_number,
      status: frontendIssue.status,
      reported_at: this.isoToDate(frontendIssue.reported_at),
      resolved_at: frontendIssue.resolved_at
        ? this.isoToDate(frontendIssue.resolved_at)
        : null,
      ownerId: "", // Will be set by backend
      created_at: this.isoToDate(frontendIssue.created_at),
      updated_at: this.isoToDate(frontendIssue.updated_at),
    };
  }

  /**
   * Transform create issue data to backend request format
   */
  toCreateRequest(data: CreateIssueData): BackendCreateIssueRequest {
    this.validateRequiredFields(data, [
      "pg_id",
      "tenant_id",
      "title",
      "description",
      "category",
      "reported_by",
      "contact_number",
    ]);

    return this.cleanObject({
      propertyId: data.pg_id,
      roomId: data.room_id || "",
      tenantId: data.tenant_id,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority || "medium",
      reported_by: data.reported_by,
      contact_number: data.contact_number,
      status: data.status || "pending",
    }) as BackendCreateIssueRequest;
  }

  /**
   * Transform update issue data to backend request format
   */
  toUpdateRequest(data: UpdateIssueData): BackendUpdateIssueRequest {
    const updateData: BackendUpdateIssueRequest = {};

    if (data.title !== undefined) {
      updateData.title = data.title;
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    if (data.category !== undefined) {
      updateData.category = data.category;
    }

    if (data.priority !== undefined) {
      updateData.priority = data.priority;
    }

    if (data.reported_by !== undefined) {
      updateData.reported_by = data.reported_by;
    }

    if (data.contact_number !== undefined) {
      updateData.contact_number = data.contact_number;
    }

    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    if (data.resolved_at !== undefined) {
      updateData.resolved_at = data.resolved_at
        ? this.isoToDate(data.resolved_at)
        : null;
    }

    return this.cleanObject(updateData) as BackendUpdateIssueRequest;
  }
}

// Export singleton instance
export const issueTransformer = new IssueTransformer();
export default issueTransformer;
