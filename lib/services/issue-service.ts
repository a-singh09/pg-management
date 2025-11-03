/**
 * Issue service for handling issue-related API operations
 */

import { apiClient, ApiError } from "../api-client";
import {
  issueTransformer,
  Issue,
  BackendIssue,
  CreateIssueData,
  UpdateIssueData,
} from "../transformers/issue-transformer";

export interface IssueService {
  getIssues(propertyId?: string): Promise<Issue[]>;
  getIssue(id: string): Promise<Issue>;
  createIssue(data: CreateIssueData): Promise<Issue>;
  updateIssue(id: string, data: UpdateIssueData): Promise<Issue>;
  deleteIssue(id: string): Promise<void>;
}

class IssueServiceImpl implements IssueService {
  private readonly endpoint = "/api/issues";

  /**
   * Get all issues, optionally filtered by property
   */
  async getIssues(propertyId?: string): Promise<Issue[]> {
    try {
      const params = propertyId ? { pg_id: propertyId } : undefined;
      const backendIssues: BackendIssue[] = await apiClient.get(this.endpoint, {
        params,
      });
      return issueTransformer.toFrontendArray(backendIssues);
    } catch (error) {
      console.error("Failed to fetch issues:", error);
      throw error;
    }
  }

  /**
   * Get a specific issue by ID
   */
  async getIssue(id: string): Promise<Issue> {
    try {
      const backendIssue: BackendIssue = await apiClient.get(
        `${this.endpoint}/${id}`,
      );
      return issueTransformer.toFrontend(backendIssue);
    } catch (error) {
      console.error(`Failed to fetch issue ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new issue
   */
  async createIssue(data: CreateIssueData): Promise<Issue> {
    try {
      console.log("Creating issue with data:", data);
      const requestData = issueTransformer.toCreateRequest(data);
      console.log("Transformed request data:", requestData);
      const backendIssue: BackendIssue = await apiClient.post(
        this.endpoint,
        requestData,
      );
      return issueTransformer.toFrontend(backendIssue);
    } catch (error) {
      console.error("Failed to create issue:", error);
      throw error;
    }
  }

  /**
   * Update an existing issue
   */
  async updateIssue(id: string, data: UpdateIssueData): Promise<Issue> {
    try {
      const requestData = issueTransformer.toUpdateRequest(data);
      const backendIssue: BackendIssue = await apiClient.put(
        `${this.endpoint}/${id}`,
        requestData,
      );
      return issueTransformer.toFrontend(backendIssue);
    } catch (error) {
      console.error(`Failed to update issue ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an issue
   */
  async deleteIssue(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error(`Failed to delete issue ${id}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const issueService = new IssueServiceImpl();
export default issueService;
