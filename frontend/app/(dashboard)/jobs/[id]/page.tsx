// frontend/app/(dashboard)/jobs/[id]/page.tsx
"use client";

import { useApi } from "@/hooks/useApi";
import { Job, Vehicle, Driver, Shipment } from "@/types";
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from "react-hot-toast";
import apiClient from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";

const InfoCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="bg-white p-6 shadow rounded-lg">
        <h2 className="text-xl font-semibold border-b pb-2 mb-4">{title}</h2>
        <div className="space-y-3">{children}</div>
    </div>
);

const InfoRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="flex justify-between items-start text-sm">
        <p className="text-gray-500">{label}</p>
        <p className="font-medium text-right">{value}</p>
    </div>
);

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  
  const swrOptions = { revalidateOnFocus: true, revalidateOnMount: true };

  const { data: job, error: jobError, isLoading: jobLoading, mutate: mutateJob } = useApi<Job>(jobId ? `/jobs/${jobId}/` : null, swrOptions);
  const { data: shipments, error: shipmentError, isLoading: shipmentLoading, mutate: mutateShipments } = useApi<Shipment[]>(jobId ? `/shipments/?job_id=${jobId}` : null, swrOptions);
  const { data: vehicles, isLoading: vehiclesLoading } = useApi<Vehicle[]>('/vehicles/?status=AVAILABLE', swrOptions);
  const { data: drivers, isLoading: driversLoading } = useApi<Driver[]>('/drivers/', swrOptions);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  const currentShipment = shipments && shipments.length > 0 ? shipments[0] : null;
  const isAssigned = !!(currentShipment && currentShipment.driver && currentShipment.vehicle);

  useEffect(() => {
    if (currentShipment) {
      setSelectedDriverId(currentShipment.driver?.id || "");
      setSelectedVehicleId(currentShipment.vehicle?.id || "");
    } else {
      setSelectedDriverId("");
      setSelectedVehicleId("");
    }
    setIsEditing(!isAssigned);
  }, [currentShipment, isAssigned]);

  const handleAssign = async () => {
    if (!currentShipment) {
        toast.error("Shipment data not found.");
        return;
    }
    
    // --- THIS IS THE FIX ---
    const driverIdPayload = selectedDriverId === "NONE" ? null : selectedDriverId || null;
    const vehicleIdPayload = selectedVehicleId === "NONE" ? null : selectedVehicleId || null;

    const newStatus = (driverIdPayload && vehicleIdPayload) ? 'IN_TRANSIT' : 'PENDING';

    try {
      await apiClient.patch(`/shipments/${currentShipment.id}/`, {
        driver_id: driverIdPayload,
        vehicle_id: vehicleIdPayload,
        status: newStatus,
      });
      toast.success("Assignment updated successfully!");
      setIsEditing(false);
      mutateJob();
      mutateShipments();
    } catch (error) {
      toast.error("Failed to update assignment.");
      console.error(error);
    }
  };

  const isLoading = jobLoading || shipmentLoading;
  const error = jobError || shipmentError;

  if (isLoading) return <div className="p-6">Loading job details...</div>;
  if (error) return <div className="p-6">Failed to load job details.</div>;
  if (!job) return <div className="p-6">Job not found.</div>;

  return (
    <div>
      <div className="mb-6">
        <Link href="/jobs" className="text-blue-600 hover:underline">&larr; Back to All Jobs</Link>
        <div className="flex justify-between items-center mt-2">
            <h1 className="text-3xl font-bold">Job Details</h1>
            <span className="font-medium capitalize">{ (currentShipment?.status || job.status).toLowerCase().replace('_', ' ') }</span>
        </div>
        <p className="text-gray-500 text-sm mt-1">Job ID: {job.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <InfoCard title="Cargo & Service Details"><InfoRow label="Service Type" value={job.service_type.replace(/_/g, ' ')} /><InfoRow label="Requested Pickup" value={new Date(job.requested_pickup_date).toLocaleString()} /><div><p className="text-gray-500 text-sm">Description</p><p className="font-medium mt-1 text-sm">{job.cargo_description}</p></div></InfoCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><InfoCard title="Pickup Details"><InfoRow label="Address" value={`${job.pickup_address}, ${job.pickup_city}`} /><InfoRow label="Contact" value={job.pickup_contact_person} /><InfoRow label="Phone" value={job.pickup_contact_phone} /></InfoCard><InfoCard title="Delivery Details"><InfoRow label="Address" value={`${job.delivery_address}, ${job.delivery_city}`} /><InfoRow label="Contact" value={job.delivery_contact_person} /><InfoRow label="Phone" value={job.delivery_contact_phone} /></InfoCard></div>
            <InfoCard title="Customer Information"><InfoRow label="Name" value={`${job.customer.first_name} ${job.customer.last_name}`} /><InfoRow label="Email" value={job.customer.email} /><InfoRow label="Type" value={job.customer.customer_type?.replace('_', ' ')} /></InfoCard>
        </div>

        <div className="lg:col-span-1 space-y-6">
            <InfoCard title="Shipment Assignment">
              {isAssigned && !isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <InfoRow label="Status" value={currentShipment.status.replace('_', ' ')} />
                    <InfoRow label="Driver" value={`${currentShipment.driver?.user?.first_name} ${currentShipment.driver?.user?.last_name}`} />
                    <InfoRow label="Vehicle" value={currentShipment.vehicle?.license_plate} />
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => setIsEditing(true)}>Edit Assignment</Button>
                </div>
              ) : currentShipment ? ( 
                <div className="space-y-4">
                  {!isAssigned && <p className="text-sm text-gray-600">This job is pending assignment.</p>}
                  <div>
                    <label className="text-sm font-medium mb-1 block">Driver</label>
                    <Select onValueChange={setSelectedDriverId} disabled={driversLoading} value={selectedDriverId}>
                      <SelectTrigger><SelectValue placeholder={driversLoading ? "Loading..." : "Select a driver"} /></SelectTrigger>
                      <SelectContent>
                        {/* --- THIS IS THE FIX --- */}
                        <SelectItem value="NONE">None</SelectItem>
                        {drivers?.map(d => <SelectItem key={d.id} value={d.id}>{d.user.first_name} {d.user.last_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Vehicle (Available Only)</label>
                    <Select onValueChange={setSelectedVehicleId} disabled={vehiclesLoading} value={selectedVehicleId}>
                      <SelectTrigger><SelectValue placeholder={vehiclesLoading ? "Loading..." : "Select a vehicle"} /></SelectTrigger>
                      <SelectContent>
                        {/* --- THIS IS THE FIX --- */}
                        <SelectItem value="NONE">None</SelectItem>
                        {vehicles?.map(v => <SelectItem key={v.id} value={v.id}>{v.make} {v.model} ({v.license_plate})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    {isEditing && (<Button variant="ghost" className="flex-1" onClick={() => setIsEditing(false)}>Cancel</Button>)}
                    <Button onClick={handleAssign} className="flex-1">{isAssigned ? "Save Changes" : "Assign Job"}</Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-red-600">Error: No shipment record found for this job. Please contact support.</p>
              )}
            </InfoCard>
        </div>
      </div>
    </div>
  );
}