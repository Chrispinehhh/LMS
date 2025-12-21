// frontend/app/(dashboard)/employees/page.tsx
"use client";

import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import { BackendUser, PaginatedResponse } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect } from "react";
import { User } from "lucide-react";

// Define the possible response types for users endpoint
type UsersResponse =
  | BackendUser[]  // Direct array
  | PaginatedResponse<BackendUser>;  // Paginated response

// Helper function to extract users from different response formats
function extractUsers(data: UsersResponse | null): BackendUser[] {
  if (!data) return [];

  // If it's already an array
  if (Array.isArray(data)) {
    return data;
  }

  // If it's a paginated response (Django REST framework)
  if ('results' in data && Array.isArray(data.results)) {
    return data.results;
  }

  return [];
}

export default function EmployeesPage() {
  // Use the proper type instead of 'any'
  const { data: usersResponse, error, isLoading } = useApi<UsersResponse>('/users/');
  const { backendUser } = useAuth();

  // Debug: log what we're getting
  useEffect(() => {
    console.log('Users response:', usersResponse);
    console.log('Type of users:', typeof usersResponse);
    console.log('Is array?', Array.isArray(usersResponse));
    console.log('Error:', error);
  }, [usersResponse, error]);

  // Extract and filter employees
  const allUsers = extractUsers(usersResponse);
  const employees = allUsers.filter(user =>
    user.role === 'ADMIN' || user.role === 'MANAGER' || user.role === 'DRIVER'
  );

  // This page is for managers and admins to see their team
  if (backendUser?.role !== 'ADMIN' && backendUser?.role !== 'MANAGER') {
    return <p className="p-6">You do not have permission to view this page.</p>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600 font-semibold">Failed to load users.</div>
        <div className="text-sm text-gray-600 mt-2">
          Error: {error.message}
          <br />
          Trying endpoint: /users/
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-400">Employee Directory</h1>
          <p className="text-blue-600 dark:text-blue-300 mt-2">
            Manage your team members and their roles
            {employees.length > 0 && (
              <span> ({employees.length} active)</span>
            )}
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {usersResponse && 'count' in usersResponse && (
            <span>Total Users: {usersResponse.count}</span>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-700/50">
              <TableHead className="text-gray-900 dark:text-white font-semibold">Name</TableHead>
              <TableHead className="text-gray-900 dark:text-white font-semibold">Email</TableHead>
              <TableHead className="text-gray-900 dark:text-white font-semibold">Role</TableHead>
              <TableHead className="text-gray-900 dark:text-white font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex justify-center items-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 dark:border-purple-400"></div>
                    <span className="text-gray-600 dark:text-gray-400">Loading employees...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : employees.length > 0 ? (
              employees.map((employee) => (
                <TableRow key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <TableCell className="font-medium text-gray-900 dark:text-white">
                    {employee.first_name} {employee.last_name}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">{employee.email}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${employee.role === 'ADMIN'
                      ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700'
                      : employee.role === 'MANAGER'
                        ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700'
                        : 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700'
                      }`}>
                      {employee.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    {/* Since we don't have is_active in the type, we'll assume all are active */}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700">
                      Active
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12">
                  <div className="text-center space-y-3">
                    <User className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No employees found</p>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      Total users in response: {allUsers.length}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}