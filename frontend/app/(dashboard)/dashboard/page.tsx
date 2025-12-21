// frontend/app/(dashboard)/dashboard/page.tsx
"use client";

import { useApi } from "@/hooks/useApi";
import { DashboardSummary } from "@/types";
import { StatCard } from "@/components/shared/StatCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { JobsChart } from "@/components/shared/JobsChart";
import {
  Users,
  ShoppingCart,
  Truck,
  ClipboardList,
  Plus,
  PackagePlus,
  UserPlus,
  Search
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { data: summary, error, isLoading } = useApi<DashboardSummary>('/reports/summary/');

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (error) return (
    <div className="p-6 text-destructive bg-destructive/10 border border-destructive/20 rounded-xl">
      Failed to load dashboard data. Please reload the page.
    </div>
  );

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 max-w-7xl mx-auto"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's your daily logistics snapshot.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/jobs/create">
            <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95 text-sm font-medium">
              <Plus className="w-4 h-4" />
              New Job
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-card h-32 rounded-2xl animate-pulse" />
          ))
        ) : summary ? (
          <>
            <StatCard
              title="Total Revenue"
              value={`$${summary.recent_revenue_30d.toLocaleString()}`}
              icon={ShoppingCart}
              description="Last 30 days"
              trend="up"
            />
            <StatCard
              title="Active Shipments"
              value={summary.shipments_in_transit}
              icon={Truck}
              description="In transit"
              trend="neutral"
            />
            <StatCard
              title="Total Customers"
              value={summary.total_customers}
              icon={Users}
              description="Active accounts"
              trend="up"
            />
            <StatCard
              title="Jobs this Week"
              value={summary.total_jobs}
              icon={ClipboardList}
              description="Scheduled & Active"
              trend="up"
            />
          </>
        ) : null}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Charts */}
        <motion.div variants={item} className="lg:col-span-2 space-y-8">
          {/* Analytics Chart */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Shipment Analytics</h2>
              <select className="bg-transparent text-sm border-none focus:ring-0 text-muted-foreground cursor-pointer">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <JobsChart />
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: PackagePlus, label: "New Job", href: "/jobs/create", color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
                { icon: UserPlus, label: "Add Client", href: "/users/create", color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" },
                { icon: Truck, label: "Assign Driver", href: "/fleet/drivers", color: "text-amber-500 bg-amber-50 dark:bg-amber-900/20" },
                { icon: Search, label: "Track Cargo", href: "/jobs", color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20" },
              ].map((action, i) => (
                <Link key={i} href={action.href}>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="p-4 rounded-xl border border-border bg-card/50 hover:bg-card hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${action.color} group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{action.label}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Column: Recent Activity */}
        <motion.div variants={item} className="lg:col-span-1 h-full min-h-[500px]">
          <RecentActivity />
        </motion.div>
      </div>
    </motion.div>
  );
}