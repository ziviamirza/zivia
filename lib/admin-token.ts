import { SignJWT, jwtVerify } from "jose";

export const ADMIN_COOKIE = "zivia_admin";

/** Vercel/UI-dən kopyalayıb dırnaq qalsa təmizləyir. */
export function cleanEnvValue(raw: string | undefined): string {
  if (!raw) return "";
  let s = raw.trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

function getSecret(): Uint8Array | null {
  const s = cleanEnvValue(process.env.ADMIN_JWT_SECRET);
  if (!s || s.length < 24) return null;
  return new TextEncoder().encode(s);
}

export function adminAuthConfigured(): boolean {
  const jwt = cleanEnvValue(process.env.ADMIN_JWT_SECRET);
  return Boolean(
    cleanEnvValue(process.env.ADMIN_EMAIL) &&
      cleanEnvValue(process.env.ADMIN_CODE) &&
      jwt.length >= 24,
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
