import AdminPanelShell from "@/components/admin/AdminPanelShell";
import { requireAdminOrRedirect } from "@/lib/admin-guard";
import { createServiceSupabaseAdmin } from "@/lib/supabase-service-admin";

export default async function AdminPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdminOrRedirect();

  let pendingSellerCount = 0;
  const svc = createServiceSupabaseAdmin();
  if (svc) {
    const { count } = await svc
      .from("sellers")
      .select("*", { count: "exact", head: true })
      .eq("approval_status", "pending");
    pendingSellerCount = count ?? 0;
  }

  return <AdminPanelShell pendingSellerCount={pendingSellerCount}>{children}</AdminPanelShell>;
}
