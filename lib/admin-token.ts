import { SignJWT, jwtVerify } from "jose";

export const ADMIN_COOKIE = "zivia_admin";

function getSecret(): Uint8Array | null {
  const s = process.env.ADMIN_JWT_SECRET?.trim();
  if (!s || s.length < 24) return null;
  return new TextEncoder().encode(s);
}

export function adminAuthConfigured(): boolean {
  return Boolean(
    process.env.ADMIN_EMAIL?.trim() &&
      process.env.ADMIN_CODE?.trim() &&
      process.env.ADMIN_JWT_SECRET?.trim() &&
      process.env.ADMIN_JWT_SECRET.trim().length >= 24,
  );
}

export async function signAdminJwt(): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyAdminJwt(token: string | undefined | null): Promise<boolean> {
  if (!token?.trim()) return false;
  const secret = getSecret();
  if (!secret) return false;
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}
