import Elysia from "elysia";
import { bearer } from "@elysiajs/bearer";
import { verifyJwt } from "../utils/jwt";

export interface JWTPayload {
  sub: string;
  email: string;
  role: string;
  storeId: string;
}

// SIMPLE & WORKS: Bearer plugin + our own JWT verification + derive to add to context
export const requireAuth = (app: Elysia) =>
  app
    .use(bearer())
    .derive(({ bearer: token }) => {
      console.log("[🔐 AUTH MIDDLEWARE] CALLED!");
      console.log("[🔐 AUTH MIDDLEWARE] Token received:", token ? "YES ✅" : "NO ❌");
      
      if (!token) {
        console.error("[🔐 AUTH MIDDLEWARE] ❌ No bearer token in request!");
        throw new Error("Missing bearer token");
      }

      try {
        console.log("[🔐 AUTH MIDDLEWARE] Verifying token...");
        const payload = verifyJwt(token);
        console.log("[🔐 AUTH MIDDLEWARE] ✅ TOKEN VERIFIED! User:", payload.email);
        
        // Return object that gets merged into context
        return { user: payload as JWTPayload };
      } catch (err) {
        console.error("[🔐 AUTH MIDDLEWARE] ❌ Token verification failed:", err instanceof Error ? err.message : err);
        throw new Error("Invalid token");
      }
    });

export const optionalAuth = (app: Elysia) =>
  app
    .use(bearer())
    .derive(({ bearer: token }) => {
      if (!token) {
        console.log("[🔐 OPTIONAL AUTH] No token provided");
        return { user: null as JWTPayload | null };
      }

      try {
        const payload = verifyJwt(token);
        console.log("[🔐 OPTIONAL AUTH] ✅ User:", payload.email);
        return { user: payload as JWTPayload };
      } catch (error) {
        console.log("[🔐 OPTIONAL AUTH] Token invalid, continuing without auth");
        return { user: null as JWTPayload | null };
      }
    });
