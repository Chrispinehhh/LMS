// frontend/app/(dashboard)/jobs/[id]/page.tsx
"use client";

import { useApi } from "@/hooks/useApi";
import { Job, Vehicle, Driver, Shipment, PaginatedResponse } from "@/types";
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from "react-hot-toast";
import apiClient from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Truck, Calendar, MapPin, Phone, Package, CheckCircle, XCircle, Edit, LucideIcon } from "lucide-react";

// Define response types for API calls
type ShipmentsResponse = Shipment[] | PaginatedResponse<Shipment>;
type VehiclesResponse = Vehicle[] | PaginatedResponse<Vehicle>;
type DriversResponse = Driver[] | PaginatedResponse<Driver>;

// Helper function to extract data from different response formats
function extractData<T>(data: T[] | PaginatedResponse<T> | null): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if ('results' in data && Array.isArray(data.results)) return data.results;
  return [];
}

// Reusable sub-component for info cards
const InfoCard = ({ title, children, icon: Icon }: { 
  title: string; 
  children: React.ReactNode; 
  icon?: LucideIcon;
}) => (
  <div className="bg-white dark:bg-gray-800 p-6 shadow rounded-lg border border-gray-200 dark:border-gray-700">
    <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-600">
      {Icon && <Icon className="w-5 h-5 text-emerald-600" />}
      <h2 className="text-xl font-semibold text-purple-700 dark:text-purple-400">{title}</h2>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

// Reusable sub-component for rows within info cards
const InfoRow = ({ label, value, icon: Icon }: { 
  label: string; 
  value: React.ReactNode; 
  icon?: LucideIcon;
}) => (
  <div className="flex justify-between items-start text-sm">
    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
      {Icon && <Icon className="w-4 h-4" />}
      <p>{label}</p>
    </div>
    <p className="font-medium text-right text-gray-900 dark:text-white max-w-[60%]">{value}</p>
  </div>
);

// Define the status type for TypeScript
type StatusType = 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';

// Status badge component with proper TypeScript typing
const StatusBadge = ({ status }: { status: string }) => {
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

  // Type guard to check if status is valid
  const isValidStatus = (s: string): s is StatusType => {
    return s in statusStyles;
  };

  const badgeStatus = isValidStatus(status) ? status : 'PENDING';

  return (
    <Badge variant="outline" className={`${statusStyles[badgeStatus]} border font-medium`}>
      {statusLabels[badgeStatus]}
    </Badge>
  );
};

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  
  // Data fetching hooks
  const { data: job, error: jobError, isLoading: jobLoading, mutate: mutateJob } = useApi<Job>(jobId ? `/jobs/${jobId}/` : null);
  const { data: shipmentsResponse, error: shipmentError, isLoading: shipmentLoading, mutate: mutateShipments } = useApi<ShipmentsResponse>(jobId ? `/transportation/shipments/?job_id=${jobId}` : null);
  const { data: vehiclesResponse } = useApi<VehiclesResponse>('/transportation/vehicles/?status=AVAILABLE');
  const { data: driversResponse } = useApi<DriversResponse>('/transportation/drivers/');

  // Extract data from responses
  const shipments = extractData(shipmentsResponse);
  const vehicles = extractData(vehiclesResponse);
  const drivers = extractData(driversResponse);

  // State for the assignment form - use "none" instead of empty string
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("none");
  const [selectedDriverId, setSelectedDriverId] = useState<string>("none");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived state
  const currentShipment = shipments && shipments.length > 0 ? shipments[0] : null;
  const isAssigned = !!(currentShipment && currentShipment.driver && currentShipment.vehicle);
  const canEditAssignment = currentShipment && 
    (currentShipment.status === 'PENDING' || currentShipment.status === 'ASSIGNED');

  // Sync form state with fetched data
  useEffect(() => {
    if (currentShipment) {
      setSelectedDriverId(currentShipment.driver?.id || "none");
      setSelectedVehicleId(currentShipment.vehicle?.id || "none");
    } else {
      setSelectedDriverId("none");
      setSelectedVehicleId("none");
    }
    // Auto-enter edit mode if unassigned
    setIsEditing(!isAssigned); 
  }, [currentShipment, isAssigned]);

  // Handler for assigning job
  const handleAssign = async () => {
    if (!jobId) {
      toast.error("Job ID not found.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Convert "none" to null for the backend
      const driverIdPayload = selectedDriverId === "none" ? null : selectedDriverId;
      const vehicleIdPayload = selectedVehicleId === "none" ? null : selectedVehicleId;

      if (currentShipment) {
        // Update existing shipment
        await apiClient.patch(`/transportation/shipments/${currentShipment.id}/`, {
          driver_id: driverIdPayload,
          vehicle_id: vehicleIdPayload,
          status: (driverIdPayload && vehicleIdPayload) ? 'ASSIGNED' : 'PENDING',
        });
      } else {
        // Create new shipment
        await apiClient.post('/transportation/shipments/', {
          job_id: jobId,
          driver_id: driverIdPayload,
          vehicle_id: vehicleIdPayload,
          status: (driverIdPayload && vehicleIdPayload) ? 'ASSIGNED' : 'PENDING',
        });
      }
      
      toast.success("Assignment updated successfully!");
      setIsEditing(false);
      mutateJob();
      mutateShipments();
    } catch (err: unknown) {
      console.error("Failed to update assignment:", err);
      let errorMessage = "Failed to update assignment.";
      
      if (err instanceof AxiosError) {
        if (err.response?.data?.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for marking job as delivered
  const handleMarkDelivered = async () => {
    if (!currentShipment) return;
    
    setIsSubmitting(true);
    try {
      await apiClient.patch(`/transportation/shipments/${currentShipment.id}/`, {
        status: 'DELIVERED',
      });
      toast.success("Job marked as delivered!");
      mutateJob();
      mutateShipments();
    } catch (err: unknown) {
      console.error("Failed to mark as delivered:", err);
      toast.error("Failed to update status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for marking job as failed
  const handleMarkFailed = async () => {
    if (!currentShipment) return;
    
    setIsSubmitting(true);
    try {
      await apiClient.patch(`/transportation/shipments/${currentShipment.id}/`, {
        status: 'FAILED',
      });
      toast.success("Job marked as failed!");
      mutateJob();
      mutateShipments();
    } catch (err: unknown) {
      console.error("Failed to mark as failed:", err);
      toast.error("Failed to update status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading and error states
  const isLoading = jobLoading || shipmentLoading;
  const error = jobError || shipmentError;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading job details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-4">
        <div className="text-red-600 dark:text-red-400 font-semibold">Failed to load job details.</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Error: {error.message}
        </div>
        <Link href="/jobs" className="inline-flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Jobs</span>
        </Link>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-6 space-y-4">
        <div className="text-red-600 dark:text-red-400 font-semibold">Job not found.</div>
        <Link href="/jobs" className="inline-flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Jobs</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/jobs" className="inline-flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 hover:underline mb-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Jobs</span>
          </Link>
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-400">
              Job Details
            </h1>
            <StatusBadge status={currentShipment?.status || job.status} />
          </div>
          <p className="text-blue-600 dark:text-blue-300 mt-2">Job ID: {job.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <InfoCard title="Cargo & Service Details" icon={Package}>
            <InfoRow label="Service Type" value={job.service_type.replace(/_/g, ' ')} />
            <InfoRow label="Requested Pickup" value={new Date(job.requested_pickup_date).toLocaleString()} icon={Calendar} />
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Description</p>
              <p className="font-medium text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                {job.cargo_description}
              </p>
            </div>
          </InfoCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoCard title="Pickup Details" icon={MapPin}>
              <InfoRow label="Address" value={`${job.pickup_address}, ${job.pickup_city}`} />
              <InfoRow label="Contact" value={job.pickup_contact_person} icon={User} />
              <InfoRow label="Phone" value={job.pickup_contact_phone} icon={Phone} />
            </InfoCard>
            
            <InfoCard title="Delivery Details" icon={MapPin}>
              <InfoRow label="Address" value={`${job.delivery_address}, ${job.delivery_city}`} />
              <InfoRow label="Contact" value={job.delivery_contact_person} icon={User} />
              <InfoRow label="Phone" value={job.delivery_contact_phone} icon={Phone} />
            </InfoCard>
          </div>

          <InfoCard title="Customer Information" icon={User}>
            <InfoRow label="Name" value={`${job.customer.first_name} ${job.customer.last_name}`} />
            <InfoRow label="Email" value={job.customer.email} />
            <InfoRow label="Type" value={job.customer.customer_type?.replace('_', ' ')} />
          </InfoCard>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <InfoCard title="Shipment Assignment" icon={Truck}>
            {currentShipment ? (
              <>
                {/* View Mode */}
                {!isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <InfoRow label="Status" value={<StatusBadge status={currentShipment.status} />} />
                      <InfoRow label="Driver" value={
                        currentShipment.driver 
                          ? `${currentShipment.driver.user.first_name} ${currentShipment.driver.user.last_name}`
                          : "Not assigned"
                      } icon={User} />
                      <InfoRow label="Vehicle" value={
                        currentShipment.vehicle 
                          ? `${currentShipment.vehicle.license_plate} (${currentShipment.vehicle.make} ${currentShipment.vehicle.model})`
                          : "Not assigned"
                      } icon={Truck} />
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {canEditAssignment && (
                        <Button 
                          variant="outline" 
                          className="w-full border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Assignment
                        </Button>
                      )}
                      
                      {currentShipment.status === 'ASSIGNED' && (
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            onClick={handleMarkDelivered} 
                            disabled={isSubmitting}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Delivered
                          </Button>
                          <Button 
                            onClick={handleMarkFailed} 
                            disabled={isSubmitting}
                            variant="destructive"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Failed
                          </Button>
                        </div>
                      )}

                      {(currentShipment.status === 'DELIVERED' || currentShipment.status === 'FAILED') && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                            {currentShipment.status === 'DELIVERED' 
                              ? '✅ Delivery completed successfully' 
                              : '❌ Delivery failed - requires attention'
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Edit Mode */
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Driver</label>
                      <Select onValueChange={setSelectedDriverId} value={selectedDriverId}>
                        <SelectTrigger className="bg-white dark:bg-gray-700">
                          <SelectValue placeholder="Select a driver" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Not assigned</SelectItem>
                          {drivers?.map(d => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.user.first_name} {d.user.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Vehicle</label>
                      <Select onValueChange={setSelectedVehicleId} value={selectedVehicleId}>
                        <SelectTrigger className="bg-white dark:bg-gray-700">
                          <SelectValue placeholder="Select a vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Not assigned</SelectItem>
                          {vehicles?.map(v => (
                            <SelectItem key={v.id} value={v.id}>
                              {v.make} {v.model} ({v.license_plate})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="ghost" className="flex-1" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleAssign} 
                        disabled={isSubmitting} 
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        {isSubmitting ? "Saving..." : "Save Assignment"}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* No Shipment - Create Assignment */
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  This job is not yet assigned to a driver and vehicle.
                </p>
                
                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Driver</label>
                  <Select onValueChange={setSelectedDriverId} value={selectedDriverId}>
                    <SelectTrigger className="bg-white dark:bg-gray-700">
                      <SelectValue placeholder="Select a driver" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not assigned</SelectItem>
                      {drivers?.map(d => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.user.first_name} {d.user.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Vehicle</label>
                  <Select onValueChange={setSelectedVehicleId} value={selectedVehicleId}>
                    <SelectTrigger className="bg-white dark:bg-gray-700">
                      <SelectValue placeholder="Select a vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not assigned</SelectItem>
                      {vehicles?.map(v => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.make} {v.model} ({v.license_plate})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleAssign} 
                  disabled={isSubmitting} 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isSubmitting ? "Creating..." : "Create Assignment"}
                </Button>
              </div>
            )}
          </InfoCard>
        </div>
      </div>
    </div>
  );
}