import Elysia from "elysia";
import { jwt } from "@elysiajs/jwt";

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  storeId: string;
  iat?: number;
  exp?: number;
  [key: string]: string | number | undefined;
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

const jwtInstance = jwt({
  name: "jwt",
  secret: JWT_SECRET,
});

export const createJwtPlugin = () => {
  return new Elysia({
    name: "jwt",
  })
    .use(jwtInstance)
    .derive(async ({ headers, jwt }) => {
      const authHeader = headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return {
          user: null,
          token: null,
        };
      }

      const token = authHeader.slice(7);

      try {
        const payload = await jwt.verify(token);

        return {
          user: payload as unknown as JwtPayload,
          token,
        };
      } catch (error) {
        return {
          user: null,
          token: null,
        };
      }
    });
};

export const signJwt = async (payload: JwtPayload): Promise<string> => {
  const app = new Elysia().use(jwtInstance);
  const { iat, exp, ...payloadWithoutClaims } = payload;
  return app.decorator.jwt.sign(payloadWithoutClaims);
};

export const verifyJwt = async (token: string): Promise<JwtPayload> => {
  const app = new Elysia().use(jwtInstance);
  return app.decorator.jwt.verify(token) as unknown as Promise<JwtPayload>;
};
