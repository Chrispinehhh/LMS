// frontend/app/(dashboard)/fleet/drivers/page.tsx
"use client";

import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import { Driver, PaginatedResponse } from "@/types";
import { DriverForm } from "./DriverForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from "lucide-react";

// Define the possible response types for drivers endpoint
type DriversResponse =
  | Driver[]
  | PaginatedResponse<Driver>;

// Helper function to extract drivers from different response formats
function extractDrivers(data: DriversResponse | null): Driver[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if ('results' in data && Array.isArray(data.results)) return data.results;
  return [];
}

export default function DriversPage() {
  const [modalOpen, setModalOpen] = useState(false);

  // Try different possible endpoints for drivers
  const { data: driversResponse, error, isLoading, mutate } = useApi<DriversResponse>('/transportation/drivers/');
  const { backendUser } = useAuth();

  // Extract drivers safely
  const drivers = extractDrivers(driversResponse);

  if (backendUser?.role !== 'ADMIN' && backendUser?.role !== 'MANAGER') {
    return <p className="p-6">You do not have permission to view this page.</p>;
  }

  const handleFormSuccess = () => {
    setModalOpen(false);
    mutate(); // Re-fetch the drivers list
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600 font-semibold">Failed to load drivers.</div>
        <div className="text-sm text-gray-600 mt-2">
          Error: {error.message}
          <br />
          Endpoint attempted: /transportation/drivers/
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-400">Fleet - Drivers</h1>
          <p className="text-blue-600 dark:text-blue-300 mt-2">
            Manage your delivery drivers and their profiles
            {drivers.length > 0 && (
              <span> ({drivers.length} active)</span>
            )}
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>Add New Driver</Button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-700/50">
              <TableHead className="text-gray-900 dark:text-white font-semibold">Driver Name</TableHead>
              <TableHead className="text-gray-900 dark:text-white font-semibold">Email</TableHead>
              <TableHead className="text-gray-900 dark:text-white font-semibold">Phone Number</TableHead>
              <TableHead className="text-gray-900 dark:text-white font-semibold">License Number</TableHead>
              <TableHead className="text-gray-900 dark:text-white font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex justify-center items-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 dark:border-purple-400"></div>
                    <span className="text-gray-600 dark:text-gray-400">Loading drivers...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : drivers.length > 0 ? (
              drivers.map((driver) => (
                <TableRow key={driver.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <TableCell className="font-medium text-gray-900 dark:text-white">
                    {driver.user.first_name} {driver.user.last_name}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">{driver.user.email}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">{driver.phone_number}</TableCell>
                  <TableCell className="font-mono text-sm text-gray-700 dark:text-gray-300">
                    {driver.license_number}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700">
                      Active
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="text-center space-y-3">
                    <User className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No drivers found</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Click &quot;Add New Driver&quot; to create your first driver profile.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Driver</DialogTitle>
            <DialogDescription>
              This will create a new user account with the &quot;DRIVER&quot; role and their associated driver profile.
            </DialogDescription>
          </DialogHeader>
          <DriverForm onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}