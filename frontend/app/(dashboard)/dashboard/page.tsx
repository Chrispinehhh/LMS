// frontend/app/(dashboard)/dashboard/page.tsx
"use client";

import { useApi } from "@/hooks/useApi";
import { DashboardSummary } from "@/types";
import { StatCard } from "@/components/shared/StatCard";
import { JobsChart } from "@/components/shared/JobsChart";
import { RecentJobs } from "@/components/shared/RecentJobs";
import { Users, ShoppingCart, Truck, ClipboardList } from "lucide-react";

export default function DashboardPage() {
  const { data: summary, error, isLoading } = useApi<DashboardSummary>('/reports/summary/');

  if (error) return <div className="p-6">Failed to load dashboard data.</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading || !summary ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse h-[116px]"></div>
          ))
        ) : (
          <>
            <StatCard title="Total Revenue (30d)" value={`$${summary.recent_revenue_30d}`} icon={ShoppingCart} />
            <StatCard title="Shipments In Transit" value={summary.shipments_in_transit} icon={Truck} />
            <StatCard title="Total Customers" value={summary.total_customers} icon={Users} />
            <StatCard 
              title="Total Jobs" 
              value={summary.total_jobs} 
              icon={ClipboardList} 
            />
          </>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Jobs (Last 7 Days)</h2>
          <JobsChart />
        </div>
        <div className="lg:col-span-1">
          <RecentJobs />
        </div>
      </div>
    </div>
  );
}