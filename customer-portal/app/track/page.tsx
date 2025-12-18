'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Truck, MapPin, Clock, Package, CheckCircle, ArrowRight } from 'lucide-react';

export default function TrackLandingPage() {
  const [trackingId, setTrackingId] = useState('');
  const router = useRouter();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId.trim()) {
      router.push(`/track/${trackingId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-6 py-8 md:py-20 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 rounded-full px-6 py-2 mb-6">
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-blue-700">LIVE TRACKING</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight">
            Track Your{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Shipment
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Get real-time updates and live location tracking for your delivery. Peace of mind, delivered.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
          {/* Tracking Form */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Tracking Number</h2>
                <p className="text-gray-600">
                  Find your Order ID in your booking confirmation email
                </p>
              </div>

              <form onSubmit={handleTrack} className="space-y-6">
                <div>
                  <label htmlFor="trackingId" className="block text-sm font-medium text-gray-700 mb-2">
                    Order ID / Tracking Number
                  </label>
                  <Input
                    id="trackingId"
                    type="text"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    placeholder="e.g., ORD-8921"
                    className="h-14 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg"
                  disabled={!trackingId.trim()}
                >
                  <Search className="mr-2 h-5 w-5" />
                  Track My Delivery
                </Button>
              </form>

              <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-gray-900">Can't find your Order ID?</span>
                  <br />
                  Check your confirmation email or contact{' '}
                  <a href="mailto:support@logipro.com" className="text-blue-600 hover:underline">
                    support@logipro.com
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="lg:order-2 space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">What You'll See</h3>

            {[
              {
                icon: MapPin,
                title: 'Real-Time Location',
                description: 'GPS tracking shows exactly where your delivery is right now',
                color: 'blue'
              },
              {
                icon: Clock,
                title: 'Accurate ETA',
                description: 'Live estimated arrival time that updates as conditions change',
                color: 'green'
              },
              {
                icon: Truck,
                title: 'Driver Details',
                description: 'View your driver\'s name, vehicle info, and contact button',
                color: 'orange'
              },
              {
                icon: CheckCircle,
                title: 'Status Timeline',
                description: 'Complete journey from pickup to delivery with timestamps',
                color: 'purple'
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              const colorClasses = {
                blue: 'bg-blue-100 text-blue-600',
                green: 'bg-green-100 text-green-600',
                orange: 'bg-orange-100 text-orange-600',
                purple: 'bg-purple-100 text-purple-600',
              };

              return (
                <div key={index} className="flex gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className={`flex-shrink-0 h-12 w-12 rounded-xl ${colorClasses[feature.color as keyof typeof colorClasses]} flex items-center justify-center`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}

            <div className="mt-8 p-6 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white">
              <h4 className="font-semibold mb-2">Need Help?</h4>
              <p className="text-sm text-blue-100 mb-4">
                Our support team is available 24/7 to assist you with tracking or delivery questions.
              </p>
              <Button variant="outline" className="bg-white text-blue-600 hover:bg-gray-100 border-0">
                Contact Support <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span>Live Updates</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <span>99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
              <span>Secure Tracking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}