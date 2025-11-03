/**
 * Dashboard service for aggregating data from all services for dashboard statistics
 */

import { propertyService } from "./property-service";
import { tenantService } from "./tenant-service";
import { roomService } from "./room-service";
import { rentService } from "./rent-service";
import { expenseService } from "./expense-service";
import { issueService } from "./issue-service";
import { bookingService } from "./booking-service";

export interface DashboardStats {
  totalProperties: number;
  totalTenants: number;
  totalAvailableBeds: number;
  monthlyRevenue: number;
  recentIssues: number;
}

export interface OccupancyData {
  month: string;
  occupancy: number;
  rent: number;
}

export interface ExpenseByCategory {
  category: string;
  amount: number;
}

export interface DashboardService {
  getDashboardStats(): Promise<DashboardStats>;
  getOccupancyData(): Promise<OccupancyData[]>;
  getExpensesByCategory(): Promise<ExpenseByCategory[]>;
  getRecentIssues(): Promise<any[]>;
}

class DashboardServiceImpl implements DashboardService {
  /**
   * Get aggregated dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Fetch data from all services in parallel
      const [properties, tenants, rents, issues] = await Promise.all([
        propertyService.getProperties(),
        tenantService.getTenants(),
        rentService.getRents(),
        issueService.getIssues(),
      ]);

      // Calculate statistics
      const totalProperties = properties.length;
      const totalTenants = tenants.filter(
        (tenant) => tenant.status === "active",
      ).length;
      const totalAvailableBeds = properties.reduce(
        (sum, property) => sum + property.available_beds,
        0,
      );

      // Calculate monthly revenue from paid rents in current month
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = rents
        .filter((rent) => {
          const rentDate = new Date(rent.payment_date || rent.due_date);
          return (
            rent.status === "paid" &&
            rentDate.getMonth() === currentMonth &&
            rentDate.getFullYear() === currentYear
          );
        })
        .reduce((sum, rent) => sum + rent.amount_paid, 0);

      const recentIssues = issues.filter(
        (issue) => issue.status !== "resolved",
      ).length;

      return {
        totalProperties,
        totalTenants,
        totalAvailableBeds,
        monthlyRevenue,
        recentIssues,
      };
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      throw error;
    }
  }

  /**
   * Get occupancy data for charts (last 6 months)
   */
  async getOccupancyData(): Promise<OccupancyData[]> {
    try {
      const [properties, tenants, rents] = await Promise.all([
        propertyService.getProperties(),
        tenantService.getTenants(),
        rentService.getRents(),
      ]);

      // Calculate total beds across all properties
      const totalBeds = properties.reduce(
        (sum, property) => sum + property.total_rooms * 2,
        0,
      ); // Assuming 2 beds per room on average

      // Generate data for last 6 months
      const occupancyData: OccupancyData[] = [];
      const currentDate = new Date();

      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - i,
          1,
        );
        const monthName = monthDate.toLocaleDateString("en-US", {
          month: "short",
        });

        // Calculate occupancy for this month
        const activeTenants = tenants.filter((tenant) => {
          const checkIn = new Date(tenant.check_in);
          const checkOut = tenant.check_out ? new Date(tenant.check_out) : null;

          return checkIn <= monthDate && (!checkOut || checkOut >= monthDate);
        }).length;

        const occupancyPercentage =
          totalBeds > 0 ? Math.round((activeTenants / totalBeds) * 100) : 0;

        // Calculate rent collected for this month
        const monthlyRent = rents
          .filter((rent) => {
            const rentDate = new Date(rent.payment_date || rent.due_date);
            return (
              rent.status === "paid" &&
              rentDate.getMonth() === monthDate.getMonth() &&
              rentDate.getFullYear() === monthDate.getFullYear()
            );
          })
          .reduce((sum, rent) => sum + rent.amount_paid, 0);

        occupancyData.push({
          month: monthName,
          occupancy: occupancyPercentage,
          rent: monthlyRent,
        });
      }

      return occupancyData;
    } catch (error) {
      console.error("Failed to fetch occupancy data:", error);
      throw error;
    }
  }

  /**
   * Get expenses grouped by category
   */
  async getExpensesByCategory(): Promise<ExpenseByCategory[]> {
    try {
      const expenses = await expenseService.getExpenses();

      // Group expenses by category and sum amounts
      const categoryMap = new Map<string, number>();

      expenses.forEach((expense) => {
        const currentAmount = categoryMap.get(expense.category) || 0;
        categoryMap.set(expense.category, currentAmount + expense.amount);
      });

      // Convert to array format
      return Array.from(categoryMap.entries()).map(([category, amount]) => ({
        category,
        amount,
      }));
    } catch (error) {
      console.error("Failed to fetch expenses by category:", error);
      throw error;
    }
  }

  /**
   * Get recent issues (last 5 unresolved issues)
   */
  async getRecentIssues(): Promise<any[]> {
    try {
      const issues = await issueService.getIssues();

      // Sort by reported date and get the 5 most recent
      return issues
        .sort(
          (a, b) =>
            new Date(b.reported_at).getTime() -
            new Date(a.reported_at).getTime(),
        )
        .slice(0, 5);
    } catch (error) {
      console.error("Failed to fetch recent issues:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const dashboardService = new DashboardServiceImpl();
export default dashboardService;
