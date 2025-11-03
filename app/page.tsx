"use client";

import { Building, Bed, Users, IndianRupee } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { OccupancyChart } from "@/components/dashboard/occupancy-chart";
import { RecentIssues } from "@/components/dashboard/recent-issues";
import { ExpenseChart } from "@/components/dashboard/expense-chart";
import { dashboardService } from "@/lib/services";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalProperties: number;
  totalTenants: number;
  totalAvailableBeds: number;
  monthlyRevenue: number;
  recentIssues: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const dashboardStats = await dashboardService.getDashboardStats();
        setStats(dashboardStats);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col w-full">
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 w-full">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          </div>
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 w-full">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          ) : (
            <>
              <StatsCard
                title="Total Properties"
                value={stats?.totalProperties || 0}
                icon={Building}
                trend="up"
                trendValue="4% from last month"
              />
              <StatsCard
                title="Total Tenants"
                value={stats?.totalTenants || 0}
                icon={Users}
                trend="up"
                trendValue="12% from last month"
              />
              <StatsCard
                title="Available Beds"
                value={stats?.totalAvailableBeds || 0}
                icon={Bed}
                trend="down"
                trendValue="3% from last month"
              />
              <StatsCard
                title="Monthly Revenue"
                value={`₹${(stats?.monthlyRevenue || 0).toLocaleString()}`}
                icon={IndianRupee}
                trend="up"
                trendValue="8% from last month"
              />
            </>
          )}
        </div>
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
          <OccupancyChart />
          <RecentIssues />
        </div>
        <div className="grid gap-4 grid-cols-1">
          <ExpenseChart />
        </div>
      </div>
    </div>
  );
}
