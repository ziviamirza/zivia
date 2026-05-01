"use client";

import { useTransition } from "react";
import { deleteProduct } from "@/app/(vendor)/dashboard/actions";

type Props = {
  productId: number;
};

export function DeleteProductButton({ productId }: Props) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm("Bu məhsulu silmək istədiyinizə əminsiniz?")) return;
    startTransition(async () => {
      const res = await deleteProduct(productId);
      if (res && "error" in res && res.error) {
        window.alert(res.error);
      } else {
        window.location.reload();
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="mt-3 w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-800 transition hover:bg-red-100 disabled:opacity-50"
    >
      {pending ? "Silinir..." : "Məhsulu sil"}
    </button>
  );
}
