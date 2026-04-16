/** Məhsul/slug üçün (DB trigger-dəki məntiqlə uyğun). */
export function slugifyAz(text: string): string {
  return text
    .toLowerCase()
    .replaceAll("ə", "e")
    .replaceAll("ü", "u")
    .replaceAll("ö", "o")
    .replaceAll("ğ", "g")
    .replaceAll("ş", "s")
    .replaceAll("ç", "c")
    .replaceAll("ı", "i")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
