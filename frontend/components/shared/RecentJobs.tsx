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

export function RecentJobs() {
  const { data: jobs, isLoading } = useApi<Job[]>('/jobs/?limit=5');

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Recent Jobs</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">View</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={3} className="text-center">Loading...</TableCell></TableRow>
          ) : jobs?.map((job) => (
            <TableRow key={job.id}>
              <TableCell>
                <div className="font-medium">{job.customer.first_name} {job.customer.last_name}</div>
                <div className="text-sm text-gray-500">{job.customer.email}</div>
              </TableCell>
              <TableCell>{job.status}</TableCell>
              <TableCell className="text-right">
                <Link href={`/jobs/${job.id}`} passHref>
                  <Button variant="outline" size="sm">Details</Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}