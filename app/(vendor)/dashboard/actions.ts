"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  PRODUCT_IMAGES_BUCKET,
  productImageObjectPathsForUser,
} from "@/lib/product-image-storage";
import { productRowImageUrls } from "@/lib/product-images";
import { createClient } from "@/lib/supabase/server";

export async function deleteProduct(productId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: seller } = await supabase
    .from("sellers")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!seller) {
    return { error: "Satıcı profili tapılmadı." };
  }

  const { data: row } = await supabase
    .from("products")
    .select("id, seller_id, image, images")
    .eq("id", productId)
    .maybeSingle();

  if (!row) {
    return { error: "Məhsul tapılmadı." };
  }

  if (Number(row.seller_id) !== Number(seller.id)) {
    return { error: "Bu məhsulu silmək üçün icazəniz yoxdur." };
  }

  const urls = productRowImageUrls(
    row as { image?: string | null; images?: unknown },
  );
  const paths = productImageObjectPathsForUser(urls, user.id);
  if (paths.length > 0) {
    await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(paths);
  }

  const { error } = await supabase.from("products").delete().eq("id", productId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/products");
  revalidatePath("/");

  return { ok: true };
}
