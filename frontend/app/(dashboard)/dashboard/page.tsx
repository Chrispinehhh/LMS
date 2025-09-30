// frontend/app/(dashboard)/dashboard/page.tsx
"use client";

import { useApi } from "@/hooks/useApi";
import { DashboardSummary } from "@/types";
import { StatCard } from "@/components/shared/StatCard";
import { Users, Package, ShoppingCart, Truck } from "lucide-react"; // Import specific icons

export default function DashboardPage() {
  const { data: summary, error, isLoading } = useApi<DashboardSummary>('/reports/summary/');

  if (error) return <div className="p-6">Failed to load dashboard data.</div>;

  // A simple loading state for the whole dashboard
  if (isLoading || !summary) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Show skeleton loaders */}
            <div className="bg-white p-6 rounded-lg shadow animate-pulse h-[116px]"></div>
            <div className="bg-white p-6 rounded-lg shadow animate-pulse h-[116px]"></div>
            <div className="bg-white p-6 rounded-lg shadow animate-pulse h-[116px]"></div>
            <div className="bg-white p-6 rounded-lg shadow animate-pulse h-[116px]"></div>
        </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue (30d)"
          value={`$${summary.recent_revenue_30d}`}
          icon={ShoppingCart}
        />
        <StatCard 
          title="Shipments In Transit"
          value={summary.shipments_in_transit}
          icon={Truck}
        />
        <StatCard 
          title="Total Customers"
          value={summary.total_customers}
          icon={Users}
        />
        <StatCard 
          title="Total Products"
          value={summary.total_products}
          icon={Package}
        />
      </div>

      {/* We can add charts and recent activity tables here in the future */}
      <div className="mt-8">
        {/* Placeholder for future content */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold">Future Chart Area</h2>
        </div>
      </div>
    </div>
  );
}