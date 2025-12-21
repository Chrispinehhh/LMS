"use client";

import { useState } from "react";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import { Job, PaginatedResponse } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Eye,
  Calendar,
  User,
  Package,
  Truck,
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

type JobsResponse = Job[] | PaginatedResponse<Job>;

function extractJobs(data: JobsResponse | null): Job[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if ('results' in data && Array.isArray(data.results)) return data.results;
  return [];
}

const STATUS_TABS = [
  { id: 'ALL', label: 'All Jobs' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'IN_TRANSIT', label: 'In Transit' },
  { id: 'DELIVERED', label: 'Delivered' },
];

export default function JobsPage() {
  const { data: jobsResponse, error, isLoading } = useApi<JobsResponse>('/jobs/');
  const jobs = extractJobs(jobsResponse);

  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Filter & Sort Logic
  const filteredJobs = jobs.filter(job => {
    const matchesTab = activeTab === 'ALL' || job.status === activeTab;
    const matchesSearch =
      job.customer?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.job_number?.toString().includes(searchQuery) ||
      job.id.includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;

    // Simple sort logic for demo - enhance as needed
    const aValue = (a as any)[key];
    const bValue = (b as any)[key];

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
      case 'IN_TRANSIT': return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
      case 'PENDING': return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
      case 'FAILED': return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      default: return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
    }
  };

  if (error) return <div className="p-6 text-red-500">Failed to load jobs.</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            Job Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage shipments, assignments, and tracking.
          </p>
        </div>
        <Link href="/jobs/create">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" />
            Create New Job
          </Button>
        </Link>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center glass-card p-2 rounded-xl">
        {/* Tabs */}
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-full md:w-auto">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 w-full md:w-auto
                ${activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-border/50 shadow-xl">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 dark:bg-gray-800/50 hover:bg-transparent">
              <TableHead className="w-[100px] font-semibold">Job ID</TableHead>
              <TableHead className="font-semibold cursor-pointer group" onClick={() => handleSort('customer')}>
                <div className="flex items-center gap-1">
                  Customer
                  <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                </div>
              </TableHead>
              <TableHead className="font-semibold">Type & Metric</TableHead>
              <TableHead className="font-semibold">Driver</TableHead>
              <TableHead className="font-semibold">Pickup</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="text-right font-semibold">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <div className="h-12 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
                  </TableCell>
                </TableRow>
              ))
            ) : sortedJobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                  No jobs found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              <AnimatePresence mode="popLayout">
                {sortedJobs.map((job, i) => (
                  <motion.tr
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                    className="group hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors border-b border-border/50 last:border-0"
                  >
                    {/* Job ID */}
                    <TableCell className="font-mono text-xs font-medium text-muted-foreground">
                      #{job.job_number || job.id.slice(0, 6)}
                    </TableCell>

                    {/* Customer */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {job.customer.first_name?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">{job.customer.first_name} {job.customer.last_name}</p>
                          <p className="text-xs text-muted-foreground">{job.customer.email}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Type */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium capitalize">
                          {job.job_type === 'RESIDENTIAL' ? 'Residential Move' : 'Commercial Freight'}
                        </span>
                        <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded w-fit">
                          {job.job_type === 'RESIDENTIAL'
                            ? `${job.room_count || 0} Rooms • ${job.volume_cf || 0} cf`
                            : `${job.pallet_count || 0} Pallets • ${job.weight_lbs || 0} lbs`}
                        </span>
                      </div>
                    </TableCell>

                    {/* Driver */}
                    <TableCell>
                      {job.assigned_driver ? (
                        <div className="flex items-center gap-2">
                          <Truck className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-sm">{job.assigned_driver}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Unassigned</span>
                      )}
                    </TableCell>

                    {/* Pickup Date */}
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(job.requested_pickup_date), 'MMM d, yyyy')}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
                        {job.status.replace('_', ' ')}
                      </span>
                    </TableCell>

                    {/* Action */}
                    <TableCell className="text-right">
                      <Link href={`/jobs/${job.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-secondary">
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </Link>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}