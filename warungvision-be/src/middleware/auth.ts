import Elysia from "elysia";
import { verifyJwt } from "../utils/jwt";
import { AppError } from "../utils/errors";

export interface AuthContext {
  user: {
    sub: string;
    email: string;
    role: string;
    storeId: string;
  } | null;
}

export const requireAuth = new Elysia({
  name: "require-auth",
})
  .derive(async ({ headers }) => {
    const authHeader = headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError(401, "Unauthorized - Missing or invalid token");
    }

    const token = authHeader.slice(7);

    try {
      const user = await verifyJwt(token);
      return { user };
    } catch (error) {
      throw new AppError(401, "Unauthorized - Invalid token");
    }
  });

export const optionalAuth = new Elysia({
  name: "optional-auth",
})
  .derive(async ({ headers }) => {
    const authHeader = headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return { user: null };
    }

    const token = authHeader.slice(7);

    try {
      const user = await verifyJwt(token);
      return { user };
    } catch (error) {
      return { user: null };
    }
  });
