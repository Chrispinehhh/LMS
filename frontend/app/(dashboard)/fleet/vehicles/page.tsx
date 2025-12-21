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
import { MoreHorizontal, Truck } from "lucide-react";

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
    AVAILABLE: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
    IN_USE: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
    MAINTENANCE: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700",
  };
  return <Badge variant="outline" className={`${statusStyles[status]} border`}>{status.replace('_', ' ')}</Badge>;
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
        <div className="text-red-600 dark:text-red-400 font-semibold">Failed to load vehicles.</div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Error: {error.message}
          <br />
          Endpoint: /transportation/vehicles/
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-400">Fleet - Vehicles</h1>
          <p className="text-blue-600 dark:text-blue-300 mt-2">
            Manage your delivery vehicles and their status
            {vehiclesResponse && 'count' in vehiclesResponse && (
              <span> ({vehicles.length} of {vehiclesResponse.count} total)</span>
            )}
          </p>
        </div>
        <Button onClick={handleCreate}>Add New Vehicle</Button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-700/50">
              <TableHead className="text-gray-900 dark:text-white font-semibold">License Plate</TableHead>
              <TableHead className="text-gray-900 dark:text-white font-semibold">Make & Model</TableHead>
              <TableHead className="text-gray-900 dark:text-white font-semibold">Year</TableHead>
              <TableHead className="text-gray-900 dark:text-white font-semibold">Capacity (kg)</TableHead>
              <TableHead className="text-gray-900 dark:text-white font-semibold">Status</TableHead>
              <TableHead className="text-right text-gray-900 dark:text-white font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex justify-center items-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 dark:border-purple-400"></div>
                    <span className="text-gray-600 dark:text-gray-400">Loading vehicles...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : vehicles.length > 0 ? (
              vehicles.map((vehicle) => (
                <TableRow key={vehicle.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <TableCell className="font-mono font-medium text-gray-900 dark:text-white">{vehicle.license_plate}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">{vehicle.make} {vehicle.model}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">{vehicle.year}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">{vehicle.capacity_kg} kg</TableCell>
                  <TableCell><StatusBadge status={vehicle.status} /></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(vehicle)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(vehicle)}
                          className="text-red-600 focus:text-red-600 dark:text-red-400"
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
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="text-center space-y-3">
                    <Truck className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No vehicles found</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
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