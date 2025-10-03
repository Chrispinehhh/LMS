"use client";

import { useState, useEffect } from "react";
import { Vehicle, Driver, Shipment } from "@/types";
import { toast } from "react-hot-toast";
import apiClient from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

interface ShipmentAssignmentCardProps {
  shipment: Shipment | null;
  drivers: Driver[] | null;
  vehicles: Vehicle[] | null;
  isLoading: boolean;
  onAssignmentChange: () => void;
}

export function ShipmentAssignmentCard({ shipment, drivers, vehicles, isLoading, onAssignmentChange }: ShipmentAssignmentCardProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  const isAssigned = !!(shipment && shipment.driver && shipment.vehicle);

  useEffect(() => {
    setIsEditing(!isAssigned);
    if (shipment) {
      setSelectedDriverId(shipment.driver?.id || "");
      setSelectedVehicleId(shipment.vehicle?.id || "");
    }
  }, [shipment, isAssigned]);

  const handleAssign = async () => {
    if (!shipment) {
        toast.error("Shipment data not found.");
        return;
    }
    const driverIdPayload = selectedDriverId === "NONE" ? null : selectedDriverId || null;
    const vehicleIdPayload = selectedVehicleId === "NONE" ? null : selectedVehicleId || null;
    const newStatus = (driverIdPayload && vehicleIdPayload) ? 'IN_TRANSIT' : 'PENDING';

    try {
      await apiClient.patch(`/shipments/${shipment.id}/`, {
        driver_id: driverIdPayload,
        vehicle_id: vehicleIdPayload,
        status: newStatus,
      });
      toast.success("Assignment updated successfully!");
      setIsEditing(false);
      onAssignmentChange();
    } catch (error) {
      toast.error("Failed to update assignment.");
    }
  };
  
  if (isLoading) {
    return <div className="bg-white p-6 shadow rounded-lg animate-pulse h-[250px]"></div>;
  }
  
  return (
    <InfoCard title="Shipment Assignment">
      {isAssigned && !isEditing ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <InfoRow label="Status" value={shipment.status.replace('_', ' ')} />
            <InfoRow label="Driver" value={`${shipment.driver?.user?.first_name} ${shipment.driver?.user?.last_name}`} />
            <InfoRow label="Vehicle" value={shipment.vehicle?.license_plate} />
          </div>
          <Button variant="outline" className="w-full" onClick={() => setIsEditing(true)}>Edit Assignment</Button>
        </div>
      ) : shipment ? ( 
        <div className="space-y-4">
          {!isAssigned && <p className="text-sm text-gray-600">This job is pending assignment.</p>}
          <div>
            <label className="text-sm font-medium mb-1 block">Driver</label>
            <Select onValueChange={setSelectedDriverId} value={selectedDriverId}>
              <SelectTrigger><SelectValue placeholder={"Select a driver"} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">None</SelectItem>
                {drivers?.map(d => <SelectItem key={d.id} value={d.id}>{d.user.first_name} {d.user.last_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Vehicle (Available Only)</label>
            <Select onValueChange={setSelectedVehicleId} value={selectedVehicleId}>
              <SelectTrigger><SelectValue placeholder={"Select a vehicle"} /></SelectTrigger>
              <SelectContent>
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
        <p className="text-sm text-red-600">Error: No shipment record found for this job.</p>
      )}
    </InfoCard>
  );
}