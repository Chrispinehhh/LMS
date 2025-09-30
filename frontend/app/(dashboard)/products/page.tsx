    // frontend/app/(dashboard)/products/page.tsx
    "use client";

    import { useState } from "react";
    import { useApi } from "@/hooks/useApi";
    import { useAuth } from "@/context/AuthContext";
    import { ProductForm } from "./ProductForm"; // Reusable form
    import { Button } from "@/components/ui/button";
    import apiClient from "@/lib/api";

    import {
      Dialog,
      DialogContent,
      DialogHeader,
      DialogTitle,
    } from "@/components/ui/dialog";
    import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuTrigger,
    } from "@/components/ui/dropdown-menu";
    import {
      AlertDialog,
      AlertDialogAction,
      AlertDialogCancel,
      AlertDialogContent,
      AlertDialogDescription,
      AlertDialogFooter,
      AlertDialogHeader,
      AlertDialogTitle,
    } from "@/components/ui/alert-dialog";
    import {
      Table,
      TableBody,
      TableCell,
      TableHead,
      TableHeader,
      TableRow,
    } from "@/components/ui/table";

    interface Product {
      id: string;
      sku: string;
      name: string;
      description?: string;
      weight_kg?: number;
    }

    export default function ProductsPage() {
      const [modalOpen, setModalOpen] = useState(false);
      const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
      const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

      const { data: products, error, isLoading, mutate } = useApi<Product[]>('/products/');
      const { backendUser } = useAuth();

      if (backendUser?.role !== 'ADMIN' && backendUser?.role !== 'MANAGER') {
        return <p className="p-6">You do not have permission to view this page.</p>;
      }

      const handleCreate = () => {
        setSelectedProduct(null);
        setModalOpen(true);
      };

      const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setModalOpen(true);
      };

      const handleDelete = (product: Product) => {
        setSelectedProduct(product);
        setDeleteAlertOpen(true);
      };

      const confirmDelete = async () => {
        if (!selectedProduct) return;
        try {
          await apiClient.delete(`/products/${selectedProduct.id}/`);
          mutate();
          setDeleteAlertOpen(false);
        } catch (error) {
          console.error("Failed to delete product", error);
        }
      };

      const handleFormSuccess = () => {
        setModalOpen(false);
        mutate();
      };

      if (error) return <div className="p-6">Failed to load products.</div>;

      return (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Products</h1>
            <Button onClick={handleCreate}>Add New Product</Button>
          </div>
          
          <div className="bg-white shadow rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Weight (kg)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
                ) : products?.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono">{product.sku}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.weight_kg ?? 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm">...</Button></DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleEdit(product)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(product)} className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              </DialogHeader>
              <ProductForm onSuccess={handleFormSuccess} initialData={selectedProduct} />
            </DialogContent>
          </Dialog>

          <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the product: &quot;{selectedProduct?.name}&quot;.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    }