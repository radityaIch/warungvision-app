"use client";

import { useGetAllScans } from "@/lib/hooks";

export default function ScansPage() {
  const { data, isLoading } = useGetAllScans();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "queued":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Scan History</h1>
        <a
          href="/"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          + Start New Scan
        </a>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : data?.data && data.data.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Scan ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  User
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                  Items
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                  Processing Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.data.map((scan: any) => (
                <tr key={scan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">
                    {scan.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {scan.user?.name || "Unknown"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(scan.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                    {scan.items?.length || 0}
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        scan.status
                      )}`}
                    >
                      {scan.status.charAt(0).toUpperCase() +
                        scan.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">
                    {scan.processingTimeMs
                      ? `${scan.processingTimeMs}ms`
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            📸 No Scans Yet
          </h3>
          <p className="text-gray-600 mb-4">Start scanning your shelves to see history.</p>
          <a
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Begin Scanning
          </a>
        </div>
      )}
    </div>
  );
}
