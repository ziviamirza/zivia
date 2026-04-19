/**
 * Standart admin girişi (JWT cookie). Satıcı Supabase hesabından tamamilə ayrıdır.
 * Production-da təhlükəsizlik üçün .env ilə ADMIN_* üzərindən əzmək tövsiyə olunur.
 */
export const DEFAULT_ADMIN_EMAIL = "admin@zivia.az";
export const DEFAULT_ADMIN_CODE = "Zivia2026-Admin-9kLm-Nezaret";
export const DEFAULT_ADMIN_JWT_SECRET =
  "8db0ab2061ba9e7a12b6d6921bcfe2480fba923f6a1fd0307115acc0394046cc";

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
  return cleanEnvValue(process.env.ADMIN_EMAIL) || DEFAULT_ADMIN_EMAIL;
}

export function resolveAdminCode(): string {
  return cleanEnvValue(process.env.ADMIN_CODE) || DEFAULT_ADMIN_CODE;
}

export function resolveAdminJwtSecret(): string {
  return cleanEnvValue(process.env.ADMIN_JWT_SECRET) || DEFAULT_ADMIN_JWT_SECRET;
}
