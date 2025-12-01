import Elysia, { t } from "elysia";
import { scanService } from "./service";
import { AddScanItemDtoSchema } from "./dto";
import { validateDto } from "../../utils/errors";
import { requireAuth } from "../../middleware/auth";

export const scanModule = new Elysia({
  prefix: "/api/v1/scan",
})
  .use(requireAuth)
  .post("/start", async ({ user }: any) => {
    return scanService.createScanEvent({
      userId: user!.sub,
    });
  })
  .get("/events", async ({ user }: any) => {
    return scanService.getAllScanEvents(user!.sub);
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
