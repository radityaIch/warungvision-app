import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
});

// Add token to requests and storeId from localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  const user = localStorage.getItem("user");
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add storeId to query params as fallback
  if (user) {
    try {
      const userData = JSON.parse(user);
      if (userData.storeId) {
        config.params = { ...(config.params || {}), storeId: userData.storeId };
        console.log("[API] Added storeId to params:", userData.storeId);
      } else {
        console.warn("[API] User object missing storeId:", userData);
      }
    } catch (e) {
      console.error("[API] Failed to parse user from localStorage:", e);
    }
  } else {
    console.warn("[API] No user in localStorage");
  }
  
  return config;
});

// Auth API
export const authAPI = {
  register: (data: {
    email: string;
    password: string;
    name: string;
    storeId: string;
    storeName?: string;
    storeAddress?: string;
    storePhone?: string;
  }) => apiClient.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    apiClient.post("/auth/login", data),
  getProfile: () => apiClient.get("/auth/profile"),
  updateProfile: (data: { name?: string; password?: string }) =>
    apiClient.patch("/auth/profile", data),
};

// Scan API
export const scanAPI = {
  startScan: () => apiClient.post("/scan/start", {}),
  getAllScans: () => apiClient.get("/scan/events"),
  getScanById: (id: string) => apiClient.get(`/scan/events/${id}`),
  uploadImage: (scanEventId: string, image: string, prompts?: string[]) =>
    apiClient.post(`/scan/events/${scanEventId}/upload`, { image, prompts }),
  completeScan: (id: string) => apiClient.post(`/scan/events/${id}/complete`, {}),
  cancelScan: (id: string) => apiClient.delete(`/scan/events/${id}`),
};

// Inventory API
export const inventoryAPI = {
  getAllProducts: () => apiClient.get("/inventory/products"),
  getProductById: (id: string) => apiClient.get(`/inventory/products/${id}`),
  createProduct: (data: {
    sku: string;
    name: string;
    description?: string;
    price: number;
    stock?: number;
    storeId: string;
    image?: string;
  }) => apiClient.post("/inventory/products", data),
  updateProduct: (
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      image?: string;
    }
  ) => apiClient.patch(`/inventory/products/${id}`, data),
  updateStock: (id: string, delta: number) =>
    apiClient.post(`/inventory/products/${id}/stock`, { delta }),
  deleteProduct: (id: string) =>
    apiClient.delete(`/inventory/products/${id}`),
  getLowStockProducts: (threshold?: number) =>
    apiClient.get("/inventory/low-stock", {
      params: { threshold: threshold || 5 },
    }),
  getStats: () => apiClient.get("/inventory/stats"),
};

// Insights API
export const insightsAPI = {
  getDailyInsights: (days?: number) =>
    apiClient.get("/insights/daily", { params: { days: days || 7 } }),
  getScanInsights: (days?: number) =>
    apiClient.get("/insights/scans", { params: { days: days || 30 } }),
  getProductPerformance: (limit?: number) =>
    apiClient.get("/insights/products", { params: { limit: limit || 10 } }),
  getTrends: (days?: number) =>
    apiClient.get("/insights/trends", { params: { days: days || 30 } }),
  getUserActivity: (days?: number) =>
    apiClient.get("/insights/user-activity", { params: { days: days || 7 } }),
  getRestockRecommendations: (days?: number) =>
    apiClient.get("/insights/restock-recommendations", {
      params: { days: days || 30 },
    }),
  getSalesInsights: (days?: number) =>
    apiClient.get("/insights/sales", { params: { days: days || 30 } }),
};

export default apiClient;
