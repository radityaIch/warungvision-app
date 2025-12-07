import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { getPrismaClient, disconnectPrisma } from "../src/utils/prisma";

// Import modules
import { authModule } from "../src/modules/auth/controller";
import { inventoryModule } from "../src/modules/inventory/controller";
import { scanModule } from "../src/modules/scan/controller";
import { insightModule } from "../src/modules/insight/controller";
import { aiModule } from "../src/modules/ai/controller";

const app = new Elysia()
  .use(cors({ origin: process.env.CORS_ORIGIN || "*" }))
  .use(swagger())
  .get("/api/v1/health", () => ({ status: "ok", timestamp: new Date() }))
  .use(authModule)
  .use(inventoryModule)
  .use(scanModule)
  .use(insightModule)
  .use(aiModule)
  .all("*", ({ set }) => {
    set.status = 404;
    return { statusCode: 404, message: "Route not found" };
  });

export default app;
