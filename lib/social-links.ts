/** Sosial və xarici keçidləri təhlükəsiz https URL-ə çevirir */

export function normalizeSocialUrl(
  raw: string | null | undefined,
  kind: "instagram" | "tiktok",
): string | null {
  const t = raw?.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  const cleaned = t.replace(/^@+/, "").replace(/^\/*/, "");
  if (!cleaned) return null;

  if (kind === "instagram") {
    if (cleaned.includes("instagram.com") || cleaned.includes("instagr.am")) {
      return cleaned.startsWith("http") ? cleaned : `https://${cleaned}`;
    }
    return `https://instagram.com/${cleaned}`;
  }

  if (kind === "tiktok") {
    if (cleaned.includes("tiktok.com")) {
      return cleaned.startsWith("http") ? cleaned : `https://${cleaned}`;
    }
    return `https://www.tiktok.com/@${cleaned.replace(/^@/, "")}`;
  }

  return null;
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
