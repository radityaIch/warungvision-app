"use client";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import { useRef, useState } from "react";
import { Camera } from "react-camera-pro";

type CameraType = {
  takePhoto: () => string;
  switchCamera: () => void;
  toggleTorch: () => void;
};

const uploadImageApi = async (payload: { image: string }) => {
  console.log("Uploading image...", payload);
  const response = await axios.post("/api/upload-image", payload);
  return response.data;
};

const CameraView = () => {
  const camera = useRef<CameraType | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [numberOfCameras, setNumberOfCameras] = useState(0);

  const mutation = useMutation({
    mutationFn: uploadImageApi,
    onSuccess: (data) => {
      console.log("Upload successfully:", data);
    },
    onError: (error) => {
      console.error("Upload failed:", error);
    },
  });

  const takePhoto = () => {
    if (camera.current) {
      const photo = camera.current.takePhoto();
      setImage(photo);
      mutation.reset();
    }
  };

  const clearPhoto = () => {
    setImage(null);
    mutation.reset();
  };

  const handleUpload = () => {
    if (!image) return;
    mutation.mutate({ image });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-black text-white p-4">
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
            {mutation.isSuccess && (
              <div className="absolute inset-0 z-10 bg-black/70 flex items-center justify-center">
                <div className="text-green-400 font-bold text-xl animate-bounce">
                  ✅ Upload Success!
                </div>
              </div>
            )}

            {mutation.isPending && (
              <div className="absolute inset-0 z-10 bg-black/50 flex items-center justify-center">
                <div className="text-white font-semibold">Uploading...</div>
              </div>
            )}

            {mutation.isError && (
              <div className="absolute top-0 left-0 right-0 z-20 bg-red-600/90 p-2 text-center text-white text-sm">
                Upload failed. please try again.
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
            <div className="flex justify-between items-center gap-4">
              <button
                disabled={mutation.isPending}
                onClick={clearPhoto}
                className="flex-1 bg-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-600 disabled:opacity-50"
              >
                Retake
              </button>
              <button
                disabled={mutation.isPending || mutation.isSuccess}
                onClick={handleUpload}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  mutation.isError
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {mutation.isPending
                  ? "Sending..."
                  : mutation.isError
                  ? "Try Again"
                  : "Upload"}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between px-4">
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
                  onClick={() => camera.current?.toggleTorch()}
                  className="p-2 rounded-full bg-white/20 backdrop-blur-sm active:scale-95 transition"
                >
                  ⚡
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraView;
