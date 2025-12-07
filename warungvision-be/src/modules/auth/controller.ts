import Elysia, { t } from "elysia";
import { authService } from "./service";
import {
  RegisterDtoSchema,
  LoginDtoSchema,
  UpdateProfileDtoSchema,
} from "./dto";
import { validateDto } from "../../utils/errors";

export const authModule = new Elysia({ prefix: "/api/v1/auth" })
  .post(
    "/register",
    async ({ body }) => {
      const dto = validateDto(RegisterDtoSchema, body);
      return authService.register(dto);
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 6 }),
        name: t.String({ minLength: 1 }),
        storeId: t.String({ minLength: 1 }),
      }),
    }
  )
  .post(
    "/login",
    async ({ body }) => {
      const dto = validateDto(LoginDtoSchema, body);
      return authService.login(dto);
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 1 }),
      }),
    }
  );