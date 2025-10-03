// frontend/app/(dashboard)/fleet/vehicles/page.tsx
"use client";

import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import { Vehicle } from "@/types";
import { VehicleForm } from "./VehicleForm";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api";
import { toast } from "react-hot-toast";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const StatusBadge = ({ status }: { status: Vehicle['status'] }) => {
  const statusStyles = {
    AVAILABLE: "bg-green-100 text-green-800",
    IN_USE: "bg-blue-100 text-blue-800",
    MAINTENANCE: "bg-yellow-100 text-yellow-800",
  };
  return <Badge className={statusStyles[status]}>{status.replace('_', ' ')}</Badge>;
};

export default function VehiclesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const { data: vehicles, error, isLoading, mutate } = useApi<Vehicle[]>('/vehicles/');
  const { backendUser } = useAuth();

  if (backendUser?.role !== 'ADMIN' && backendUser?.role !== 'MANAGER') {
    return <p className="p-6">You do not have permission to view this page.</p>;
  }

  const handleCreate = () => {
    setSelectedVehicle(null);
    setModalOpen(true);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setModalOpen(true);
  };

  const handleDelete = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedVehicle) return;
    try {
      await apiClient.delete(`/vehicles/${selectedVehicle.id}/`);
      toast.success("Vehicle deleted successfully!");
      mutate();
      setDeleteAlertOpen(false);
    } catch (error) {
      toast.error("Failed to delete vehicle.");
      console.error("Failed to delete vehicle", error);
    }
  };

  const handleFormSuccess = () => {
    toast.success(`Vehicle successfully ${selectedVehicle ? 'updated' : 'created'}.`);
    setModalOpen(false);
    mutate();
  };

  if (error) return <div className="p-6">Failed to load vehicles.</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Fleet - Vehicles</h1>
        <Button onClick={handleCreate}>Add New Vehicle</Button>
      </div>
      
      <div className="bg-white shadow rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>License Plate</TableHead>
              <TableHead>Make & Model</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
            ) : vehicles?.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-mono">{vehicle.license_plate}</TableCell>
                <TableCell className="font-medium">{vehicle.make} {vehicle.model}</TableCell>
                <TableCell><StatusBadge status={vehicle.status} /></TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="sm">...</Button></DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleEdit(vehicle)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(vehicle)} className="text-red-600">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
          </DialogHeader>
          <VehicleForm onSuccess={handleFormSuccess} initialData={selectedVehicle} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the vehicle with license plate &quot;{selectedVehicle?.license_plate}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}