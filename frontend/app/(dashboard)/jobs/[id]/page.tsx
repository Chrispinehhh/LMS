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
        <div className="space-y-2">{children}</div>
    </div>
);

const InfoRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="flex justify-between items-start">
        <p className="text-gray-500">{label}</p>
        <p className="font-medium text-right">{value}</p>
    </div>
);

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  
  const { data: job, error: jobError, isLoading: jobLoading, mutate: mutateJob } = useApi<Job>(jobId ? `/jobs/${jobId}/` : null);
  const { data: shipments, error: shipmentError, isLoading: shipmentLoading, mutate: mutateShipments } = useApi<Shipment[]>(jobId ? `/shipments/?job_id=${jobId}` : null);
  const { data: vehicles, isLoading: vehiclesLoading } = useApi<Vehicle[]>('/vehicles/?status=AVAILABLE');
  const { data: drivers, isLoading: driversLoading } = useApi<Driver[]>('/drivers/');

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");

  const currentShipment = shipments && shipments.length > 0 ? shipments[0] : null;

  useEffect(() => {
    if (currentShipment) {
      setSelectedDriverId(currentShipment.driver?.id || "");
      setSelectedVehicleId(currentShipment.vehicle?.id || "");
    }
  }, [currentShipment]);

  const handleAssign = async () => {
    if (!currentShipment) {
        toast.error("Shipment data not found.");
        return;
    }
    if (!selectedDriverId || !selectedVehicleId) {
      toast.error("Please select both a driver and a vehicle.");
      return;
    }
    try {
      await apiClient.patch(`/shipments/${currentShipment.id}/`, {
        driver_id: selectedDriverId,
        vehicle_id: selectedVehicleId,
        status: 'IN_TRANSIT'
      });
      toast.success("Job assigned successfully!");
      mutateJob();
      mutateShipments();
    } catch (error) {
      toast.error("Failed to assign job.");
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
            <span className="font-medium">{job.status}</span>
        </div>
        <p className="text-gray-500 text-sm mt-1">Job ID: {job.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg-col-span-2 space-y-6">
            <InfoCard title="Cargo & Service">
                <InfoRow label="Service Type" value={job.service_type.replace(/_/g, ' ')} />
                <InfoRow label="Requested Pickup" value={new Date(job.requested_pickup_date).toLocaleString()} />
                <div>
                    <p className="text-gray-500">Description</p>
                    <p className="font-medium mt-1">{job.cargo_description}</p>
                </div>
            </InfoCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard title="Pickup Location"><p>{job.pickup_address}, {job.pickup_city}</p></InfoCard>
                <InfoCard title="Delivery Location"><p>{job.delivery_address}, {job.delivery_city}</p></InfoCard>
            </div>
            <InfoCard title="Customer Information">
                <InfoRow label="Name" value={`${job.customer.first_name} ${job.customer.last_name}`} />
                <InfoRow label="Email" value={job.customer.email} />
                <InfoRow label="Type" value={job.customer.customer_type} />
            </InfoCard>
        </div>

        <div className="lg:col-span-1 space-y-6">
            <InfoCard title="Shipment Assignment">
                {currentShipment && (currentShipment.driver || currentShipment.vehicle) ? (
                    <div className="space-y-2">
                        <InfoRow label="Status" value={currentShipment.status} />
                        <InfoRow label="Driver" value={`${currentShipment.driver?.user?.first_name} ${currentShipment.driver?.user?.last_name}` || 'Not Assigned'} />
                        <InfoRow label="Vehicle" value={currentShipment.vehicle?.license_plate || 'Not Assigned'} />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">This job has not been assigned yet.</p>
                        <div>
                            <label className="text-sm font-medium">Assign Driver</label>
                            <Select onValueChange={setSelectedDriverId} disabled={driversLoading}>
                                <SelectTrigger><SelectValue placeholder="Select a driver..." /></SelectTrigger>
                                <SelectContent>
                                    {drivers?.map(d => <SelectItem key={d.id} value={d.id}>{d.user.first_name} {d.user.last_name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Assign Vehicle (Available Only)</label>
                            {/* --- THIS IS THE FIX --- */}
                            <Select onValueChange={setSelectedVehicleId} disabled={vehiclesLoading}>
                                <SelectTrigger><SelectValue placeholder="Select a vehicle..." /></SelectTrigger>
                                <SelectContent>
                                    {vehicles?.map(v => <SelectItem key={v.id} value={v.id}>{v.make} {v.model} ({v.license_plate})</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleAssign} className="w-full">Assign & Start Job</Button>
                    </div>
                )}
            </InfoCard>
        </div>
      </div>
    </div>
  );
}
