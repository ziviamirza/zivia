/**
 * Admin auth yalnız env üzərindən idarə olunur.
 * Təhlükəsizlik üçün heç bir fallback/default credential yoxdur.
 */

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

export function resolveAdminEmail(): string {
  return cleanEnvValue(process.env.ADMIN_EMAIL);
}

export function resolveAdminCode(): string {
  return cleanEnvValue(process.env.ADMIN_CODE);
}

export function resolveAdminJwtSecret(): string {
  return cleanEnvValue(process.env.ADMIN_JWT_SECRET);
}

export function missingAdminEnvKeys(): string[] {
  const missing: string[] = [];
  if (!resolveAdminEmail()) missing.push("ADMIN_EMAIL");
  if (!resolveAdminCode()) missing.push("ADMIN_CODE");
  if (!resolveAdminJwtSecret()) missing.push("ADMIN_JWT_SECRET");
  return missing;
}
