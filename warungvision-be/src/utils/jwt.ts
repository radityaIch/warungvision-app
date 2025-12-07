// JWT utilities for signing and verifying tokens
// Uses cryptographic functions to create and verify JWT tokens

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

/**
 * Base64 URL encode
 */
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Base64 URL decode
 */
function base64UrlDecode(str: string): string {
  str += "=".repeat((4 - (str.length % 4)) % 4);
  return Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString();
}

/**
 * Sign a JWT token
 */
export const signJwt = (payload: JwtPayload): string => {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const claims = {
    ...payload,
    iat: now,
    exp: now + 7 * 24 * 60 * 60, // 7 days
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(claims));
  const message = `${encodedHeader}.${encodedPayload}`;

  // Create HMAC signature
  const hmac = new Bun.CryptoHasher("sha256")
    .update(JWT_SECRET)
    .update(message)
    .digest("base64");

  const signature = base64UrlEncode(hmac);

  return `${message}.${signature}`;
};

/**
 * Verify a JWT token
 */
export const verifyJwt = (token: string): JwtPayload => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid token format");
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const message = `${encodedHeader}.${encodedPayload}`;

    // Verify signature
    const hmac = new Bun.CryptoHasher("sha256")
      .update(JWT_SECRET)
      .update(message)
      .digest("base64");

    const expectedSignature = base64UrlEncode(hmac);

    if (signature !== expectedSignature) {
      throw new Error("Invalid signature");
    }

    // Decode payload
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as JwtPayload;

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new Error("Token expired");
    }

    return payload;
  } catch (error) {
    throw new Error(`Invalid token: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};
