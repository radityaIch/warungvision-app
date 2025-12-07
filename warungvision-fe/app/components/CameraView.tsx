"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { Camera } from "react-camera-pro";
import { useStartScan, useUploadImage } from "@/lib/hooks";
import { scanAPI, inventoryAPI } from "@/lib/api";

type CameraType = {
  takePhoto: () => string;
  switchCamera: () => void;
  toggleTorch: () => void;
};

const CameraView = () => {
  const camera = useRef<CameraType | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [numberOfCameras, setNumberOfCameras] = useState(0);
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);
  const [detectionResults, setDetectionResults] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [detectionPrompt, setDetectionPrompt] = useState<string>("");
  const [showAddToInventory, setShowAddToInventory] = useState(false);
  const [detectedCount, setDetectedCount] = useState(0);

  // Fetch all products for selection
  const { data: productsData } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await inventoryAPI.getAllProducts();
      return response.data as any[];
    },
  });

  const startScanMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found. Please login first.");
      }
      if (!detectionPrompt.trim()) {
        throw new Error("Please enter what to scan in settings");
      }
      const response = await scanAPI.startScan();
      console.log("Scan started:", response.data);
      setCurrentScanId(response.data.id);
      return response.data;
    },
    onError: (error: any) => {
      console.error("Scan error:", error.response?.data?.message || error.message);
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async ({
      scanEventId,
      image,
      prompts,
    }: {
      scanEventId: string;
      image: string;
      prompts: string[];
    }) => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found. Please login first.");
      }
      const response = await scanAPI.uploadImage(scanEventId, image, prompts);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Upload successfully:", data);
      setDetectionResults(data);
      // Count total objects detected
      const totalCount = data.detectionResults?.length || 0;
      setDetectedCount(totalCount);
      // Show add to inventory button after detection
      setShowAddToInventory(true);
    },
    onError: (error: any) => {
      console.error("Upload failed:", error.response?.data?.message || error.message);
    },
  });

  // Add detected items to inventory
  const addToInventoryMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProductId) {
        throw new Error("Please select a product");
      }
      const token = localStorage.getItem("authToken");
      const userData = localStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;
      
      // Update product stock with detected count
      const response = await inventoryAPI.updateStock(selectedProductId, detectedCount);
      return response.data;
    },
    onSuccess: () => {
      console.log("Added to inventory successfully");
      // Reset after 2 seconds
      setTimeout(() => {
        setImage(null);
        setDetectionResults(null);
        setCurrentScanId(null);
        setShowAddToInventory(false);
        setDetectedCount(0);
        setSelectedProductId("");
        setDetectionPrompt("");
        uploadImageMutation.reset();
        addToInventoryMutation.reset();
      }, 2000);
    },
    onError: (error: any) => {
      console.error("Add to inventory failed:", error.response?.data?.message || error.message);
    },
  });

  const takePhoto = () => {
    if (camera.current) {
      const photo = camera.current.takePhoto();
      setImage(photo);
      setDetectionResults(null);
    }
  };

  const clearPhoto = () => {
    setImage(null);
    setDetectionResults(null);
    setCurrentScanId(null);
    uploadImageMutation.reset();
    startScanMutation.reset();
  };

  const handleStartScan = async () => {
    await startScanMutation.mutateAsync();
  };

  const handleUpload = async () => {
    if (!image || !currentScanId) return;
    // Remove data:image/jpeg;base64, prefix if present
    const base64Image = image.includes("base64,")
      ? image.split("base64,")[1]
      : image;
    
    // Parse prompts from text input (comma-separated)
    const prompts = detectionPrompt
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    
    await uploadImageMutation.mutateAsync({
      scanEventId: currentScanId,
      image: base64Image,
      prompts: prompts.length > 0 ? prompts : ["product"],
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full bg-black text-white p-4">
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Scan Settings</h2>
            
            {/* Product Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Product to Count
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="">-- Choose a product --</option>
                {productsData?.map((product: any) => (
                  <option key={product.id} value={product.id}>
                    {product.name} (SKU: {product.sku})
                  </option>
                ))}
              </select>
            </div>

            {/* Detection Prompt */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What to Detect
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Enter the visual characteristics of the product to scan (comma-separated)
              </p>
              <textarea
                value={detectionPrompt}
                onChange={(e) => setDetectionPrompt(e.target.value)}
                placeholder="e.g., bottle, red bottle, plastic bottle..."
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                rows={4}
              />
              <p className="text-xs text-gray-400 mt-2">
                This helps the AI detect specific items. Use descriptive terms.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition"
              >
                Ready to Scan
              </button>
              <button
                onClick={() => {
                  setSelectedProductId("");
                  setDetectionPrompt("");
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold transition"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add to Inventory Modal */}
      {showAddToInventory && detectionResults && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">Scan Results</h2>
            
            <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Items Detected</p>
                <p className="text-5xl font-bold text-green-400">{detectedCount}</p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700 max-h-48 overflow-y-auto">
              <p className="text-sm font-semibold text-gray-300 mb-3">Detection Details:</p>
              <div className="space-y-2">
                {detectionResults.detectionResults?.slice(0, 5).map(
                  (result: { name: string; confidence: number }, idx: number) => (
                    <div key={idx} className="text-xs bg-black/50 p-2 rounded">
                      <span className="font-semibold">{result.name}</span> -{" "}
                      <span className="text-green-300">
                        {(result.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-400">
                Product: <span className="text-white font-semibold">
                  {productsData?.find(p => p.id === selectedProductId)?.name}
                </span>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setImage(null);
                  setDetectionResults(null);
                  setShowAddToInventory(false);
                  setCurrentScanId(null);
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={() => addToInventoryMutation.mutateAsync()}
                disabled={addToInventoryMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {addToInventoryMutation.isPending ? "Adding..." : "Add to Inventory"}
              </button>
            </div>

            {addToInventoryMutation.isSuccess && (
              <div className="mt-4 p-3 bg-green-900/30 border border-green-500 rounded-lg text-center text-green-400 font-semibold">
                ✅ Added to inventory!
              </div>
            )}

            {addToInventoryMutation.isError && (
              <div className="mt-4 p-3 bg-red-900/30 border border-red-500 rounded-lg text-center text-red-400 font-semibold text-sm">
                ❌ Failed to add. Check product selection.
              </div>
            )}
          </div>
        </div>
      )}

      <div className="relative w-full max-w-md aspect-3/4 sm:aspect-9/16 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
        {image ? (
          <div className="relative w-full h-full">
            <Image
              src={image}
              alt="Captured Photo"
              fill
              className="object-cover"
              priority
              unoptimized
            />

            {/* Overlay Status Upload */}
            {uploadImageMutation.isSuccess && (
              <div className="absolute inset-0 z-10 bg-black/70 flex items-center justify-center">
                <div className="text-green-400 font-bold text-xl animate-bounce">
                  ✅ Detection Complete!
                </div>
              </div>
            )}

            {uploadImageMutation.isPending ||
            startScanMutation.isPending ? (
              <div className="absolute inset-0 z-10 bg-black/50 flex items-center justify-center">
                <div className="text-white font-semibold">Processing...</div>
              </div>
            ) : null}

            {uploadImageMutation.isError && (
              <div className="absolute top-0 left-0 right-0 z-20 bg-red-600/90 p-2 text-center text-white text-sm">
                Detection failed. Please try again.
              </div>
            )}
          </div>
        ) : (
          <Camera
            ref={camera}
            aspectRatio="cover"
            facingMode="environment"
            numberOfCamerasCallback={setNumberOfCameras}
            errorMessages={{
              noCameraAccessible: "No cameras detected",
              permissionDenied: "Camera permission denied",
              switchCamera: "Failed to change camera",
              canvas: "Canvas is not supported",
            }}
          />
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black/90 to-transparent">
          {image ? (
            <div className="flex flex-col gap-3">
              {!currentScanId && (
                <button
                  disabled={startScanMutation.isPending}
                  onClick={handleStartScan}
                  className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-semibold disabled:opacity-50"
                >
                  {startScanMutation.isPending ? "Starting..." : "Start Scan"}
                </button>
              )}
              <div className="flex justify-between items-center gap-4">
                <button
                  disabled={uploadImageMutation.isPending}
                  onClick={clearPhoto}
                  className="flex-1 bg-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-600 disabled:opacity-50"
                >
                  Retake
                </button>
                <button
                  disabled={
                    uploadImageMutation.isPending ||
                    uploadImageMutation.isSuccess ||
                    !currentScanId
                  }
                  onClick={handleUpload}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    uploadImageMutation.isError
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {uploadImageMutation.isPending
                    ? "Analyzing..."
                    : uploadImageMutation.isError
                    ? "Try Again"
                    : "Analyze"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between px-4 py-6 w-full">
              <div className="w-12">
                {numberOfCameras > 1 && (
                  <button
                    onClick={() => camera.current?.switchCamera()}
                    className="p-2 rounded-full bg-white/20 backdrop-blur-sm active:scale-95 transition"
                  >
                    🔄
                  </button>
                )}
              </div>

              <button
                onClick={takePhoto}
                className="w-16 h-16 rounded-full bg-white border-4 border-gray-300 shadow-[0_0_15px_rgba(255,255,255,0.5)] active:scale-90 transition-transform"
              />

              <div className="w-12 flex justify-end">
                <button
                  onClick={() => {
                    camera.current?.toggleTorch();
                  }}
                  className="p-2 rounded-full bg-white/20 backdrop-blur-sm active:scale-95 transition"
                >
                  ⚡
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detection Settings Button */}
        {!image && (
          <button
            onClick={() => setShowSettings(true)}
            className="absolute top-4 right-4 z-20 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition flex items-center gap-2"
          >
            ⚙️ Settings
          </button>
        )}
      </div>

      {/* Display current configuration */}
      {selectedProductId && (
        <div className="mt-4 text-sm text-gray-400 max-w-md">
          <p>Product: <span className="text-green-400 font-semibold">{productsData?.find(p => p.id === selectedProductId)?.name}</span></p>
          <p>Detecting: <span className="text-green-400 font-semibold">{detectionPrompt || "not set"}</span></p>
        </div>
      )}
    </div>
  );
};

export default CameraView;
