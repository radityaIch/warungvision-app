import { useQuery, useMutation, UseQueryResult } from "@tanstack/react-query";
import { scanAPI, inventoryAPI, insightsAPI } from "./api";

// Scan Hooks
export const useStartScan = () => {
  return useMutation({
    mutationFn: () => scanAPI.startScan(),
  });
};

export const useGetAllScans = () => {
  return useQuery({
    queryKey: ["scans"],
    queryFn: () => scanAPI.getAllScans(),
  });
};

export const useGetScanById = (id: string) => {
  return useQuery({
    queryKey: ["scan", id],
    queryFn: () => scanAPI.getScanById(id),
    enabled: !!id,
  });
};

export const useUploadImage = () => {
  return useMutation({
    mutationFn: ({ scanEventId, image }: { scanEventId: string; image: string }) =>
      scanAPI.uploadImage(scanEventId, image),
  });
};

export const useCompleteScan = () => {
  return useMutation({
    mutationFn: (id: string) => scanAPI.completeScan(id),
  });
};

export const useCancelScan = () => {
  return useMutation({
    mutationFn: (id: string) => scanAPI.cancelScan(id),
  });
};

// Inventory Hooks
export const useGetAllProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => inventoryAPI.getAllProducts(),
  });
};

export const useGetProductById = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => inventoryAPI.getProductById(id),
    enabled: !!id,
  });
};

export const useGetLowStockProducts = (threshold?: number) => {
  return useQuery({
    queryKey: ["lowStock", threshold],
    queryFn: () => inventoryAPI.getLowStockProducts(threshold),
  });
};

export const useGetInventoryStats = () => {
  return useQuery({
    queryKey: ["inventoryStats"],
    queryFn: () => inventoryAPI.getStats(),
  });
};

export const useCreateProduct = () => {
  return useMutation({
    mutationFn: (data: Parameters<typeof inventoryAPI.createProduct>[0]) =>
      inventoryAPI.createProduct(data),
  });
};

export const useUpdateProduct = () => {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof inventoryAPI.updateProduct>[1];
    }) => inventoryAPI.updateProduct(id, data),
  });
};

// Insights Hooks
export const useGetRestockRecommendations = (days?: number) => {
  return useQuery({
    queryKey: ["restockRecommendations", days],
    queryFn: () => insightsAPI.getRestockRecommendations(days),
  });
};

export const useGetSalesInsights = (days?: number) => {
  return useQuery({
    queryKey: ["salesInsights", days],
    queryFn: () => insightsAPI.getSalesInsights(days),
  });
};

export const useGetScanInsights = (days?: number) => {
  return useQuery({
    queryKey: ["scanInsights", days],
    queryFn: () => insightsAPI.getScanInsights(days),
  });
};

export const useGetProductPerformance = (limit?: number) => {
  return useQuery({
    queryKey: ["productPerformance", limit],
    queryFn: () => insightsAPI.getProductPerformance(limit),
  });
};

export const useGetTrends = (days?: number) => {
  return useQuery({
    queryKey: ["trends", days],
    queryFn: () => insightsAPI.getTrends(days),
  });
};

export const useGetDailyInsights = (days?: number) => {
  return useQuery({
    queryKey: ["dailyInsights", days],
    queryFn: () => insightsAPI.getDailyInsights(days),
  });
};

export const useGetUserActivity = (days?: number) => {
  return useQuery({
    queryKey: ["userActivity", days],
    queryFn: () => insightsAPI.getUserActivity(days),
  });
};
