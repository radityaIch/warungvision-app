import { z } from "zod";

export const RegisterDtoSchema = z.object({
  email: z.string().email("Email harus valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  name: z.string().min(1, "Nama harus diisi"),
  storeId: z.string().min(1, "Store ID harus diisi"),
  storeName: z.string().optional(),
  storeAddress: z.string().optional(),
  storePhone: z.string().optional(),
});

export const LoginDtoSchema = z.object({
  email: z.string().email("Email harus valid"),
  password: z.string().min(1, "Password harus diisi"),
});

export const UpdateProfileDtoSchema = z.object({
  name: z.string().optional(),
  password: z.string().min(6, "Password minimal 6 karakter").optional(),
});

export type RegisterDto = z.infer<typeof RegisterDtoSchema>;
export type LoginDto = z.infer<typeof LoginDtoSchema>;
export type UpdateProfileDto = z.infer<typeof UpdateProfileDtoSchema>;
