import { z } from "zod";

export const CreateScanEventDtoSchema = z.object({
  userId: z.string().min(1, "User ID harus diisi"),
});

export const AddScanItemDtoSchema = z.object({
  productId: z.string().min(1, "Product ID harus diisi"),
  count: z.number().int().min(1, "Count minimal 1"),
});

export type CreateScanEventDto = z.infer<typeof CreateScanEventDtoSchema>;
export type AddScanItemDto = z.infer<typeof AddScanItemDtoSchema>;
