"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { profitLossService } from "@/lib/services";
import {
  ProfitLossAnalysis,
  FinancialRecommendations,
} from "@/lib/transformers";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, TrendingUp, AlertCircle, Lightbulb } from "lucide-react";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--chart-2))",
  },
  profit: {
    label: "Profit",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export default function ProfitLossPage() {
  const [profitLossData, setProfitLossData] =
    useState<ProfitLossAnalysis | null>(null);
  const [recommendations, setRecommendations] =
    useState<FinancialRecommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [analysisData, recommendationsData] = await Promise.all([
          profitLossService.getAnalysis(),
          profitLossService.getRecommendations(),
        ]);

        setProfitLossData(analysisData);
        setRecommendations(recommendationsData);
      } catch (err) {
        console.error("Failed to fetch profit/loss data:", err);
        setError("Failed to load profit/loss data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col">
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-3 w-40" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-96 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col">
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Profit/Loss</h2>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!profitLossData) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Profit/Loss</h2>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{profitLossData.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                For the analysis period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{profitLossData.totalExpenses.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                For the analysis period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{profitLossData.netProfit.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {profitLossData.profitMargin.toFixed(1)}% profit margin
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profit/Loss Trend</CardTitle>
            <CardDescription>
              Monthly revenue, expenses, and profit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="min-h-[400px] w-full"
            >
              <BarChart data={profitLossData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, ""]} />
                <Legend />
                <Bar dataKey="revenue" fill="var(--color-revenue)" />
                <Bar dataKey="expenses" fill="var(--color-expenses)" />
                <Bar dataKey="profit" fill="var(--color-profit)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {recommendations && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Financial Recommendations
              </CardTitle>
              <CardDescription>
                AI-powered insights to improve your profitability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.recommendations
                  .slice(0, 3)
                  .map((rec, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{rec.title}</h4>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            rec.impact === "high"
                              ? "bg-red-100 text-red-800"
                              : rec.impact === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {rec.impact.toUpperCase()} IMPACT
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {rec.description}
                      </p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Monthly Breakdown</CardTitle>
            <CardDescription>
              Detailed monthly profit and loss statement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Expenses</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Profit Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profitLossData.monthlyData.map((item, index) => (
                    <TableRow key={item.month}>
                      <TableCell className="font-medium">
                        {item.month}
                      </TableCell>
                      <TableCell>₹{item.revenue.toLocaleString()}</TableCell>
                      <TableCell>₹{item.expenses.toLocaleString()}</TableCell>
                      <TableCell>₹{item.profit.toLocaleString()}</TableCell>
                      <TableCell>
                        {Math.round((item.profit / item.revenue) * 100)}%
                        {index > 0 &&
                        item.profit >
                          profitLossData.monthlyData[index - 1].profit ? (
                          <TrendingUp className="inline ml-2 h-4 w-4 text-green-500" />
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
