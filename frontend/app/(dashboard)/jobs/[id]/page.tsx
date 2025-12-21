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
import {
  ArrowLeft,
  User,
  Truck,
  Calendar,
  MapPin,
  Phone,
  Package,
  CheckCircle,
  XCircle,
  Edit,
  LucideIcon,
  FileText,
  Clock,
  LayoutDashboard,
  Box,
  Map as MapIcon,
  FileCheck,
  ChevronRight,
  Printer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

// Types
type ShipmentsResponse = Shipment[] | PaginatedResponse<Shipment>;
type VehiclesResponse = Vehicle[] | PaginatedResponse<Vehicle>;
type DriversResponse = Driver[] | PaginatedResponse<Driver>;

function extractData<T>(data: T[] | PaginatedResponse<T> | null): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if ('results' in data && Array.isArray(data.results)) return data.results;
  return [];
}

// Sub-components
const InfoCard = ({ title, children, icon: Icon, className = "" }: {
  title: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`glass-card p-6 rounded-2xl relative overflow-hidden ${className}`}
  >
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
      {Icon && (
        <div className="p-2 bg-primary/10 rounded-xl text-primary">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
    </div>
    <div className="space-y-4">{children}</div>
  </motion.div>
);

const InfoRow = ({ label, value, icon: Icon }: {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
}) => (
  <div className="flex justify-between items-center text-sm py-1">
    <div className="flex items-center gap-2 text-muted-foreground">
      {Icon && <Icon className="w-4 h-4 text-primary/70" />}
      <span>{label}</span>
    </div>
    <span className="font-medium text-foreground text-right">{value}</span>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (s: string) => {
    switch (s) {
      case 'DELIVERED': return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
      case 'IN_TRANSIT': return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
      case 'PENDING': return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
      case 'FAILED': return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      case 'ASSIGNED': return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800";
      default: return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${getStatusColor(status)}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;

  const [activeTab, setActiveTab] = useState<'overview' | 'cargo' | 'billing'>('overview');

  const { data: job, error: jobError, isLoading: jobLoading, mutate: mutateJob } = useApi<Job>(jobId ? `/jobs/${jobId}/` : null);
  const { data: shipmentsResponse, isLoading: shipmentLoading, mutate: mutateShipments } = useApi<ShipmentsResponse>(jobId ? `/transportation/shipments/?job_id=${jobId}` : null);
  const { data: vehiclesResponse } = useApi<VehiclesResponse>('/transportation/vehicles/?status=AVAILABLE');
  const { data: driversResponse } = useApi<DriversResponse>('/transportation/drivers/');

  const shipments = extractData(shipmentsResponse);
  const vehicles = extractData(vehiclesResponse);
  const drivers = extractData(driversResponse);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("none");
  const [selectedDriverId, setSelectedDriverId] = useState<string>("none");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentShipment = shipments && shipments.length > 0 ? shipments[0] : null;

  useEffect(() => {
    if (currentShipment) {
      setSelectedDriverId(currentShipment.driver?.id || "none");
      setSelectedVehicleId(currentShipment.vehicle?.id || "none");
    } else {
      setSelectedDriverId("none");
      setSelectedVehicleId("none");
    }
    // Only auto-edit if strictly allowed and unassigned. 
    // Logic changed to manual trigger for better UX.
  }, [currentShipment]);

  const handleAssign = async () => {
    if (!jobId) return;
    setIsSubmitting(true);
    try {
      const driverIdPayload = selectedDriverId === "none" ? null : selectedDriverId;
      const vehicleIdPayload = selectedVehicleId === "none" ? null : selectedVehicleId;
      const payload = {
        driver_id: driverIdPayload,
        vehicle_id: vehicleIdPayload,
        status: (driverIdPayload && vehicleIdPayload) ? 'ASSIGNED' : 'PENDING',
      };

      if (currentShipment) {
        await apiClient.patch(`/transportation/shipments/${currentShipment.id}/`, payload);
      } else {
        await apiClient.post('/transportation/shipments/', { ...payload, job_id: jobId });
      }

      toast.success("Assignment updated successfully!");
      setIsEditing(false);
      mutateJob();
      mutateShipments();
    } catch (err: any) {
      toast.error("Failed to update assignment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (jobLoading || shipmentLoading) return <div className="p-10 text-center animate-pulse">Loading job details...</div>;
  if (jobError || !job) return <div className="p-10 text-center text-destructive">Failed to load job.</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/50">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/jobs" className="hover:text-primary transition-colors">Jobs</Link>
            <ChevronRight className="w-3 h-3" />
            <span>Details</span>
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">Job #{job.job_number || job.id.slice(0, 8)}</h1>
            <StatusBadge status={currentShipment?.status || job.status} />
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Printer className="w-4 h-4" /> Print BOL
          </Button>
          <Button onClick={() => setIsEditing(true)} className="gap-2 shadow-lg shadow-primary/20">
            <Edit className="w-4 h-4" /> {isEditing ? 'Editing...' : 'Edit Job'}
          </Button>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Main Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* Custom Tabs */}
          <div className="flex gap-1 p-1 bg-secondary/50 rounded-xl w-fit">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'cargo', label: 'Cargo Details', icon: Box },
              { id: 'billing', label: 'Billing', icon: FileText },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${activeTab === tab.id
                    ? 'bg-background text-primary shadow-sm'
                    : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'}
                  `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                {/* Route & Map Placeholder */}
                <InfoCard title="Route Information" icon={MapIcon}>
                  <div className="grid md:grid-cols-2 gap-8 relative">
                    {/* Timeline Visual */}
                    <div className="absolute left-1/2 top-4 bottom-4 w-px bg-border/50 hidden md:block" />

                    <div className="space-y-2 relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <h3 className="font-semibold text-blue-600 dark:text-blue-400">Pickup</h3>
                      </div>
                      <div className="pl-10 space-y-1">
                        <p className="font-medium text-lg">{job.pickup_city}</p>
                        <p className="text-muted-foreground text-sm">{job.pickup_address}</p>
                        <div className="flex items-center gap-2 pt-2 text-sm">
                          <User className="w-3 h-3" /> {job.pickup_contact_person}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3 h-3" /> {job.pickup_contact_phone}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <h3 className="font-semibold text-emerald-600 dark:text-emerald-400">Delivery</h3>
                      </div>
                      <div className="pl-10 space-y-1">
                        <p className="font-medium text-lg">{job.delivery_city}</p>
                        <p className="text-muted-foreground text-sm">{job.delivery_address}</p>
                        <div className="flex items-center gap-2 pt-2 text-sm">
                          <User className="w-3 h-3" /> {job.delivery_contact_person}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3 h-3" /> {job.delivery_contact_phone}
                        </div>
                      </div>
                    </div>
                  </div>
                </InfoCard>

                <div className="grid md:grid-cols-2 gap-6">
                  <InfoCard title="Customer" icon={User}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                        {job.customer.first_name?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-lg">{job.customer.first_name} {job.customer.last_name}</p>
                        <p className="text-sm text-muted-foreground">{job.customer.email}</p>
                        <p className="text-xs font-medium text-primary mt-1 uppercase tracking-wide">{job.customer.customer_type?.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </InfoCard>

                  <InfoCard title="Schedule" icon={Calendar}>
                    <InfoRow label="Requested Pickup" value={format(new Date(job.requested_pickup_date), 'PPP p')} icon={Calendar} />
                    <InfoRow label="Estimated Delivery" value={job.estimated_delivery_date ? format(new Date(job.estimated_delivery_date), 'PPP') : 'TBD'} icon={Clock} />
                  </InfoCard>
                </div>
              </motion.div>
            )}

            {activeTab === 'cargo' && (
              <motion.div
                key="cargo"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <InfoCard title="Cargo Specification" icon={Package}>
                  <div className="grid md:grid-cols-3 gap-6 mb-8 bg-secondary/20 p-4 rounded-xl">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Service Type</p>
                      <p className="font-bold text-lg capitalize">{job.service_type?.replace(/_/g, ' ') || job.job_type}</p>
                    </div>
                    <div className="text-center border-l border-border/50">
                      <p className="text-sm text-muted-foreground">Volume/Weight</p>
                      <p className="font-bold text-lg">
                        {job.job_type === 'RESIDENTIAL' ? `${job.volume_cf || 0} cf` : `${job.weight_lbs || 0} lbs`}
                      </p>
                    </div>
                    <div className="text-center border-l border-border/50">
                      <p className="text-sm text-muted-foreground">Items</p>
                      <p className="font-bold text-lg">
                        {job.job_type === 'RESIDENTIAL' ? `${job.room_count || 0} Rooms` : `${job.pallet_count || 0} Pallets`}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Inventory List</h3>
                    {job.estimated_items && Object.keys(job.estimated_items).length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.entries(job.estimated_items).map(([item, count]) => (
                          <div key={item} className="flex justify-between items-center p-3 bg-secondary/10 rounded-lg border border-border/50">
                            <span className="text-sm font-medium">{item}</span>
                            <span className="text-xs font-bold bg-secondary text-secondary-foreground px-2 py-1 rounded-md">{String(count)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No detailed inventory provided.</p>
                    )}
                  </div>
                </InfoCard>
              </motion.div>
            )}

            {activeTab === 'billing' && (
              <motion.div
                key="billing"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <InfoCard title="Billing & Invoices" icon={FileText}>
                  <div className="text-center py-10 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No invoices generated for this job yet.</p>
                    <Button variant="outline" className="mt-4">Generate Invoice</Button>
                  </div>
                </InfoCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Sidebar Actions */}
        <div className="lg:col-span-4 space-y-6">
          <InfoCard title="Assignment" icon={Truck} className="border-primary/20 shadow-lg shadow-primary/5">
            {!isEditing ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                    <User className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Driver</p>
                      <p className="font-medium">
                        {currentShipment?.driver ? `${currentShipment.driver.user.first_name} ${currentShipment.driver.user.last_name}` : 'Unassigned'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                    <Truck className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Vehicle</p>
                      <p className="font-medium">
                        {currentShipment?.vehicle ? `${currentShipment.vehicle.make} ${currentShipment.vehicle.model}` : 'Unassigned'}
                      </p>
                    </div>
                  </div>
                </div>

                <Button onClick={() => setIsEditing(true)} className="w-full">
                  {currentShipment?.driver ? 'Change Assignment' : 'Assign Driver'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Driver</label>
                  <Select onValueChange={setSelectedDriverId} value={selectedDriverId}>
                    <SelectTrigger><SelectValue placeholder="Driver" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unassigned</SelectItem>
                      {drivers?.map(d => (
                        <SelectItem key={d.id} value={d.id}>{d.user.first_name} {d.user.last_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Vehicle</label>
                  <Select onValueChange={setSelectedVehicleId} value={selectedVehicleId}>
                    <SelectTrigger><SelectValue placeholder="Vehicle" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unassigned</SelectItem>
                      {vehicles?.map(v => (
                        <SelectItem key={v.id} value={v.id}>{v.make} {v.model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setIsEditing(false)} className="flex-1">Cancel</Button>
                  <Button onClick={handleAssign} disabled={isSubmitting} className="flex-1">{isSubmitting ? 'Saving...' : 'Save'}</Button>
                </div>
              </div>
            )}
          </InfoCard>

          {(currentShipment?.proof_of_delivery_image || job.proof_of_delivery_image) && (
            <InfoCard title="Proof of Delivery" icon={FileCheck}>
              <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100 mb-2">
                <img
                  src={currentShipment?.proof_of_delivery_image || job.proof_of_delivery_image || ''}
                  alt="POD"
                  className="object-cover w-full h-full hover:scale-105 transition-transform"
                />
              </div>
              <Button variant="link" className="w-full h-auto p-0 text-xs">View Full Size</Button>
            </InfoCard>
          )}
        </div>
      </div>
    </div>
  );
}