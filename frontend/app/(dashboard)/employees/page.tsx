// frontend/app/(dashboard)/employees/page.tsx
"use client";

import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import { BackendUser } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function EmployeesPage() {
  // Fetch ALL users. We will filter them on the frontend.
  const { data: users, error, isLoading } = useApi<BackendUser[]>('/users/');
  const { backendUser } = useAuth();

  // Filter the fetched users to only include employee roles
  const employees = users?.filter(user => 
    user.role === 'ADMIN' || user.role === 'MANAGER' || user.role === 'DRIVER'
  );

  // This page is for managers and admins to see their team
  if (backendUser?.role !== 'ADMIN' && backendUser?.role !== 'MANAGER') {
    return <p className="p-6">You do not have permission to view this page.</p>;
  }

  if (error) return <div className="p-6">Failed to load users.</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Employee Directory</h1>
        {/* 
          A button to "Add New Employee" could link to the /users page,
          since that's where the creation functionality lives.
          For now, we keep this as a read-only directory.
        */}
      </div>
      
      <div className="bg-white shadow rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">Loading employees...</TableCell>
              </TableRow>
            ) : employees && employees.length > 0 ? (
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.first_name} {employee.last_name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.role}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No employees found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}