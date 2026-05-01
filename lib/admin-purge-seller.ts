import type { SupabaseClient } from "@supabase/supabase-js";
import { PRODUCT_IMAGES_BUCKET } from "@/lib/product-image-storage";

/**
 * Satıcının product-images bucketində bütün obyektlərini silir (prefix = userId).
 * Service role ilə çağırın.
 */
export async function adminRemoveSellerProductImages(
  svc: SupabaseClient,
  userId: string,
): Promise<{ error: Error | null }> {
  const bucket = PRODUCT_IMAGES_BUCKET;

  async function collectObjectPaths(folderPrefix: string): Promise<{ paths: string[]; error: Error | null }> {
    const { data: entries, error } = await svc.storage.from(bucket).list(folderPrefix, {
      limit: 1000,
    });
    if (error) return { paths: [], error: new Error(error.message) };
    const out: string[] = [];
    for (const e of entries ?? []) {
      if (!e.name) continue;
      const path = folderPrefix ? `${folderPrefix}/${e.name}` : e.name;
      if (e.id) {
        out.push(path);
      } else {
        const nested = await collectObjectPaths(path);
        if (nested.error) return nested;
        out.push(...nested.paths);
      }
    }
    return { paths: out, error: null };
  }

  const { paths, error: listErr } = await collectObjectPaths(userId);
  if (listErr) return { error: listErr };
  if (paths.length === 0) return { error: null };

  const batch = 100;
  for (let i = 0; i < paths.length; i += batch) {
    const chunk = paths.slice(i, i + batch);
    const { error } = await svc.storage.from(bucket).remove(chunk);
    if (error) return { error: new Error(error.message) };
  }
  return { error: null };
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
  if (nErr) {
    return { ok: false, step: "admin_notifications", message: nErr.message };
  }

  if (userId) {
    const { error: stErr } = await adminRemoveSellerProductImages(svc, userId);
    if (stErr) {
      return { ok: false, step: "storage", message: stErr.message };
    }
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
    if (authErr) {
      return { ok: false, step: "auth", message: authErr.message };
    }
  }

  return { ok: true };
}
