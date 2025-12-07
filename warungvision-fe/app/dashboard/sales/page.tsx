"use client";

import { useGetSalesInsights } from "@/lib/hooks";
import { useState } from "react";

export default function SalesPage() {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useGetSalesInsights(days);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Sales Insights</h1>
        <div className="flex items-center gap-2">
          <label className="text-gray-700">Period:</label>
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="border border-gray-300 px-3 py-2 rounded-lg"
          >
            <option value={7}>7 Days</option>
            <option value={30}>30 Days</option>
            <option value={90}>90 Days</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : data?.data ? (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-blue-900 text-sm font-semibold mb-2">
                Total Sales ({days} days)
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                Rp
                {data.data.totalSpendingEstimate.toLocaleString("id-ID")}
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-green-900 text-sm font-semibold mb-2">
                Daily Average
              </h3>
              <p className="text-3xl font-bold text-green-600">
                Rp{data.data.averageDailySpending.toLocaleString("id-ID")}
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h3 className="text-orange-900 text-sm font-semibold mb-2">
                Items Sold
              </h3>
              <p className="text-3xl font-bold text-orange-600">
                {data.data.totalItemsSold}
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-purple-900 text-sm font-semibold mb-2">
                Monthly Projection
              </h3>
              <p className="text-3xl font-bold text-purple-600">
                Rp
                {data.data.projectedMonthlySpending.toLocaleString(
                  "id-ID"
                )}
              </p>
            </div>
          </div>

          {/* Daily Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Daily Averages
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 text-sm mb-2">Items per Day</p>
                <div className="bg-gray-100 rounded p-4">
                  <p className="text-4xl font-bold text-blue-600">
                    {data.data.averageDailyItems.toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">items/day average</p>
                </div>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-2">Revenue per Day</p>
                <div className="bg-gray-100 rounded p-4">
                  <p className="text-4xl font-bold text-green-600">
                    Rp{data.data.averageDailySpending.toLocaleString("id-ID")}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">revenue/day average</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Sold Products */}
          {data.data.topSoldProducts && data.data.topSoldProducts.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800">
                  Top Selling Products
                </h2>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      Items Sold
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      Total Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.data.topSoldProducts.map((product: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.sku}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                        {product.itemsSold}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-semibold text-green-600">
                        Rp{product.totalValue.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
