"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { backendUser, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !backendUser) {
      router.push('/login');
    }
  }, [backendUser, loading, router]);

  if (loading || !backendUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
        <h2 className="text-2xl font-bold mb-6">LogiPro</h2>
        <nav className="flex-grow">
          <ul>
            <li className="mb-2"><a href="/dashboard" className="block p-2 rounded hover:bg-gray-700">Dashboard</a></li>
            
            {/* Operations Section */}
            {backendUser && (backendUser.role === 'ADMIN' || backendUser.role === 'MANAGER') && (
              <>
                <li className="mt-4 mb-2 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Operations</li>
                <li className="mb-2"><a href="/jobs" className="block p-2 rounded hover:bg-gray-700">Jobs</a></li>
              </>
            )}

            {/* Team & Fleet Section (Updated) */}
            {backendUser && (backendUser.role === 'ADMIN' || backendUser.role === 'MANAGER') && (
              <>
                <li className="mt-4 mb-2 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Team</li>
                <li className="mb-2"><a href="/employees" className="block p-2 rounded hover:bg-gray-700">Employees</a></li>
                <li className="mb-2"><a href="/fleet/drivers" className="block p-2 rounded hover:bg-gray-700">Drivers</a></li>
                <li className="mb-2"><a href="/fleet/vehicles" className="block p-2 rounded hover:bg-gray-700">Vehicles</a></li>
              </>
            )}

            {/* Admin Section */}
            {backendUser && backendUser.role === 'ADMIN' && (
              <>
                <li className="mt-4 mb-2 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</li>
                <li className="mb-2"><a href="/users" className="block p-2 rounded hover:bg-gray-700">User Management</a></li>
              </>
            )}
          </ul>
        </nav>
      </aside>
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <div>Welcome, {backendUser.first_name || backendUser.username}!</div>
          <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors">
            Logout
          </button>
        </header>
        <div className="p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
