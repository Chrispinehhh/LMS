// frontend/app/(dashboard)/orders/page.tsx
"use client";

import Link from "next/link"; // Next.js component for client-side navigation
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import { Order } from "@/types"; // <-- Import our new centralized type
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function OrdersPage() {
  const { data: orders, error, isLoading } = useApi<Order[]>('/orders/');
  const { backendUser } = useAuth();

  // For now, only Admins and Managers can see all orders
  if (backendUser?.role !== 'ADMIN' && backendUser?.role !== 'MANAGER') {
    return <p className="p-6">You do not have permission to view this page.</p>;
  }

  if (error) return <div className="p-6">Failed to load orders.</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Orders</h1>
        {/* We can add a "Create Order" button here later */}
      </div>
      
      <div className="bg-white shadow rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : orders && orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">{order.id.substring(0, 8)}...</TableCell>
                  <TableCell>{order.customer.first_name || order.customer.username}</TableCell>
                  <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {/* We can add a colored badge for status later */}
                    <span className="font-medium">{order.status}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/orders/${order.id}`} passHref>
                      <Button variant="outline" size="sm">View Details</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}