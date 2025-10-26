// frontend/app/(dashboard)/fleet/vehicles/page.tsx
"use client";

import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import { Vehicle, PaginatedResponse } from "@/types";
import { VehicleForm } from "./VehicleForm";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";

// Define the possible response types for vehicles endpoint
type VehiclesResponse = 
  | Vehicle[]
  | PaginatedResponse<Vehicle>;

// Helper function to extract vehicles from different response formats
function extractVehicles(data: VehiclesResponse | null): Vehicle[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if ('results' in data && Array.isArray(data.results)) return data.results;
  return [];
}

const StatusBadge = ({ status }: { status: Vehicle['status'] }) => {
  const statusStyles = {
    AVAILABLE: "bg-green-100 text-green-800 hover:bg-green-100",
    IN_USE: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    MAINTENANCE: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  };
  return <Badge variant="secondary" className={statusStyles[status]}>{status.replace('_', ' ')}</Badge>;
};

export default function VehiclesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // CORRECT ENDPOINT: /transportation/vehicles/ (from apps.transportation.urls)
  const { data: vehiclesResponse, error, isLoading, mutate } = useApi<VehiclesResponse>('/transportation/vehicles/');
  const { backendUser } = useAuth();

  // Extract vehicles safely
  const vehicles = extractVehicles(vehiclesResponse);

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
      // CORRECT ENDPOINT: /transportation/vehicles/{id}/
      await apiClient.delete(`/transportation/vehicles/${selectedVehicle.id}/`);
      toast.success("Vehicle deleted successfully!");
      mutate();
      setDeleteAlertOpen(false);
      setSelectedVehicle(null);
    } catch (err: unknown) {
      console.error("Failed to delete vehicle:", err);
      
      let errorMessage = "Failed to delete vehicle.";
      if (err instanceof AxiosError) {
        if (err.response?.data?.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        }
      }
      
      toast.error(errorMessage);
    }
  };

  const handleFormSuccess = () => {
    toast.success(`Vehicle ${selectedVehicle ? 'updated' : 'created'} successfully!`);
    setModalOpen(false);
    setSelectedVehicle(null);
    mutate();
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600 font-semibold">Failed to load vehicles.</div>
        <div className="text-sm text-gray-600 mt-2">
          Error: {error.message}
          <br />
          Endpoint: /transportation/vehicles/
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Fleet - Vehicles</h1>
          <p className="text-gray-600 mt-1">
            Manage your delivery vehicles and their status
            {vehiclesResponse && 'count' in vehiclesResponse && (
              <span> ({vehicles.length} of {vehiclesResponse.count} total)</span>
            )}
          </p>
        </div>
        <Button onClick={handleCreate}>Add New Vehicle</Button>
      </div>
      
      <div className="bg-white shadow rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>License Plate</TableHead>
              <TableHead>Make & Model</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Capacity (kg)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Loading vehicles...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : vehicles.length > 0 ? (
              vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-mono font-medium">{vehicle.license_plate}</TableCell>
                  <TableCell>{vehicle.make} {vehicle.model}</TableCell>
                  <TableCell>{vehicle.year}</TableCell>
                  <TableCell>{vehicle.capacity_kg} kg</TableCell>
                  <TableCell><StatusBadge status={vehicle.status} /></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(vehicle)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(vehicle)} 
                          className="text-red-600 focus:text-red-600"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="text-center">
                    <p className="text-gray-500">No vehicles found.</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Click &quot;Add New Vehicle&quot; to create your first vehicle.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{selectedVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
          </DialogHeader>
          <VehicleForm 
            onSuccess={handleFormSuccess} 
            initialData={selectedVehicle} 
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the vehicle 
              with license plate &quot;{selectedVehicle?.license_plate}&quot; 
              ({selectedVehicle?.make} {selectedVehicle?.model}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedVehicle(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Vehicle
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}