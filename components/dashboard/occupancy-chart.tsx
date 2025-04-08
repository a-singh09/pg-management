"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { getOccupancyData } from "@/lib/data"
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts"

const data = getOccupancyData()

const chartConfig = {
  occupancy: {
    label: "Occupancy %",
    color: "hsl(var(--chart-1))",
  },
  rent: {
    label: "Rent Collected",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function OccupancyChart() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Occupancy & Revenue Trend</CardTitle>
        <CardDescription>Monthly occupancy percentage and rent collection</CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
}
