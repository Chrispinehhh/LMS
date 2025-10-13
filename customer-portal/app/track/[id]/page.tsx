// customer-portal/app/track/[id]/page.tsx
"use client";

import { useParams } from 'next/navigation';
import { useApi } from '@/hooks/useApi'; // We'll need to add this hook to this project
import { Shipment } from '@/types'; // We'll need to add this type
import { Truck, PackageCheck, AlertCircle } from 'lucide-react';

// A simple component to show a timeline-like status
const StatusStep = ({ icon: Icon, title, description, isActive }: { icon: React.ElementType, title: string, description: string, isActive: boolean }) => (
    <div className={`flex items-start gap-4 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${isActive ? 'bg-blue-600' : 'bg-gray-700'}`}>
            <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
            <h3 className={`font-semibold text-lg ${isActive ? 'text-white' : 'text-gray-400'}`}>{title}</h3>
            <p className="text-sm text-gray-400">{description}</p>
        </div>
    </div>
);


export default function TrackingDetailPage() {
  const params = useParams();
  const jobId = params.id as string;

  // For now, we'll use dummy data. We need to set up API client and hooks for this project.
  const isLoading = false;
  const error = null;
  // const { data: shipments, error, isLoading } = useApi<Shipment[]>(jobId ? `/shipments/?job_id=${jobId}` : null);
  
  // Dummy data
  const currentShipment = {
      status: 'IN_TRANSIT'
  };
  // const currentShipment = shipments && shipments.length > 0 ? shipments[0] : null;


  const renderContent = () => {
    if (isLoading) {
      return <p className="text-center">Loading tracking information...</p>;
    }
    if (error || !currentShipment) {
      return (
        <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Tracking ID Not Found</h2>
            <p className="text-gray-400 mt-2">Please check your Job ID and try again.</p>
        </div>
      );
    }

    const status = currentShipment.status;
    return (
        <div className="space-y-8">
            <StatusStep 
                title="Job Pending" 
                description="Your booking is confirmed and waiting for assignment."
                isActive={status === 'PENDING' || status === 'IN_TRANSIT' || status === 'DELIVERED'}
            />
            <StatusStep 
                title="In Transit" 
                description="Your delivery is on its way to the destination."
                isActive={status === 'IN_TRANSIT' || status === 'DELIVERED'}
            />
            <StatusStep 
                title="Delivered" 
                description="Your items have been successfully delivered."
                isActive={status === 'DELIVERED'}
            />
        </div>
    );
  };

  return (
    <div className="relative bg-gray-900 text-white min-h-[calc(100vh-80px)] flex items-center justify-center">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/hero-background.jpg')" }}></div>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
      
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-xl">
            <h1 className="text-3xl font-bold mb-2">Delivery Status</h1>
            <p className="text-sm text-gray-400 mb-8">Job ID: {jobId}</p>
            {renderContent()}
        </div>
      </div>
    </div>
  );
}