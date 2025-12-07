import Elysia, { t } from "elysia";
import { scanService } from "./service";
import { AddScanItemDtoSchema, UploadImageDtoSchema } from "./dto";
import { validateDto } from "../../utils/errors";
import { verifyJwt } from "../../utils/jwt";

export const scanModule = new Elysia({
  prefix: "/api/v1/scan",
})
  .post("/start", async ({ query, headers }: { query: Record<string, any>; headers: Record<string, any> }) => {
    try {
      // Get storeId from query params
      const storeId = query?.storeId;
      if (!storeId) {
        return { error: "storeId required in query params" };
      }

      // Extract userId from Authorization header
      const authHeader = headers.authorization || headers.Authorization;
      if (!authHeader) {
        return { error: "Authorization header required" };
      }

      const token = authHeader.replace("Bearer ", "");
      let userId: string;

      try {
        const payload = verifyJwt(token);
        userId = payload.sub;
      } catch (err) {
        return { error: "Invalid or expired token" };
      }

      const result = await scanService.createScanEvent({
        userId,
      });
      return result;
    } catch (error) {
      console.error("[SCAN/START] ERROR:", error);
      throw error;
    }
  })
  .get("/events", async ({ query, headers }: { query: Record<string, any>; headers: Record<string, any> }) => {
    const storeId = query?.storeId;
    if (!storeId) return { error: "storeId required" };

    const authHeader = headers.authorization || headers.Authorization;
    if (!authHeader) return { error: "Authorization header required" };

    const token = authHeader.replace("Bearer ", "");
    let userId: string;

    try {
      const payload = verifyJwt(token);
      userId = payload.sub;
    } catch (err) {
      return { error: "Invalid or expired token" };
    }

    return scanService.getAllScanEvents(userId);
  })
  .get("/events/:id", async ({ params }) => {
    return scanService.getScanEvent(params.id);
  })
  .post(
    "/events/:id/items",
    async ({ params, body }) => {
      const dto = validateDto(AddScanItemDtoSchema, body);
      return scanService.addItemToScan(params.id, dto);
    },
    {
      body: t.Object({
        productId: t.String({ minLength: 1 }),
        count: t.Number({ minimum: 1 }),
      }),
    }
  )
  .delete("/items/:id", async ({ params }) => {
    return scanService.removeScanItem(params.id);
  })
  .post(
    "/events/:id/upload",
    async ({ params, body }) => {
      const dto = validateDto(UploadImageDtoSchema, body);
      return scanService.uploadAndProcessImage(params.id, dto.image, dto.prompts);
    },
    {
      body: t.Object({
        image: t.String({ minLength: 1 }),
        prompts: t.Optional(t.Array(t.String())),
      }),
    }
  )
  .post("/events/:id/complete", async ({ params }) => {
    return scanService.completeScan(params.id);
  })
  .delete("/events/:id", async ({ params }) => {
    return scanService.cancelScan(params.id);
  })
  .get("/admin/queued", async () => {
    return scanService.getQueuedScans();
  })
  .get("/admin/processing", async () => {
    return scanService.getProcessingScans();
  });
