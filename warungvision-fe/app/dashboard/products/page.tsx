"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { inventoryAPI } from "@/lib/api";
import Link from "next/link";

interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image?: string;
  createdAt: string;
}

export default function ProductsPage() {
  const [mounted, setMounted] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    sku: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    image?: string;
  }>({
    sku: "",
    name: "",
    description: "",
    price: 0,
    stock: 0,
    image: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch products
  const { data: productsData, isLoading, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await inventoryAPI.getAllProducts();
      return response.data as Product[];
    },
  });

  // Create product
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return inventoryAPI.createProduct({
        ...data,
        storeId: localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user")!).storeId
          : "",
      });
    },
    onSuccess: () => {
      setFormData({ sku: "", name: "", description: "", price: 0, stock: 0, image: "" });
      setIsCreating(false);
      refetch();
    },
  });

  // Update product
  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<typeof formData> }) => {
      return inventoryAPI.updateProduct(data.id, data.updates);
    },
    onSuccess: () => {
      setFormData({ sku: "", name: "", description: "", price: 0, stock: 0, image: "" });
      setEditingId(null);
      refetch();
    },
  });

  // Delete product
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return inventoryAPI.deleteProduct(id);
    },
    onSuccess: () => {
      refetch();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSubmit = {
      ...formData,
      image: formData.image || undefined, // Send undefined instead of empty string
    };

    if (editingId) {
      await updateMutation.mutateAsync({
        id: editingId,
        updates: dataToSubmit,
      });
    } else {
      await createMutation.mutateAsync(dataToSubmit);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock: product.stock,
      image: product.image || "",
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({ sku: "", name: "", description: "", price: 0, stock: 0, image: "" });
  };

  if (!mounted) {
    return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Products</h1>
            <p className="text-gray-400 mt-2">Manage your inventory</p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              console.log("Add product clicked");
              setIsCreating(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition cursor-pointer active:bg-blue-800"
          >
            + Add Product
          </button>
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingId) && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-6">
              {editingId ? "Edit Product" : "Create New Product"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SKU */}
                <div>
                  <label className="block text-sm font-medium mb-2">SKU *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g., PROD-001"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-blue-500 outline-none transition"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Samsung Galaxy S24"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-blue-500 outline-none transition"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium mb-2">Price (Rp) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-blue-500 outline-none transition"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium mb-2">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-blue-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product details..."
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-blue-500 outline-none transition resize-none"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-blue-500 outline-none transition"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold disabled:opacity-50 transition"
                >
                  {editingId ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Loading products...</div>
          ) : !productsData || productsData.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No products yet. Create your first product to get started!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700 border-b border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">SKU</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Price</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Stock</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {productsData.map((product, idx) => (
                    <tr
                      key={product.id}
                      className={`border-b border-gray-700 ${
                        idx % 2 === 0 ? "bg-gray-800" : "bg-gray-750"
                      } hover:bg-gray-700 transition`}
                    >
                      <td className="px-6 py-4 text-sm font-mono text-blue-400">
                        {product.sku}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.description && (
                            <p className="text-gray-400 text-xs mt-1 truncate">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        Rp {product.price.toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            product.stock > 10
                              ? "bg-green-900/30 text-green-400"
                              : product.stock > 0
                              ? "bg-yellow-900/30 text-yellow-400"
                              : "bg-red-900/30 text-red-400"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs font-medium transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete this product?")) {
                              deleteMutation.mutate(product.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs font-medium disabled:opacity-50 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        {productsData && productsData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-400 text-sm mb-2">Total Products</p>
              <p className="text-3xl font-bold">{productsData.length}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-400 text-sm mb-2">Total Stock</p>
              <p className="text-3xl font-bold">
                {productsData.reduce((sum, p) => sum + p.stock, 0)}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-400 text-sm mb-2">Total Value</p>
              <p className="text-3xl font-bold">
                Rp {productsData
                  .reduce((sum, p) => sum + p.price * p.stock, 0)
                  .toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
