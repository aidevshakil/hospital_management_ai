import AdminShell from "../../components/Admin/AdminShell";
import { getCurrentAdmin } from "../../lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();

  // Unauthenticated (e.g. /admin/login, which middleware lets through) renders
  // without the dashboard chrome. Middleware guarantees every other /admin route
  // has a valid session before reaching here.
  if (!admin) {
    return <>{children}</>;
  }

  return <AdminShell admin={admin}>{children}</AdminShell>;
}
