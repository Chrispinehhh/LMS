// frontend/app/(dashboard)/jobs/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import { Job } from "@/types";
import { JobForm } from "./JobForm";
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
import { toast } from "react-hot-toast";

export default function JobsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: jobs, error, isLoading, mutate } = useApi<Job[]>('/jobs/');
  const { backendUser } = useAuth();

  if (backendUser?.role !== 'ADMIN' && backendUser?.role !== 'MANAGER') {
    return <p className="p-6">You do not have permission to view this page.</p>;
  }
  
  const handleFormSuccess = () => {
    toast.success("Job created successfully!");
    setModalOpen(false);
    mutate(); // Re-fetch the job list to show the new entry
  };

  if (error) return <div className="p-6">Failed to load jobs.</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Job Management</h1>
        <Button onClick={() => setModalOpen(true)}>Add New Job</Button>
      </div>
      
      <div className="bg-white shadow rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Loading jobs...</TableCell>
              </TableRow>
            ) : jobs && jobs.length > 0 ? (
              jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-mono text-sm">{job.id.substring(0, 8)}...</TableCell>
                  <TableCell>{job.customer.first_name} {job.customer.last_name}</TableCell>
                  <TableCell>{job.service_type.replace(/_/g, ' ')}</TableCell>
                  <TableCell>{job.status}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/jobs/${job.id}`} passHref>
                      <Button variant="outline" size="sm">View Details</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">No jobs found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal for creating a new job */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Job</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new transportation job. Click &apos;Create Job&apos; when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <JobForm onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}