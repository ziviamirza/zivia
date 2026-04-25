import AdminPanelShell from "@/components/admin/AdminPanelShell";
import { requireAdminOrRedirect } from "@/lib/admin-guard";

export default async function AdminPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdminOrRedirect();

  return <AdminPanelShell>{children}</AdminPanelShell>;
}
