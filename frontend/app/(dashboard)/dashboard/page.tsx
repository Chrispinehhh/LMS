// frontend/app/(dashboard)/dashboard/page.tsx
"use client";

import { useApi } from "@/hooks/useApi";
import { DashboardSummary } from "@/types";
import { StatCard } from "@/components/shared/StatCard";
import { JobsChart } from "@/components/shared/JobsChart";
import { RecentJobs } from "@/components/shared/RecentJobs";
import { Users, ShoppingCart, Truck, ClipboardList, Clock } from "lucide-react";

export default function DashboardPage() {
  const { data: summary, error, isLoading } = useApi<DashboardSummary>('/reports/summary/');

  if (error) return (
    <div className="p-6 text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
      Failed to load dashboard data. Please try again later.
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-400">
            Dashboard Overview
          </h1>
          <p className="text-blue-600 dark:text-blue-300 mt-2">
            Welcome back! Here&apos;s what&apos;s happening with S&amp;S Logistics today.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2 bg-indigo-100 dark:bg-indigo-900/30 px-4 py-2 rounded-lg">
          <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading || !summary ? (
          [...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className="bg-white p-6 rounded-lg shadow animate-pulse h-[116px]"
            ></div>
          ))
        ) : (
          <>
            <StatCard 
              title="Total Revenue (30d)" 
              value={`$${summary.recent_revenue_30d.toLocaleString()}`} 
              icon={ShoppingCart}
              description="from last month"
            />
            <StatCard 
              title="Shipments In Transit" 
              value={summary.shipments_in_transit} 
              icon={Truck}
              description="active shipments"
            />
            <StatCard 
              title="Total Customers" 
              value={summary.total_customers} 
              icon={Users}
              description="registered clients"
            />
            <StatCard 
              title="Active Jobs" 
              value={summary.total_jobs} 
              icon={ClipboardList}
              description="this week"
            />
          </>
        )}
      </div>

      {/* Charts and Recent Jobs */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-cyan-700 dark:text-cyan-400">Shipment Analytics (Last 7 Days)</h2>
          <JobsChart />
        </div>
        <div className="lg:col-span-1">
          <RecentJobs />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 backdrop-blur-sm rounded-xl p-6 border border-emerald-200 dark:border-emerald-700">
        <h3 className="text-lg font-semibold mb-4 text-emerald-700 dark:text-emerald-400">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:shadow-md hover:scale-105">
            <Truck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">New Shipment</span>
          </button>
          <button className="bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:shadow-md hover:scale-105">
            <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Add Client</span>
          </button>
          <button className="bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:shadow-md hover:scale-105">
            <ClipboardList className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Create Job</span>
          </button>
          <button className="bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:shadow-md hover:scale-105">
            <Truck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Track Package</span>
          </button>
        </div>
      </div>
    </div>
  );
}