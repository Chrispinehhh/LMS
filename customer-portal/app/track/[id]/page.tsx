// customer-portal/app/track/[id]/page.tsx
"use client";

import { useParams } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import { Shipment } from '@/types';
import { Truck, PackageCheck, AlertCircle, Hourglass, Clock, User, CheckCircle2 } from 'lucide-react';
import React from 'react';

const StatusStep = ({ icon: Icon, title, description, isActive, isCompleted }: { 
  icon: React.ElementType, 
  title: string, 
  description: string, 
  isActive: boolean,
  isCompleted: boolean 
}) => (
  <div className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-500 ${
    isActive ? 'bg-blue-500/20 border border-blue-500/30' : 
    isCompleted ? 'bg-green-500/10 border border-green-500/20' :
    'bg-white/5 border border-white/10'
  }`}>
    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-500 ${
      isCompleted ? 'bg-green-500 shadow-lg shadow-green-500/25' :
      isActive ? 'bg-blue-500 shadow-lg shadow-blue-500/25' : 
      'bg-gray-700'
    }`}>
      {isCompleted ? (
        <CheckCircle2 className="h-6 w-6 text-white" />
      ) : (
        <Icon className="h-6 w-6 text-white" />
      )}
    </div>
    <div className="flex-1">
      <h3 className={`font-bold text-lg transition-colors ${
        isCompleted ? 'text-green-400' :
        isActive ? 'text-blue-400' : 
        'text-gray-400'
      }`}>
        {title}
      </h3>
      <p className={`text-sm mt-1 ${
        isCompleted ? 'text-green-300' :
        isActive ? 'text-blue-300' : 
        'text-gray-400'
      }`}>
        {description}
      </p>
    </div>
  </div>
);

// Define a basic Job interface locally since it's not exported from types
interface BasicJob {
  id: string;
  status: string;
  service_type?: string;
  requested_pickup_date?: string;
  cargo_description?: string;
}

export default function TrackingDetailPage() {
  const params = useParams();
  const jobId = params.id as string;

  // CORRECTED: Using the exact same endpoint as your working job detail page
  const { data: shipments, error, isLoading } = useApi<Shipment[]>(
    jobId ? `/transportation/shipments/?job_id=${jobId}` : null
  );

  // Fallback: Also fetch job data directly with basic type
  const { data: job, error: jobError } = useApi<BasicJob>(
    jobId ? `/jobs/${jobId}/` : null
  );
  
  const currentShipment = shipments && shipments.length > 0 ? shipments[0] : null;

  // Debug logging
  React.useEffect(() => {
    console.log('🔍 TRACKING DEBUG:', {
      jobId,
      shipments,
      currentShipment,
      job,
      error,
      isLoading
    });
  }, [jobId, shipments, currentShipment, job, error, isLoading]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/20 mb-4">
            <Hourglass className="h-8 w-8 text-blue-400 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Tracking Information</h2>
          <p className="text-gray-400">Getting the latest status of your delivery...</p>
        </div>
      );
    }

    if (error && jobError) {
      return (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/20 mb-4">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4">Tracking ID Not Found</h2>
          <p className="text-gray-300 text-lg mb-6">
            We couldn&apos;t find any delivery with tracking number: <span className="font-mono text-blue-300">{jobId}</span>
          </p>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-left max-w-md mx-auto">
            <p className="text-sm text-gray-400 mb-2">Please check:</p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Your Job ID is correct</li>
              <li>• The delivery was booked recently</li>
              <li>• You&apos;re using the correct tracking number</li>
            </ul>
          </div>
        </div>
      );
    }

    // If job exists but no shipment yet, show job information
    if (job && !currentShipment) {
      const jobStatus = job.status;
      const isPending = jobStatus === 'PENDING';
      const isInTransit = jobStatus === 'IN_TRANSIT';
      const isDelivered = jobStatus === 'DELIVERED';
      const isFailed = jobStatus === 'FAILED';

      return (
        <div className="space-y-8">
          {/* Header with Job Info */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-lg rounded-full px-6 py-3 border border-white/20 mb-4">
              <Truck className="h-5 w-5 text-blue-300" />
              <span className="text-sm font-semibold text-blue-300">ORDER CONFIRMED</span>
            </div>
            <h2 className="text-2xl font-black text-white mb-2">
              {isDelivered ? 'Delivery Complete' : 
               isFailed ? 'Delivery Issue' :
               isInTransit ? 'In Transit' : 
               'Processing Your Order'}
            </h2>
            <p className="text-gray-400">
              Job ID: <span className="font-mono text-blue-300">{jobId}</span>
            </p>
            <p className="text-sm text-yellow-400 mt-2">
              ⚠️ Detailed tracking information will be available once your shipment is assigned to a driver.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="relative mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className={`text-sm font-semibold ${isPending ? 'text-blue-400' : 'text-gray-400'}`}>Pending</div>
              <div className={`text-sm font-semibold ${isInTransit || isDelivered || isFailed ? 'text-blue-400' : 'text-gray-400'}`}>In Transit</div>
              <div className={`text-sm font-semibold ${isDelivered ? 'text-green-400' : isFailed ? 'text-red-400' : 'text-gray-400'}`}>
                {isFailed ? 'Failed' : 'Delivered'}
              </div>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${
                  isDelivered ? 'bg-green-500 w-full' :
                  isFailed ? 'bg-red-500 w-full' :
                  isInTransit ? 'bg-blue-500 w-2/3' :
                  'bg-blue-500 w-1/3'
                }`}
              ></div>
            </div>
          </div>

          {/* Status Steps */}
          <div className="space-y-4">
            <StatusStep 
              title="Order Confirmed" 
              description="Your booking has been confirmed and is being processed."
              icon={Hourglass}
              isActive={isPending}
              isCompleted={isInTransit || isDelivered || isFailed}
            />
            <StatusStep 
              title="Processing" 
              description="Your order is being prepared for shipment. Driver assignment in progress."
              icon={PackageCheck}
              isActive={isInTransit}
              isCompleted={isDelivered || isFailed}
            />
            <StatusStep 
              title={isFailed ? "Delivery Issue" : "Delivery"} 
              description={
                isFailed ? 
                  "There was an issue with the delivery. Please contact support for assistance." :
                  "Your items will be delivered to the specified address."
              }
              icon={isFailed ? AlertCircle : Truck}
              isActive={isDelivered || isFailed}
              isCompleted={isDelivered || isFailed}
            />
          </div>

          {/* Job Information */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-blue-400" />
              Order Details
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Service Type</p>
                <p className="text-white font-semibold">
                  {job.service_type?.replace(/_/g, ' ') || 'Standard Delivery'}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Status</p>
                <p className={`font-semibold ${
                  isDelivered ? 'text-green-400' :
                  isFailed ? 'text-red-400' :
                  isInTransit ? 'text-blue-400' :
                  'text-yellow-400'
                }`}>
                  {jobStatus.replace('_', ' ')}
                </p>
              </div>
              {job.requested_pickup_date && (
                <div className="md:col-span-2">
                  <p className="text-gray-400">Requested Pickup</p>
                  <p className="text-white font-semibold">
                    {new Date(job.requested_pickup_date).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Estimated Time */}
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-lg rounded-2xl border border-white/10 p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Clock className="h-5 w-5 text-cyan-400" />
              <span className="text-sm font-semibold text-cyan-300">NEXT STEPS</span>
            </div>
            <p className="text-gray-300">
              {isDelivered ? 
                'Delivery completed successfully' :
                isFailed ? 
                'Delivery encountered an issue - please contact support' :
                isInTransit ? 
                'Your delivery is being processed - tracking details will update soon' :
                'Your order is confirmed and will be assigned to a driver shortly'
              }
            </p>
          </div>
        </div>
      );
    }

    if (!currentShipment) {
      return (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-500/20 mb-4">
            <AlertCircle className="h-8 w-8 text-yellow-400" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4">Shipment Not Found</h2>
          <p className="text-gray-300 text-lg mb-6">
            No shipment found for Job ID: <span className="font-mono text-blue-300">{jobId}</span>
          </p>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-left max-w-md mx-auto">
            <p className="text-sm text-gray-400 mb-2">This could mean:</p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• The job hasn&apos;t been processed yet</li>
              <li>• The tracking number is incorrect</li>
              <li>• The shipment was recently created</li>
            </ul>
          </div>
        </div>
      );
    }

    const status = currentShipment.status;
    const isPending = status === 'PENDING';
    const isInTransit = status === 'IN_TRANSIT';
    const isDelivered = status === 'DELIVERED';
    const isFailed = status === 'FAILED';

    return (
      <div className="space-y-8">
        {/* Header with Job Info */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-lg rounded-full px-6 py-3 border border-white/20 mb-4">
            <Truck className="h-5 w-5 text-blue-300" />
            <span className="text-sm font-semibold text-blue-300">LIVE TRACKING</span>
          </div>
          <h2 className="text-2xl font-black text-white mb-2">
            {isDelivered ? 'Delivery Complete' : 
             isFailed ? 'Delivery Issue' :
             isInTransit ? 'In Transit' : 
             'Processing Your Order'}
          </h2>
          <p className="text-gray-400">
            Job ID: <span className="font-mono text-blue-300">{jobId}</span>
            {currentShipment.id && (
              <> • Shipment: <span className="font-mono text-blue-300">{currentShipment.id}</span></>
            )}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="relative mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className={`text-sm font-semibold ${isPending ? 'text-blue-400' : 'text-gray-400'}`}>Pending</div>
            <div className={`text-sm font-semibold ${isInTransit || isDelivered || isFailed ? 'text-blue-400' : 'text-gray-400'}`}>In Transit</div>
            <div className={`text-sm font-semibold ${isDelivered ? 'text-green-400' : isFailed ? 'text-red-400' : 'text-gray-400'}`}>
              {isFailed ? 'Failed' : 'Delivered'}
            </div>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                isDelivered ? 'bg-green-500 w-full' :
                isFailed ? 'bg-red-500 w-full' :
                isInTransit ? 'bg-blue-500 w-2/3' :
                'bg-blue-500 w-1/3'
              }`}
            ></div>
          </div>
        </div>

        {/* Status Steps */}
        <div className="space-y-4">
          <StatusStep 
            title="Job Confirmed" 
            description="Your booking is confirmed and waiting for driver assignment."
            icon={Hourglass}
            isActive={isPending}
            isCompleted={isInTransit || isDelivered || isFailed}
          />
          <StatusStep 
            title="In Transit" 
            description={
              currentShipment.driver ? 
                `Assigned to ${currentShipment.driver.user.first_name || 'our driver'} with vehicle ${currentShipment.vehicle?.license_plate || 'our fleet'}. Your delivery is on its way.` :
                'Your delivery is being processed and will be assigned to a driver soon.'
            }
            icon={Truck}
            isActive={isInTransit}
            isCompleted={isDelivered || isFailed}
          />
          <StatusStep 
            title={isFailed ? "Delivery Failed" : "Delivered"} 
            description={
              isFailed ? 
                "There was an issue with the delivery. Please contact support for assistance." :
                "Your items have been successfully delivered at the destination."
            }
            icon={isFailed ? AlertCircle : PackageCheck}
            isActive={isDelivered || isFailed}
            isCompleted={isDelivered || isFailed}
          />
        </div>

        {/* Additional Information */}
        {(currentShipment.driver || currentShipment.vehicle) && (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-400" />
              Delivery Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              {currentShipment.driver && (
                <div>
                  <p className="text-gray-400">Driver</p>
                  <p className="text-white font-semibold">
                    {currentShipment.driver.user.first_name} {currentShipment.driver.user.last_name}
                  </p>
                </div>
              )}
              {currentShipment.vehicle && (
                <div>
                  <p className="text-gray-400">Vehicle</p>
                  <p className="text-white font-semibold">
                    {currentShipment.vehicle.license_plate}
                    {currentShipment.vehicle.model && ` • ${currentShipment.vehicle.model}`}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Shipment Details */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <PackageCheck className="h-5 w-5 text-blue-400" />
            Shipment Details
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Current Status</p>
              <p className={`font-semibold ${
                isDelivered ? 'text-green-400' :
                isFailed ? 'text-red-400' :
                isInTransit ? 'text-blue-400' :
                'text-yellow-400'
              }`}>
                {status.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* Estimated Time */}
        <div className={`backdrop-blur-lg rounded-2xl border p-6 text-center ${
          isDelivered ? 'bg-green-600/20 border-green-500/30' :
          isFailed ? 'bg-red-600/20 border-red-500/30' :
          'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-white/10'
        }`}>
          <div className="flex items-center justify-center gap-3 mb-2">
            <Clock className="h-5 w-5 text-cyan-400" />
            <span className="text-sm font-semibold text-cyan-300">STATUS UPDATE</span>
          </div>
          <p className="text-gray-300">
            {isDelivered ? 
              'Delivery completed successfully' :
              isFailed ? 
              'Delivery encountered an issue - please contact support' :
              isInTransit ? 
              'Your delivery is on the way - expect updates soon' :
              'Your delivery is being processed - driver assignment in progress'
            }
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="relative bg-gray-900 text-white min-h-screen pt-20 pb-8">
      <div className="absolute inset-0 bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/hero-background.jpg')" }}></div>
      <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-slow"></div>
      <div className="absolute bottom-40 right-10 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-slow animation-delay-2000"></div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          <div className="p-8">
            {renderContent()}
          </div>
          
          {/* Support Information */}
          <div className="border-t border-white/10 p-6 bg-white/5">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Need help with your delivery?</p>
              <p className="text-blue-300 font-semibold">Contact Support: (123) 456-7890</p>
              <p className="text-sm text-gray-400 mt-1">support@logipro.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}