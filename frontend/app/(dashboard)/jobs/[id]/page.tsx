"use client";

import { useApi } from "@/hooks/useApi";
import { Job, Vehicle, Driver, Shipment } from "@/types";
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ShipmentAssignmentCard } from "./ShipmentAssignmentCard";

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
  
  const { data: job, error: jobError, isLoading: jobLoading, mutate: mutateJob } = useApi<Job>(jobId ? `/jobs/${jobId}/` : null);
  const { data: shipments, error: shipmentError, isLoading: shipmentLoading, mutate: mutateShipments } = useApi<Shipment[]>(jobId ? `/shipments/?job_id=${jobId}` : null);
  const { data: vehicles, isLoading: vehiclesLoading } = useApi<Vehicle[]>('/vehicles/?status=AVAILABLE');
  const { data: drivers, isLoading: driversLoading } = useApi<Driver[]>('/drivers/');

  const currentShipment = shipments && shipments.length > 0 ? shipments[0] : null;

  const handleAssignmentChange = () => {
    mutateJob();
    mutateShipments();
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
            <ShipmentAssignmentCard 
              shipment={currentShipment}
              drivers={drivers}
              vehicles={vehicles}
              isLoading={shipmentLoading || driversLoading || vehiclesLoading}
              onAssignmentChange={handleAssignmentChange}
            />
        </div>
      </div>
    </div>
  );
}