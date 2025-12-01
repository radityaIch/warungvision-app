import { z } from "zod";

export const CreateProductDtoSchema = z.object({
  sku: z.string().min(1, "SKU harus diisi"),
  name: z.string().min(1, "Nama produk harus diisi"),
  description: z.string().optional(),
  price: z.number().min(0, "Harga minimal 0"),
  stock: z.number().int().min(0, "Stock minimal 0").optional().default(0),
  storeId: z.string().min(1, "Store ID harus diisi"),
  image: z.string().url("Image harus URL valid").optional(),
});

export const UpdateProductDtoSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  image: z.string().url().optional(),
});

export const UpdateStockDtoSchema = z.object({
  delta: z.number().int("Delta harus angka bulat"),
});

export type CreateProductDto = z.infer<typeof CreateProductDtoSchema>;
export type UpdateProductDto = z.infer<typeof UpdateProductDtoSchema>;
export type UpdateStockDto = z.infer<typeof UpdateStockDtoSchema>;
