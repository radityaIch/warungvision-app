import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { getPrismaClient, disconnectPrisma } from "./utils/prisma";
import { AppError, errorResponse } from "./utils/errors";

// Import modules
import { authModule } from "./modules/auth/controller";
import { inventoryModule } from "./modules/inventory/controller";
import { scanModule } from "./modules/scan/controller";
import { insightModule } from "./modules/insight/controller";

// Initialize Prisma
const prisma = getPrismaClient();

const app = new Elysia()
  .use(cors({ origin: process.env.CORS_ORIGIN || "*" }))
  .use(swagger())

  // Error handling middleware
  .onError(({ code, error, set }) => {
    if (error instanceof AppError) {
      set.status = error.statusCode;
      return {
        statusCode: error.statusCode,
        message: error.message,
        code: error.code,
      };
    }

    if (code === "VALIDATION") {
      set.status = 400;
      return {
        statusCode: 400,
        message: "Validation error",
        errors: (error as any).messages,
      };
    }

    console.error("Error:", error);
    set.status = 500;
    return {
      statusCode: 500,
      message: "Internal server error",
    };
  })

  // Health check endpoint
  .get("/api/v1/health", () => ({ status: "ok", timestamp: new Date() }))

  // Module routes
  .use(authModule)
  .use(inventoryModule)
  .use(scanModule)
  .use(insightModule)

  // 404 handler
  .all("*", ({ set }) => {
    set.status = 404;
    return {
      statusCode: 404,
      message: "Route not found",
    };
  });

// Start server
const port = parseInt(process.env.PORT || "3000", 10);
app.listen(port);

console.log(`🚀 API running on: http://localhost:${port}`);
console.log(`📝 Swagger: http://localhost:${port}/swagger`);
console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n⏹️  Shutting down gracefully...");
  await disconnectPrisma();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n⏹️  Shutting down gracefully...");
  await disconnectPrisma();
  process.exit(0);
});
