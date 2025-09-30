// frontend/app/(dashboard)/layout.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { backendUser, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If auth state is no longer loading and there is no backend user,
    // they are not authenticated. Redirect to the login page.
    if (!loading && !backendUser) {
      router.push('/login');
    }
  }, [backendUser, loading, router]);

  // While loading the auth state, show a simple loading message.
  // This prevents a flicker of the dashboard for unauthenticated users.
  if (loading || !backendUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  // If we are done loading and have a user, render the full dashboard layout.
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
        <h2 className="text-2xl font-bold mb-6">LogiPro</h2>
        <nav className="flex-grow">
          <ul>
            <li className="mb-2">
              <a href="/dashboard" className="block p-2 rounded hover:bg-gray-700">Dashboard</a>
            </li>
            <li className="mb-2">
              <a href="/warehouses" className="block p-2 rounded hover:bg-gray-700">Warehouses</a>
            </li>
            <li className="mb-2">
              <a href="/products" className="block p-2 rounded hover:bg-gray-700">Products</a>
            </li>
            <li className="mb-2">
              <a href="/orders" className="block p-2 rounded hover:bg-gray-700">Orders</a>
            </li>
            {/* Add more navigation links here as you build pages */}
          </ul>
        </nav>
      </aside>
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          
          {/* --- NEW: Display first_name with a fallback to username --- */}
          <div>Welcome, {backendUser.first_name || backendUser.username}!</div>
          
          <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors">
            Logout
          </button>
        </header>
        
        {/* Page Content */}
        <div className="p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}