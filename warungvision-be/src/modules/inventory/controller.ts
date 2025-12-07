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
  .get("/products", async ({ query, user }: { query: Record<string, any>; user?: any }) => {
    const storeId = user?.storeId || query?.storeId;
    if (!storeId) throw new Error("StoreId not found");
    return inventoryService.getAllProductsByStore(storeId);
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
    async (context: any) => {
      const { params, user, body } = context;
      console.log("[INVENTORY] Update stock - User context:", user);
      if (!user) throw new Error("User not found in context");
      const dto = validateDto(UpdateStockDtoSchema, body);
      return inventoryService.updateStock(params.id, user.sub, dto);
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
  .get("/stats", async ({ query, user }: { query: Record<string, any>; user?: any }) => {
    let storeId = user?.storeId || query?.storeId;
    if (!storeId) {
      throw new Error("StoreId not found");
    }
    return inventoryService.getInventoryStats(storeId);
  })
  .get("/low-stock", async ({ query, user }: { query: Record<string, any>; user?: any }) => {
    let storeId = user?.storeId || query?.storeId;
    if (!storeId) throw new Error("StoreId not found");
    const threshold = query.threshold ? parseInt(query.threshold as string) : 5;
    return inventoryService.getLowStockProducts(storeId, threshold);
  });
