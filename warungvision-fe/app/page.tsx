"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CameraView from "./components/CameraView";

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
      router.push("/scan");
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold text-white mb-4">🏪 WarungVision</h1>
          <p className="text-xl text-blue-100 mb-8">
            Smart Inventory Management with AI-Powered Shelf Scanning
          </p>

          <div className="space-y-4">
            <button
              onClick={() => router.push("/auth/login")}
              className="w-full bg-white text-blue-600 font-semibold py-4 rounded-lg hover:bg-blue-50 transition shadow-lg"
            >
              Login
            </button>
            <button
              onClick={() => router.push("/auth/register")}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-4 rounded-lg transition shadow-lg"
            >
              Create New Account
            </button>
          </div>

          <p className="text-blue-100 text-sm mt-8">
            © 2025 WarungVision. Smart inventory for smart stores.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black">
      <div className="text-white text-xl">Redirecting...</div>
    </main>
  );
}
