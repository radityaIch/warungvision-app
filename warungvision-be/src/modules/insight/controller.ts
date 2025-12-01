import Elysia, { t } from "elysia";
import { insightService } from "./service";
import { requireAuth } from "../../middleware/auth";

export const insightModule = new Elysia({
  prefix: "/api/v1/insights",
})
  .use(requireAuth)
  .get("/daily", async ({ user, query }) => {
    const days = query.days ? parseInt(query.days as string) : 7;
    return insightService.getDailyInsights(user!.storeId, days);
  })
  .get("/scans", async ({ user, query }) => {
    const days = query.days ? parseInt(query.days as string) : 30;
    return insightService.getScanInsights(user!.storeId, days);
  })
  .get("/products", async ({ user, query }) => {
    const limit = query.limit ? parseInt(query.limit as string) : 10;
    return insightService.getProductPerformance(user!.storeId, limit);
  })
  .get("/trends", async ({ user, query }) => {
    const days = query.days ? parseInt(query.days as string) : 30;
    return insightService.getInventoryTrends(user!.storeId, days);
  })
  .get("/user-activity", async ({ user, query }) => {
    const days = query.days ? parseInt(query.days as string) : 7;
    return insightService.getUserActivity(user!.storeId, days);
  });
