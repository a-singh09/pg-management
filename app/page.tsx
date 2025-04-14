import { Building, Bed, Users, IndianRupee, AlertCircle } from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { OccupancyChart } from "@/components/dashboard/occupancy-chart"
import { RecentIssues } from "@/components/dashboard/recent-issues"
import { ExpenseChart } from "@/components/dashboard/expense-chart"
import { getSummaryData } from "@/lib/data"

export default function Dashboard() {
  const summaryData = getSummaryData()

  return (
    <div className="flex flex-col w-full">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 w-full">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Properties"
            value={summaryData.totalProperties}
            icon={Building}
            trend="up"
            trendValue="4% from last month"
          />
          <StatsCard
            title="Total Tenants"
            value={summaryData.totalTenants}
            icon={Users}
            trend="up"
            trendValue="12% from last month"
          />
          <StatsCard
            title="Available Beds"
            value={summaryData.totalAvailableBeds}
            icon={Bed}
            trend="down"
            trendValue="3% from last month"
          />
          <StatsCard
            title="Monthly Revenue"
            value={`₹${summaryData.monthlyRevenue.toLocaleString()}`}
            icon={IndianRupee}
            trend="up"
            trendValue="8% from last month"
          />
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
  )
}
