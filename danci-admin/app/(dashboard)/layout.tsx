import { AppShell } from "@/components/app-shell";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionUser();
  if (!session) redirect("/signin");
  return <AppShell session={session}>{children}</AppShell>;
}
