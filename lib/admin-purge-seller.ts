import type { SupabaseClient } from "@supabase/supabase-js";
import { PRODUCT_IMAGES_BUCKET } from "@/lib/product-image-storage";

function isBenignStorageErrorMessage(msg: string): boolean {
  const m = msg.toLowerCase();
  return (
    m.includes("not found") ||
    m.includes("does not exist") ||
    m.includes("bucket not found") ||
    m.includes("the resource was not found")
  );
}

/** Storage list bəzən faylı id-siz qaytarır; yalnız id-yə baxmaq faylı “qovluq” edib növbəti list xətası yaradır. */
function isStorageFileEntry(e: {
  id?: string | null;
  name?: string | null;
  metadata?: { size?: number } | null;
}): boolean {
  if (e.id != null && String(e.id).length > 0) return true;
  if (e.metadata != null && typeof e.metadata.size === "number") return true;
  const n = e.name ?? "";
  return /\.(jpe?g|png|gif|webp|heic|heif)$/i.test(n);
}

/**
 * Satıcının product-images bucketində bütün obyektlərini silir (prefix = userId).
 * Service role ilə çağırın.
 */
export async function adminRemoveSellerProductImages(
  svc: SupabaseClient,
  userId: string,
): Promise<{ error: Error | null }> {
  const bucket = PRODUCT_IMAGES_BUCKET;
  const maxDepth = 8;

  async function collectObjectPaths(
    folderPrefix: string,
    depth: number,
  ): Promise<{ paths: string[]; error: Error | null }> {
    if (depth > maxDepth) {
      return { paths: [], error: new Error("Storage qovluq dərinliyi həddindən artıqdır.") };
    }
    const { data: entries, error } = await svc.storage.from(bucket).list(folderPrefix, {
      limit: 1000,
    });
    if (error) {
      if (isBenignStorageErrorMessage(error.message)) {
        return { paths: [], error: null };
      }
      return { paths: [], error: new Error(error.message) };
    }
    const out: string[] = [];
    for (const e of entries ?? []) {
      if (!e.name) continue;
      const path = folderPrefix ? `${folderPrefix}/${e.name}` : e.name;
      if (isStorageFileEntry(e)) {
        out.push(path);
      } else {
        const nested = await collectObjectPaths(path, depth + 1);
        if (nested.error) return nested;
        out.push(...nested.paths);
      }
    }
    return { paths: out, error: null };
  }

  const { paths, error: listErr } = await collectObjectPaths(userId, 0);
  if (listErr) return { error: listErr };
  if (paths.length === 0) return { error: null };

  const batch = 100;
  for (let i = 0; i < paths.length; i += batch) {
    const chunk = paths.slice(i, i + batch);
    const { error } = await svc.storage.from(bucket).remove(chunk);
    if (error && !isBenignStorageErrorMessage(error.message)) {
      return { error: new Error(error.message) };
    }
  }
  return { error: null };
}

type PgishError = { message?: string | null; code?: string | null; details?: string | null };

/**
 * Bu cədvəl Supabase-də migration olmadan olmaya bilər — silməni dayandırmırıq.
 * PostgREST: PGRST205 "Could not find the table ... in the schema cache"
 */
function isOptionalTableMissing(err: PgishError | null | undefined, table: string): boolean {
  if (!err) return false;
  const m = (err.message ?? "").toLowerCase();
  const d = (err.details ?? "").toLowerCase();
  const t = table.toLowerCase();
  const haystack = `${m} ${d}`;
  const mentionsTable = haystack.includes(t);

  const c = (err.code ?? "").toUpperCase();
  if (c === "PGRST205" && mentionsTable) return true;

  if (!mentionsTable) return false;
  return (
    m.includes("schema cache") ||
    m.includes("could not find") ||
    m.includes("does not exist") ||
    m.includes("42p01") ||
    m.includes("undefined_table")
  );
}

function isIgnorableAuthUserMissing(message: string): boolean {
  const m = message.toLowerCase();
  return m.includes("user not found") || (m.includes("auth") && m.includes("not found"));
}

export type PurgeSellerResult =
  | { ok: true }
  | { ok: false; step: string; message: string };

export type PurgeSellerOptions = {
  /**
   * false: yalnız satıcı/məhsul/storage/bildirişlər; auth saxlanılır (bir user üçün
   * bir neçə satıcı sətiri təmizlənəndə son çağırışda true edin).
   * @default true
   */
  deleteAuthUser?: boolean;
};

/**
 * Satıcıya aid DB sətirləri, şəkillər və (varsayılan) auth hesabı silinir.
 * Sıra: admin bildirişləri → storage → məhsullar → satıcı → auth.users
 * (seller_notifications auth.users üzərində CASCADE).
 */
export async function adminPurgeSellerCompletely(
  svc: SupabaseClient,
  sellerId: number,
  userId: string | null,
  options?: PurgeSellerOptions,
): Promise<PurgeSellerResult> {
  const deleteAuthUser = options?.deleteAuthUser !== false;
  const sid = sellerId;

  const { error: nErr } = await svc.from("admin_notifications").delete().eq("seller_id", sid);
  if (nErr && !isOptionalTableMissing(nErr, "admin_notifications")) {
    return { ok: false, step: "admin_notifications", message: nErr.message };
  }

  if (userId) {
    const { error: stErr } = await adminRemoveSellerProductImages(svc, userId);
    if (stErr) {
      return { ok: false, step: "storage", message: stErr.message };
    }
  }

  const { error: evErr } = await svc.from("seller_analytics_events").delete().eq("seller_id", sid);
  if (evErr && !isOptionalTableMissing(evErr, "seller_analytics_events")) {
    return { ok: false, step: "seller_analytics_events", message: evErr.message };
  }

  const { error: pErr } = await svc.from("products").delete().eq("seller_id", sid);
  if (pErr) {
    return { ok: false, step: "products", message: pErr.message };
  }

  const { error: sErr } = await svc.from("sellers").delete().eq("id", sid);
  if (sErr) {
    return { ok: false, step: "sellers", message: sErr.message };
  }

  if (userId && deleteAuthUser) {
    const { error: authErr } = await svc.auth.admin.deleteUser(userId);
    if (authErr && !isIgnorableAuthUserMissing(authErr.message)) {
      return { ok: false, step: "auth", message: authErr.message };
    }
  }

  return { ok: true };
}
