import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getAdminCount } from "@/lib/admins";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if ((await getAdminCount()) === 0) redirect("/signup");
  const session = await getSessionUser();
  redirect(session ? "/books" : "/signin");
}
