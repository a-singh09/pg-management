/**
 * Export all services for easier imports
 */

export * from "./property-service";
export * from "./tenant-service";
export * from "./room-service";
export * from "./booking-service";
export * from "./rent-service";
export * from "./expense-service";
export * from "./staff-service";
export * from "./food-service";
export * from "./issue-service";
export * from "./profit-loss-service";
export * from "./dashboard-service";

// Re-export service instances
export { propertyService } from "./property-service";
export { tenantService } from "./tenant-service";
export { roomService } from "./room-service";
export { bookingService } from "./booking-service";
export { rentService } from "./rent-service";
export { expenseService } from "./expense-service";
export { staffService } from "./staff-service";
export { foodService } from "./food-service";
export { issueService } from "./issue-service";
export { profitLossService } from "./profit-loss-service";
export { dashboardService } from "./dashboard-service";

// Re-export service interfaces
export type { PropertyService } from "./property-service";
export type { TenantService } from "./tenant-service";
export type { RoomService } from "./room-service";
export type { BookingService } from "./booking-service";
export type { RentService } from "./rent-service";
export type { ExpenseService } from "./expense-service";
export type { StaffService } from "./staff-service";
export type { FoodService } from "./food-service";
export type { IssueService } from "./issue-service";
export type { ProfitLossService } from "./profit-loss-service";
export type { DashboardService } from "./dashboard-service";
