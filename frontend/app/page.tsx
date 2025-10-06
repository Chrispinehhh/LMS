// frontend/app/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    // You can add a simple loading spinner here if you want
    <div className="flex items-center justify-center min-h-screen">
      <p>Loading...</p>
    </div>
  );
}