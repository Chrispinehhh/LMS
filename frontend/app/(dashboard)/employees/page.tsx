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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Employee Directory</h1>
        <div className="text-sm text-gray-500">
          {employees.length} employees found
          {usersResponse && 'count' in usersResponse && (
            <span> (of {usersResponse.count} total users)</span>
          )}
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Loading employees...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : employees.length > 0 ? (
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">
                    {employee.first_name} {employee.last_name}
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      employee.role === 'ADMIN' 
                        ? 'bg-purple-100 text-purple-800'
                        : employee.role === 'MANAGER'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {employee.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    {/* Since we don't have is_active in the type, we'll assume all are active */}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  {usersResponse ? 'No employees found in the data' : 'No data received from API'}
                  {usersResponse && (
                    <div className="text-xs text-gray-500 mt-2">
                      Total users in response: {allUsers.length}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}