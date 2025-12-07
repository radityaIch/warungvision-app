import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { getPrismaClient, disconnectPrisma } from "./utils/prisma";

// Import modules
import { authModule } from "./modules/auth/controller";
import { inventoryModule } from "./modules/inventory/controller";
import { scanModule } from "./modules/scan/controller";
import { insightModule } from "./modules/insight/controller";
import { aiModule } from "./modules/ai/controller";

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

const port = parseInt(process.env.PORT || "3000", 10);

try {
  app.listen(port);
  console.log(`✅ Server running on http://localhost:${port}\n`);
} catch (error) {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
}

process.on("SIGINT", async () => {
  console.log("\n⏹️ Shutting down...");
  await disconnectPrisma();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n⏹️ Shutting down...");
  await disconnectPrisma();
  process.exit(0);
});
