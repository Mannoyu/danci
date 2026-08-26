import { AppShell } from "@/components/app-shell";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getAdminCount } from "@/lib/admins";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if ((await getAdminCount()) === 0) redirect("/signup");
  const session = await getSessionUser();
  if (!session) redirect("/signin");
  return <AppShell session={session}>{children}</AppShell>;
}
