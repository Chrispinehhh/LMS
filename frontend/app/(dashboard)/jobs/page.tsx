// frontend/app/(dashboard)/jobs/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import { Job, PaginatedResponse } from "@/types";
import JobForm from "./JobForm"; 
import { Button } from "@/components/ui/button";
import { 
    Dialog, 
    DialogContent, 
    DialogDescription,
    DialogHeader, 
    DialogTitle 
} from "@/components/ui/dialog";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { Plus, Eye, Calendar, User, Package } from "lucide-react";

// Define the possible response types for jobs endpoint
type JobsResponse = 
  | Job[]
  | PaginatedResponse<Job>;

// Helper function to extract jobs from different response formats
function extractJobs(data: JobsResponse | null): Job[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if ('results' in data && Array.isArray(data.results)) return data.results;
  return [];
}

// Define the status type for TypeScript
type StatusType = 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';

// Updated StatusBadge component with proper TypeScript typing
const StatusBadge = ({ status }: { status: Job['status'] }) => {
  const statusStyles: Record<StatusType, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700",
    ASSIGNED: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
    IN_TRANSIT: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700",
    DELIVERED: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
    FAILED: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
  };
  
  const statusLabels: Record<StatusType, string> = {
    PENDING: "Pending",
    ASSIGNED: "Assigned",
    IN_TRANSIT: "In Transit",
    DELIVERED: "Delivered",
    FAILED: "Failed",
  };

  return (
    <Badge 
      variant="outline" 
      className={`${statusStyles[status]} border font-medium`}
    >
      {statusLabels[status]}
    </Badge>
  );
};

export default function JobsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: jobsResponse, error, isLoading, mutate } = useApi<JobsResponse>('/jobs/');

  // Extract jobs safely
  const jobs = extractJobs(jobsResponse);
  
  const handleFormSuccess = () => {
    toast.success("Job created successfully!");
    setModalOpen(false);
    mutate();
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600 dark:text-red-400 font-semibold">Failed to load jobs.</div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Error: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-400">
            Job Management
          </h1>
          <p className="text-blue-600 dark:text-blue-300 mt-2">
            Manage transportation jobs and assignments
            {jobsResponse && 'count' in jobsResponse && (
              <span> ({jobs.length} of {jobsResponse.count} total)</span>
            )}
          </p>
        </div>
        <Button 
          onClick={() => setModalOpen(true)} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Job
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Jobs</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{jobs.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Delivered</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {jobs.filter(job => job.status === 'DELIVERED').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Package className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">In Transit</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {jobs.filter(job => job.status === 'IN_TRANSIT').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Package className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {jobs.filter(job => job.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Jobs Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-700/50">
              <TableHead className="text-gray-900 dark:text-white font-semibold">Job ID</TableHead>
              <TableHead className="text-gray-900 dark:text-white font-semibold">Customer</TableHead>
              <TableHead className="text-gray-900 dark:text-white font-semibold">Service Type</TableHead>
              <TableHead className="text-gray-900 dark:text-white font-semibold">Pickup Date</TableHead>
              <TableHead className="text-gray-900 dark:text-white font-semibold">Status</TableHead>
              <TableHead className="text-right text-gray-900 dark:text-white font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex justify-center items-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                    <span className="text-gray-600 dark:text-gray-400">Loading jobs...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : jobs.length > 0 ? (
              jobs.map((job) => (
                <TableRow key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <TableCell className="font-mono text-sm text-gray-700 dark:text-gray-300">
                    {job.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {job.customer.first_name} {job.customer.last_name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{job.customer.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {job.service_type.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {new Date(job.requested_pickup_date).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={job.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/jobs/${job.id}`} passHref>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="text-center space-y-3">
                    <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">No jobs found</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        Get started by creating your first transportation job.
                      </p>
                    </div>
                    <Button 
                      onClick={() => setModalOpen(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Job
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Job Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-purple-700 dark:text-purple-400">Create New Job</DialogTitle>
            <DialogDescription className="text-blue-600 dark:text-blue-300">
              Fill in the details below to create a new transportation job.
            </DialogDescription>
          </DialogHeader>
          <JobForm onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}