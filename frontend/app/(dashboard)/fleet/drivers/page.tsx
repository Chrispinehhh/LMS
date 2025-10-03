// frontend/app/(dashboard)/fleet/drivers/page.tsx
"use client";

import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import { Driver } from "@/types";
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

export default function DriversPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: drivers, error, isLoading, mutate } = useApi<Driver[]>('/drivers/');
  const { backendUser } = useAuth();

  if (backendUser?.role !== 'ADMIN' && backendUser?.role !== 'MANAGER') {
    return <p className="p-6">You do not have permission to view this page.</p>;
  }
  
  const handleFormSuccess = () => {
    setModalOpen(false);
    mutate(); // Re-fetch the drivers list
  };

  if (error) return <div className="p-6">Failed to load drivers.</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Fleet - Drivers</h1>
        <Button onClick={() => setModalOpen(true)}>Add New Driver</Button>
      </div>
      
      <div className="bg-white shadow rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Driver Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>License Number</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">Loading drivers...</TableCell>
              </TableRow>
            ) : drivers && drivers.length > 0 ? (
              drivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium">{driver.user.first_name} {driver.user.last_name}</TableCell>
                  <TableCell>{driver.user.email}</TableCell>
                  <TableCell>{driver.phone_number}</TableCell>
                  <TableCell>{driver.license_number}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No drivers found. Click &quot;Add New Driver&quot; to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
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