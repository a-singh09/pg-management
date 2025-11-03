"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { dashboardService } from "@/lib/services";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface OccupancyData {
  month: string;
  occupancy: number;
  rent: number;
}

const chartConfig = {
  occupancy: {
    label: "Occupancy %",
    color: "hsl(var(--chart-1))",
  },
  rent: {
    label: "Rent Collected",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function OccupancyChart() {
  const [data, setData] = useState<OccupancyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOccupancyData = async () => {
      try {
        setLoading(true);
        const occupancyData = await dashboardService.getOccupancyData();
        setData(occupancyData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch occupancy data:", err);
        setError("Failed to load occupancy data");
      } finally {
        setLoading(false);
      }
    };

    fetchOccupancyData();
  }, []);

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Occupancy & Revenue Trend</CardTitle>
        <CardDescription>
          Monthly occupancy percentage and rent collection
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : error ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <LineChart data={data}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<ChartTooltipContent />} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="occupancy"
                stroke="var(--color-occupancy)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="rent"
                stroke="var(--color-rent)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Legend />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
