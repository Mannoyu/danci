import { redirect } from "next/navigation";
import { SignInForm } from "@/components/signin-form";
import { getAdminCount } from "@/lib/admins";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function SignInPage() {
  if ((await getAdminCount()) === 0) redirect("/signup");
  if (await getSessionUser()) redirect("/books");
  return <SignInForm />;
}
