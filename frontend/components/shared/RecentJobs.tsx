// frontend/components/shared/RecentJobs.tsx
"use client";

import { useApi } from "@/hooks/useApi";
import { Job } from "@/types";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface JobsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Job[];
}

export function RecentJobs() {
  const { data: response, isLoading, error } = useApi<JobsResponse>('/jobs/?limit=5');
  
  // Extract jobs from the paginated response
  const jobs = response?.results || [];

  // Helper function to get status styles
  const getStatusStyles = (status: Job['status']) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'IN_TRANSIT':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to format status display
  const formatStatus = (status: Job['status']) => {
    return status.replace('_', ' ');
  };

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Recent Jobs</h2>
        <div className="text-center text-red-500 py-4">
          Failed to load jobs. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Recent Jobs</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Service Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">View</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                </div>
              </TableCell>
            </TableRow>
          ) : jobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                No recent jobs found
              </TableCell>
            </TableRow>
          ) : (
            jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>
                  <div className="font-medium">
                    {job.customer?.first_name} {job.customer?.last_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {job.customer?.email || 'No email'}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="capitalize">
                    {job.service_type?.toLowerCase().replace(/_/g, ' ') || 'N/A'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles(job.status)}`}>
                    {formatStatus(job.status)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/jobs/${job.id}`} passHref>
                    <Button variant="outline" size="sm">Details</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}