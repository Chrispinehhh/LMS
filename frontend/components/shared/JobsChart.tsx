// frontend/components/shared/JobsChart.tsx
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useApi } from "@/hooks/useApi";
import { JobChartData } from "@/types";

export function JobsChart() {
  const { data: chartData, isLoading } = useApi<JobChartData[]>('/reports/recent-jobs-chart/?days=7');

  if (isLoading) {
    return <div className="h-[300px] w-full animate-pulse bg-gray-200 rounded-lg" />;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      {/* --- THIS IS THE FIX --- */}
      <BarChart data={chartData || []}>
        <XAxis
          dataKey="short_date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
            contentStyle={{ 
                background: "white", 
                border: "1px solid #ccc", 
                borderRadius: "0.5rem"
            }}
        />
        <Bar dataKey="jobs" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}