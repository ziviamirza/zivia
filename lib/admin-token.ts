import { SignJWT, jwtVerify } from "jose";
import { resolveAdminJwtSecret } from "@/lib/admin-config";

export const ADMIN_COOKIE = "zivia_admin";

function getSecret(): Uint8Array | null {
  const s = resolveAdminJwtSecret();
  if (!s || s.length < 24) return null;
  return new TextEncoder().encode(s);
}

/** JWT yaradıla bilirsə admin girişi aktiv sayılır (yalnız env dəyərləri ilə). */
export function adminAuthConfigured(): boolean {
  return resolveAdminJwtSecret().length >= 24;
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
