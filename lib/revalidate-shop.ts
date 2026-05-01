import { revalidatePath } from "next/cache";

/** Satıcı/məhsul silindikdən sonra vitrin səhifələrinin cache-i təmizlənir. */
export function revalidateShopVitrin(): void {
  revalidatePath("/");
  revalidatePath("/sellers");
  revalidatePath("/products");
}
