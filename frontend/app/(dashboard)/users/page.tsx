// frontend/app/(dashboard)/users/page.tsx
"use client";

import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import { BackendUser, PaginatedResponse } from "@/types";
import { UserForm } from "./UserForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Define the possible response types for users endpoint
type UsersResponse = 
  | BackendUser[]
  | PaginatedResponse<BackendUser>;

// Helper function to extract users from different response formats
function extractUsers(data: UsersResponse | null): BackendUser[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if ('results' in data && Array.isArray(data.results)) return data.results;
  return [];
}

export default function UsersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: usersResponse, error, isLoading, mutate } = useApi<UsersResponse>('/users/');
  const { backendUser } = useAuth();

  // Extract users safely
  const users = extractUsers(usersResponse);

  // Only Admins should be able to manage users
  if (backendUser?.role !== 'ADMIN') {
    return <p className="p-6">You do not have permission to view this page.</p>;
  }

  const handleFormSuccess = () => {
    setModalOpen(false);
    mutate(); // Re-fetch the user list
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600 font-semibold">Failed to load users.</div>
        <div className="text-sm text-gray-600 mt-2">
          Error: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button onClick={() => setModalOpen(true)}>Add New User</Button>
      </div>
      
      <div className="bg-white shadow rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Customer Type</TableHead>
              <TableHead>Username (UID)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Loading users...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.first_name} {user.last_name}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'ADMIN' 
                        ? 'bg-purple-100 text-purple-800'
                        : user.role === 'MANAGER'
                        ? 'bg-blue-100 text-blue-800'
                        : user.role === 'DRIVER'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.customer_type === 'REGULAR' 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.customer_type}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{user.username}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <UserForm onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}