/**
 * Export all transformers and utilities
 */

export * from "./base-transformer";
export * from "./property-transformer";
export * from "./tenant-transformer";
export * from "./room-transformer";
export * from "./booking-transformer";
export * from "./rent-transformer";
export * from "./expense-transformer";
export * from "./staff-transformer";
export * from "./food-transformer";
export * from "./issue-transformer";
export * from "./profit-loss-transformer";

// Re-export commonly used types and utilities
export type { DataTransformer } from "./base-transformer";
export {
  BaseTransformer,
  FIELD_MAPPINGS,
  TransformUtils,
} from "./base-transformer";
export {
  PropertyTransformer,
  propertyTransformer,
} from "./property-transformer";
export type {
  Property,
  BackendProperty,
  CreatePropertyData,
  UpdatePropertyData,
} from "./property-transformer";
export { TenantTransformer, tenantTransformer } from "./tenant-transformer";
export type {
  Tenant,
  BackendTenant,
  CreateTenantData,
  UpdateTenantData,
} from "./tenant-transformer";
export { roomTransformer } from "./room-transformer";
export type {
  Room,
  BackendRoom,
  CreateRoomData,
  UpdateRoomData,
  BedAssignmentData,
  BedReleaseData,
  BedAvailability,
} from "./room-transformer";
export { bookingTransformer } from "./booking-transformer";
export type {
  Booking,
  BackendBooking,
  CreateBookingData,
  UpdateBookingData,
  BookingStats,
} from "./booking-transformer";
export { rentTransformer } from "./rent-transformer";
export type {
  Rent,
  BackendRent,
  CreateRentData,
  UpdateRentData,
} from "./rent-transformer";
export { expenseTransformer } from "./expense-transformer";
export type {
  Expense,
  BackendExpense,
  CreateExpenseData,
  UpdateExpenseData,
} from "./expense-transformer";
export { staffTransformer } from "./staff-transformer";
export type {
  Staff,
  BackendStaff,
  CreateStaffData,
  UpdateStaffData,
} from "./staff-transformer";
export { foodTransformer } from "./food-transformer";
export type {
  Food,
  BackendFood,
  CreateFoodData,
  UpdateFoodData,
  FoodAnalytics,
  KitchenInsights,
} from "./food-transformer";
export { issueTransformer } from "./issue-transformer";
export type {
  Issue,
  BackendIssue,
  CreateIssueData,
  UpdateIssueData,
} from "./issue-transformer";
export { profitLossTransformer } from "./profit-loss-transformer";
export type {
  ProfitLossData,
  ProfitLossAnalysis,
  ProfitLossSummary,
  PropertyProfitLoss,
  MonthlyTrends,
  FinancialRecommendations,
  BackendProfitLossData,
  BackendProfitLossAnalysis,
  BackendProfitLossSummary,
  BackendPropertyProfitLoss,
  BackendMonthlyTrends,
  BackendFinancialRecommendations,
} from "./profit-loss-transformer";
