"use client";

import { useGetAllProducts } from "@/lib/hooks";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function InventoryPage() {
  const { data: products, isLoading } = useGetAllProducts();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
        <Link href="/dashboard/products" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
          + Add Product
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : products?.data && products.data.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Product Name
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                  Stock
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                  Price
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                  Total Value
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.data.map((product: any) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        product.stock <= 5
                          ? "bg-red-100 text-red-800"
                          : product.stock <= 15
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-900">
                    Rp{product.price.toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Rp
                    {(product.price * product.stock).toLocaleString(
                      "id-ID"
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      Edit
                    </button>
                    <span className="mx-2 text-gray-300">•</span>
                    <button className="text-red-600 hover:text-red-800 font-medium">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            📦 No Products
          </h3>
          <p className="text-gray-600">Start by adding your first product.</p>
        </div>
      )}
    </div>
  );
}
