/**
 * Base transformer interface and utilities for data transformation
 */

/**
 * Generic transformer interface for converting between frontend and backend data models
 */
export interface DataTransformer<FrontendType, BackendType> {
  /**
   * Transform frontend data model to backend data model
   */
  toBackend(frontendData: FrontendType): BackendType;

  /**
   * Transform backend data model to frontend data model
   */
  toFrontend(backendData: BackendType): FrontendType;
}

/**
 * Base transformer class with common transformation utilities
 */
export abstract class BaseTransformer<FrontendType, BackendType>
  implements DataTransformer<FrontendType, BackendType>
{
  abstract toBackend(frontendData: FrontendType): BackendType;
  abstract toFrontend(backendData: BackendType): FrontendType;

  /**
   * Transform array of backend items to frontend items
   */
  toFrontendArray(backendArray: BackendType[]): FrontendType[] {
    return backendArray.map((item) => this.toFrontend(item));
  }

  /**
   * Transform array of frontend items to backend items
   */
  toBackendArray(frontendArray: FrontendType[]): BackendType[] {
    return frontendArray.map((item) => this.toBackend(item));
  }

  /**
   * Convert Firebase Timestamp to ISO string
   */
  protected timestampToISO(timestamp: any): string {
    if (!timestamp) return new Date().toISOString();

    // Handle Firebase Timestamp object
    if (timestamp && typeof timestamp === "object" && timestamp.toDate) {
      return timestamp.toDate().toISOString();
    }

    // Handle Date object
    if (timestamp instanceof Date) {
      return timestamp.toISOString();
    }

    // Handle string (already ISO or other format)
    if (typeof timestamp === "string") {
      return new Date(timestamp).toISOString();
    }

    // Handle number (Unix timestamp)
    if (typeof timestamp === "number") {
      return new Date(timestamp).toISOString();
    }

    return new Date().toISOString();
  }

  /**
   * Convert ISO string to Date object for backend
   */
  protected isoToDate(isoString: string): Date {
    return new Date(isoString);
  }

  /**
   * Map field names between frontend and backend
   */
  protected mapFieldNames<T extends Record<string, any>>(
    data: T,
    fieldMap: Record<string, string>,
  ): Record<string, any> {
    const result: Record<string, any> = {};

    Object.entries(data).forEach(([key, value]) => {
      const mappedKey = fieldMap[key] || key;
      result[mappedKey] = value;
    });

    return result;
  }

  /**
   * Remove undefined and null values from object
   */
  protected cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
    const cleaned: Partial<T> = {};

    Object.entries(obj).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        cleaned[key as keyof T] = value;
      }
    });

    return cleaned;
  }

  /**
   * Ensure required fields are present
   */
  protected validateRequiredFields<T extends Record<string, any>>(
    data: T,
    requiredFields: (keyof T)[],
  ): void {
    const missingFields = requiredFields.filter(
      (field) => data[field] === undefined || data[field] === null,
    );

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }
  }
}

/**
 * Field mapping constants for common transformations
 */
export const FIELD_MAPPINGS = {
  // Property field mappings
  PROPERTY: {
    FRONTEND_TO_BACKEND: {
      pg_id: "propertyId",
      id: "id",
    },
    BACKEND_TO_FRONTEND: {
      propertyId: "pg_id",
      id: "id",
    },
  },

  // Tenant field mappings
  TENANT: {
    FRONTEND_TO_BACKEND: {
      pg_id: "propertyId",
      room_id: "roomId",
      tenant_id: "tenantId",
      id: "id",
    },
    BACKEND_TO_FRONTEND: {
      propertyId: "pg_id",
      roomId: "room_id",
      tenantId: "tenant_id",
      id: "id",
    },
  },

  // Room field mappings
  ROOM: {
    FRONTEND_TO_BACKEND: {
      pg_id: "propertyId",
      room_id: "roomId",
      id: "id",
    },
    BACKEND_TO_FRONTEND: {
      propertyId: "pg_id",
      roomId: "room_id",
      id: "id",
    },
  },

  // Booking field mappings
  BOOKING: {
    FRONTEND_TO_BACKEND: {
      pg_id: "propertyId",
      id: "id",
    },
    BACKEND_TO_FRONTEND: {
      propertyId: "pg_id",
      id: "id",
    },
  },

  // Rent field mappings
  RENT: {
    FRONTEND_TO_BACKEND: {
      pg_id: "propertyId",
      tenant_id: "tenantId",
      id: "id",
    },
    BACKEND_TO_FRONTEND: {
      propertyId: "pg_id",
      tenantId: "tenant_id",
      id: "id",
    },
  },

  // Expense field mappings
  EXPENSE: {
    FRONTEND_TO_BACKEND: {
      pg_id: "propertyId",
      id: "id",
    },
    BACKEND_TO_FRONTEND: {
      propertyId: "pg_id",
      id: "id",
    },
  },

  // Staff field mappings
  STAFF: {
    FRONTEND_TO_BACKEND: {
      pg_id: "propertyId",
      id: "id",
    },
    BACKEND_TO_FRONTEND: {
      propertyId: "pg_id",
      id: "id",
    },
  },

  // Food field mappings
  FOOD: {
    FRONTEND_TO_BACKEND: {
      pg_id: "propertyId",
      id: "id",
    },
    BACKEND_TO_FRONTEND: {
      propertyId: "pg_id",
      id: "id",
    },
  },

  // Issue field mappings
  ISSUE: {
    FRONTEND_TO_BACKEND: {
      pg_id: "propertyId",
      tenant_id: "tenantId",
      id: "id",
    },
    BACKEND_TO_FRONTEND: {
      propertyId: "pg_id",
      tenantId: "tenant_id",
      id: "id",
    },
  },
} as const;

/**
 * Utility functions for common transformations
 */
export const TransformUtils = {
  /**
   * Convert Firebase Timestamp to ISO string
   */
  timestampToISO: (timestamp: any): string => {
    if (!timestamp) return new Date().toISOString();

    if (timestamp && typeof timestamp === "object" && timestamp.toDate) {
      return timestamp.toDate().toISOString();
    }

    if (timestamp instanceof Date) {
      return timestamp.toISOString();
    }

    if (typeof timestamp === "string") {
      return new Date(timestamp).toISOString();
    }

    if (typeof timestamp === "number") {
      return new Date(timestamp).toISOString();
    }

    return new Date().toISOString();
  },

  /**
   * Convert ISO string to Date object
   */
  isoToDate: (isoString: string): Date => {
    return new Date(isoString);
  },

  /**
   * Map field names using provided mapping
   */
  mapFields: <T extends Record<string, any>>(
    data: T,
    fieldMap: Record<string, string>,
  ): Record<string, any> => {
    const result: Record<string, any> = {};

    Object.entries(data).forEach(([key, value]) => {
      const mappedKey = fieldMap[key] || key;
      result[mappedKey] = value;
    });

    return result;
  },

  /**
   * Clean object by removing undefined/null values
   */
  cleanObject: <T extends Record<string, any>>(obj: T): Partial<T> => {
    const cleaned: Partial<T> = {};

    Object.entries(obj).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        cleaned[key as keyof T] = value;
      }
    });

    return cleaned;
  },
};
