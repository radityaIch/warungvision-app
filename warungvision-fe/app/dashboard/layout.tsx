"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [store, setStore] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const storeData = localStorage.getItem("store");
    if (userData) setUser(JSON.parse(userData));
    if (storeData) setStore(JSON.parse(storeData));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("store");
    router.push("/");
  };

  const menuItems = [
    { label: "Scan Now", href: "/", icon: "📸", badge: "New" },
    { label: "Overview", href: "/dashboard", icon: "📊" },
    { label: "Products", href: "/dashboard/products", icon: "📦" },
    { label: "Inventory", href: "/dashboard/inventory", icon: "📋" },
    { label: "Low Stock", href: "/dashboard/low-stock", icon: "🚨" },
    { label: "Restock", href: "/dashboard/restock", icon: "💡" },
    { label: "Sales", href: "/dashboard/sales", icon: "💰" },
    { label: "History", href: "/dashboard/scans", icon: "📸" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gray-800 border-r border-gray-700 transition-all duration-300 overflow-y-auto flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h1 className={`font-bold ${!sidebarOpen ? "hidden" : "text-lg"}`}>
              🏪 WarungVision
            </h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-700 rounded transition"
            >
              {sidebarOpen ? "‹" : "›"}
            </button>
          </div>
          {sidebarOpen && store && (
            <p className="text-xs text-gray-400 mt-2 truncate">{store.storeName}</p>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg transition ${
                isActive(item.href)
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{item.icon}</span>
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </span>
              {item.badge && sidebarOpen && (
                <span className="text-xs bg-red-600 px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-gray-700 p-3 space-y-3">
          {sidebarOpen && user && (
            <div className="text-xs bg-gray-700 p-3 rounded">
              <p className="text-gray-400 text-xs">Logged in as</p>
              <p className="font-semibold truncate">{user.name}</p>
              <p className="text-gray-400 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg font-semibold transition text-sm"
          >
            {sidebarOpen ? "Logout" : "⬅️"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Dashboard</h2>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden sm:block p-2 rounded hover:bg-gray-700"
          >
            {sidebarOpen ? "‹" : "›"}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
