import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";

export default async function AdminUsersLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionUser();
  if (!session) redirect("/signin");
  if (session.role !== "system_admin") redirect("/books");
  return children;
}
