"use client";

import { useGetRestockRecommendations } from "@/lib/hooks";

export default function RestockPage() {
  const { data, isLoading } = useGetRestockRecommendations(30);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-300";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-green-100 text-green-800 border-green-300";
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Restock Recommendations</h1>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : data?.data?.recommendations && data.data.recommendations.length > 0 ? (
        <div className="space-y-4">
          <p className="text-gray-600">
            Analysis period: {data.data.period}
          </p>

          <div className="grid gap-4">
            {data.data.recommendations.map((rec: any) => (
              <div
                key={rec.productId}
                className={`border rounded-lg p-4 ${getPriorityColor(rec.priority)}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{rec.name}</h3>
                    <p className="text-sm opacity-75">SKU: {rec.sku}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold`}>
                    {rec.priority}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div>
                    <p className="text-xs opacity-75">Current Stock</p>
                    <p className="font-semibold">{rec.currentStock} units</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-75">Daily Consumption</p>
                    <p className="font-semibold">
                      {rec.averageDailyConsumption.toFixed(1)} units/day
                    </p>
                  </div>
                  <div>
                    <p className="text-xs opacity-75">
                      Days Until Stockout
                    </p>
                    <p className="font-semibold">
                      {rec.daysUntilStockout ? `${rec.daysUntilStockout} days` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs opacity-75">Suggested Quantity</p>
                    <p className="font-semibold">{rec.suggestedRestockQuantity} units</p>
                  </div>
                </div>

                <div className="pt-3 border-t opacity-50 text-sm">
                  Unit Price: Rp{rec.price.toLocaleString("id-ID")}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            📊 No Urgent Restocking Needed
          </h3>
          <p className="text-blue-600">
            All products have healthy stock levels based on current trends.
          </p>
        </div>
      )}
    </div>
  );
}
