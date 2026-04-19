import { timingSafeEqual } from "node:crypto";

function bufEq(a: string, b: string): boolean {
  const x = Buffer.from(a, "utf8");
  const y = Buffer.from(b, "utf8");
  if (x.length !== y.length) return false;
  return timingSafeEqual(x, y);
}

export function validateAdminCredentials(email: string, code: string): boolean {
  const wantEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";
  const wantCode = process.env.ADMIN_CODE?.trim() ?? "";
  if (!wantEmail || !wantCode) return false;
  const gotEmail = email.trim().toLowerCase();
  const gotCode = code.trim();
  return bufEq(gotEmail, wantEmail) && bufEq(gotCode, wantCode);
}
