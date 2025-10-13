// customer-portal/app/track/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';

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
    <div className="relative bg-gray-900 text-white min-h-[calc(100vh-80px)] flex items-center">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/hero-background.jpg')" }}></div>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

      <div className="relative z-10 container mx-auto px-6 text-center">
        <Card className="max-w-xl mx-auto bg-white/10 backdrop-blur-lg border border-white/20 text-white">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Track Your Delivery</CardTitle>
            <CardDescription className="text-gray-300 pt-2">
              Enter your Job ID below to see the real-time status of your delivery.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
              <Input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="Enter your Job ID (e.g., 2cead355...)"
                className="bg-white/5 border-white/20 placeholder:text-gray-400 h-12 text-lg flex-grow"
              />
              <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700 h-12">
                <Search className="mr-2 h-5 w-5" /> Track
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}