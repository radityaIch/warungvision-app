import Elysia, { t } from "elysia";
import { insightService } from "./service";
import { requireAuth } from "../../middleware/auth";

export const insightModule = new Elysia({
  prefix: "/api/v1/insights",
})
  .get("/daily", async ({ query, user }: { query: Record<string, any>; user?: any }) => {
    let storeId = user?.storeId || query?.storeId;
    if (!storeId) throw new Error("StoreId not found");
    const days = query.days ? parseInt(query.days as string) : 7;
    return insightService.getDailyInsights(storeId, days);
  })
  .get("/scans", async ({ query, user }: { query: Record<string, any>; user?: any }) => {
    let storeId = user?.storeId || query?.storeId;
    if (!storeId) throw new Error("StoreId not found");
    const days = query.days ? parseInt(query.days as string) : 30;
    return insightService.getScanInsights(storeId, days);
  })
  .get("/products", async ({ query, user }: { query: Record<string, any>; user?: any }) => {
    let storeId = user?.storeId || query?.storeId;
    if (!storeId) throw new Error("StoreId not found");
    const limit = query.limit ? parseInt(query.limit as string) : 10;
    return insightService.getProductPerformance(storeId, limit);
  })
  .get("/trends", async ({ query, user }: { query: Record<string, any>; user?: any }) => {
    let storeId = user?.storeId || query?.storeId;
    if (!storeId) throw new Error("StoreId not found");
    const days = query.days ? parseInt(query.days as string) : 30;
    return insightService.getInventoryTrends(storeId, days);
  })
  .get("/user-activity", async ({ query, user }: { query: Record<string, any>; user?: any }) => {
    let storeId = user?.storeId || query?.storeId;
    if (!storeId) throw new Error("StoreId not found");
    const days = query.days ? parseInt(query.days as string) : 7;
    return insightService.getUserActivity(storeId, days);
  })
  .get("/restock-recommendations", async ({ query, user }: { query: Record<string, any>; user?: any }) => {
    let storeId = user?.storeId || query?.storeId;
    if (!storeId) throw new Error("StoreId not found");
    const days = query.days ? parseInt(query.days as string) : 30;
    return insightService.getRestockRecommendations(storeId, days);
  })
  .get("/sales", async ({ query, user }: { query: Record<string, any>; user?: any }) => {
    let storeId = user?.storeId || query?.storeId;
    if (!storeId) throw new Error("StoreId not found");
    const days = query.days ? parseInt(query.days as string) : 30;
    return insightService.getSalesInsights(storeId, days);
  });
