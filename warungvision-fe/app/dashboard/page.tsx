"use client";

import { useGetInventoryStats, useGetSalesInsights } from "@/lib/hooks";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useGetInventoryStats();
  const { data: sales, isLoading: salesLoading } = useGetSalesInsights(7);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-medium">Total Products</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {statsLoading ? "-" : stats?.data?.totalProducts || 0}
          </p>
        </div>

        {/* Total Stock */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-medium">Total Stock</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {statsLoading ? "-" : stats?.data?.totalStock || 0}
          </p>
        </div>

        {/* Inventory Value */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-medium">Inventory Value</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {statsLoading
              ? "-"
              : `Rp${(stats?.data?.totalValue || 0).toLocaleString("id-ID")}`}
          </p>
        </div>

        {/* 7-Day Sales */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-medium">7-Day Sales</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            {salesLoading
              ? "-"
              : `Rp${(sales?.data?.totalSpendingEstimate || 0).toLocaleString("id-ID")}`}
          </p>
        </div>
      </div>

      {/* Sales Insights */}
      {sales?.data && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Sales Performance (7 Days)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 text-sm">Daily Average Sales</p>
              <p className="text-2xl font-bold text-blue-600">
                Rp{sales.data.averageDailySpending.toLocaleString("id-ID")}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Items Sold</p>
              <p className="text-2xl font-bold text-green-600">
                {sales.data.totalItemsSold} items
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Projected Monthly</p>
              <p className="text-2xl font-bold text-purple-600">
                Rp{sales.data.projectedMonthlySpending.toLocaleString("id-ID")}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Daily Average Items</p>
              <p className="text-2xl font-bold text-orange-600">
                {sales.data.averageDailyItems} items/day
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <a
            href="/dashboard/products"
            className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition"
          >
            <h3 className="font-semibold text-purple-800">📦 Manage Products</h3>
            <p className="text-sm text-purple-600">Add, edit, delete products</p>
          </a>
          <a
            href="/dashboard/low-stock"
            className="p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition"
          >
            <h3 className="font-semibold text-red-800">⚠️ Check Low Stock</h3>
            <p className="text-sm text-red-600">View products below threshold</p>
          </a>
          <a
            href="/dashboard/restock"
            className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
          >
            <h3 className="font-semibold text-blue-800">🔄 Restock Suggestions</h3>
            <p className="text-sm text-blue-600">Get AI recommendations</p>
          </a>
          <a
            href="/"
            className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition"
          >
            <h3 className="font-semibold text-green-800">📸 Scan Shelf</h3>
            <p className="text-sm text-green-600">Start a new scan</p>
          </a>
        </div>
      </div>
    </div>
  );
}
