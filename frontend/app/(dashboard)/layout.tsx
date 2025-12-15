"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Truck,
  UserCog,
  LogOut,
  ChevronDown,
  Settings,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { backendUser, loading, logout } = useAuth();
  const router = useRouter();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !backendUser) {
      router.push('/login');
    }
  }, [backendUser, loading, router]);

  if (loading || !backendUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Loading S&S Logistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl 
        text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 
        flex flex-col shadow-xl
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">S&S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                  S&S Logistics
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Management Portal</p>
              </div>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          {/* Dashboard */}
          <Link
            href="/dashboard"
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all duration-200 group"
          >
            <LayoutDashboard className="w-5 h-5 text-emerald-600" />
            <span className="font-medium">Dashboard</span>
          </Link>

          {/* Operations Section */}
          {backendUser && (backendUser.role === 'ADMIN' || backendUser.role === 'MANAGER') && (
            <div className="space-y-2">
              <div className="px-3 pt-4 pb-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Operations</p>
              </div>
              <Link
                href="/jobs"
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all duration-200 group"
              >
                <Briefcase className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Jobs</span>
              </Link>
            </div>
          )}

          {/* Team & Fleet Section */}
          {backendUser && (backendUser.role === 'ADMIN' || backendUser.role === 'MANAGER') && (
            <div className="space-y-2">
              <div className="px-3 pt-4 pb-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Team & Fleet</p>
              </div>
              <Link
                href="/employees"
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all duration-200 group"
              >
                <Users className="w-5 h-5 text-green-500" />
                <span className="font-medium">Employees</span>
              </Link>
              <Link
                href="/fleet/drivers"
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all duration-200 group"
              >
                <UserCog className="w-5 h-5 text-amber-500" />
                <span className="font-medium">Drivers</span>
              </Link>
              <Link
                href="/fleet/vehicles"
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all duration-200 group"
              >
                <Truck className="w-5 h-5 text-purple-500" />
                <span className="font-medium">Vehicles</span>
              </Link>
            </div>
          )}

          {/* Admin Section */}
          {backendUser && backendUser.role === 'ADMIN' && (
            <div className="space-y-2">
              <div className="px-3 pt-4 pb-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Administration</p>
              </div>
              <Link
                href="/users"
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all duration-200 group"
              >
                <Users className="w-5 h-5 text-red-500" />
                <span className="font-medium">Users</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">S&S Logistics v1.0</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            </button>

            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">
                {backendUser.first_name?.[0] || backendUser.username?.[0]}
              </span>
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-white">
                Welcome back, {backendUser.first_name || backendUser.username}!
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                {backendUser.role?.toLowerCase() || 'user'}
              </p>
            </div>
          </div>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:shadow-md text-gray-700 dark:text-gray-200"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">{backendUser.first_name || backendUser.username}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isUserDropdownOpen && (
              <div className="absolute right-0 top-12 w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{backendUser.first_name || backendUser.username}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{backendUser.role?.toLowerCase()}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>
      </main>

      {/* Close dropdown when clicking outside */}
      {isUserDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserDropdownOpen(false)}
        />
      )}
    </div>
  );
}