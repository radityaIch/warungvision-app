import Elysia, { t } from "elysia";
import { inventoryService } from "./service";
import {
  CreateProductDtoSchema,
  UpdateProductDtoSchema,
  UpdateStockDtoSchema,
} from "./dto";
import { validateDto } from "../../utils/errors";
import { requireAuth } from "../../middleware/auth";

export const inventoryModule = new Elysia({
  prefix: "/api/v1/inventory",
})
  .use(requireAuth)
  .post(
    "/products",
    async ({ body }) => {
      const dto = validateDto(CreateProductDtoSchema, body);
      return inventoryService.createProduct({ ...dto, stock: dto.stock ?? 0 });
    },
    {
      body: t.Object({
        sku: t.String({ minLength: 1 }),
        name: t.String({ minLength: 1 }),
        description: t.Optional(t.String()),
        price: t.Number({ minimum: 0 }),
        stock: t.Optional(t.Number({ minimum: 0 })),
        storeId: t.String({ minLength: 1 }),
        image: t.Optional(t.String({ format: "uri" })),
      }),
    }
  )
  .get("/products", async (context) => {
    const { user } = context as any;
    return inventoryService.getAllProductsByStore(user!.storeId);
  })
  .get("/products/:id", async ({ params }) => {
    return inventoryService.getProduct(params.id);
  })
  .get("/products/sku/:sku", async ({ params }) => {
    return inventoryService.getProductsBySku(params.sku);
  })
  .patch(
    "/products/:id",
    async ({ params, body }) => {
      const dto = validateDto(UpdateProductDtoSchema, body);
      return inventoryService.updateProduct(params.id, dto);
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        description: t.Optional(t.String()),
        price: t.Optional(t.Number({ minimum: 0 })),
        image: t.Optional(t.String({ format: "uri" })),
      }),
    }
  )
  .delete("/products/:id", async ({ params }) => {
    return inventoryService.deleteProduct(params.id);
  })
  .post(
    "/products/:id/stock",
    async (context) => {
      const { params, user, body } = context as any;
      const dto = validateDto(UpdateStockDtoSchema, body);
      return inventoryService.updateStock(params.id, user!.sub, dto);
    },
    {
      body: t.Object({
        delta: t.Number(),
      }),
    }
  )
  .get("/stock-history", async ({ query }) => {
    return inventoryService.getStockHistory(
      query.productId,
      query.startDate,
      query.endDate
    );
  })
  .get("/stats", async (context) => {
    const { user } = context as any;
    return inventoryService.getInventoryStats(user!.storeId);
  })
  .get("/low-stock", async (context) => {
    const { user, query } = context as any;
    const threshold = query.threshold ? parseInt(query.threshold as string) : 5;
    return inventoryService.getLowStockProducts(user!.storeId, threshold);
  });
