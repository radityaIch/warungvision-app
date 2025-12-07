"use client";

import { useGetLowStockProducts } from "@/lib/hooks";
import { useState } from "react";

export default function LowStockPage() {
  const [threshold, setThreshold] = useState(5);
  const { data: products, isLoading } = useGetLowStockProducts(threshold);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Low Stock Alert</h1>
        <div className="flex items-center gap-2">
          <label className="text-gray-700">Threshold:</label>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(parseInt(e.target.value))}
            className="border border-gray-300 px-3 py-2 rounded-lg w-20"
            min="1"
          />
        </div>
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
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.data.map((product: any) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`font-semibold ${
                        product.stock <= 2
                          ? "text-red-600"
                          : "text-orange-600"
                      }`}
                    >
                      {product.stock} units
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    Rp{product.price.toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.stock <= 2
                          ? "bg-red-100 text-red-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {product.stock <= 2 ? "🔴 Critical" : "🟠 Low"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            ✅ All Good!
          </h3>
          <p className="text-green-600">
            No products below the threshold of {threshold} units.
          </p>
        </div>
      )}
    </div>
  );
}
