import AdminSellerNotificationsForm from "@/components/admin/AdminSellerNotificationsForm";
import { createServiceSupabaseAdmin } from "@/lib/supabase-service-admin";

export default async function AdminSellerNotificationsPage() {
  const svc = createServiceSupabaseAdmin();

  let sellers: { id: number; name: string | null; slug: string | null; user_id: string | null }[] = [];
  let mode = "anon";

  if (svc) {
    mode = "service";
    const { data } = await svc
      .from("sellers")
      .select("id, name, slug, user_id")
      .order("id", { ascending: false })
      .limit(500);
    sellers = (data ?? []) as typeof sellers;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Satıcı bildirişləri</h1>
        <p className="mt-1 text-xs text-stone-500">
          Bildirişlər satıcı panelində zəng ikonunda görünür. Oxuma:{" "}
          <span className="font-mono text-stone-700">{mode}</span>
        </p>
      </div>

      {mode !== "service" ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Bu əməliyyat üçün serverdə{" "}
          <code className="rounded bg-white px-1 font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</code> lazımdır.
        </div>
      ) : (
        <AdminSellerNotificationsForm sellers={sellers} />
      )}
    </div>
  );
}
