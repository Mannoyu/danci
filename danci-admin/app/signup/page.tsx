import { redirect } from "next/navigation";
import { SignUpForm } from "@/components/signup-form";
import { getAdminCount } from "@/lib/admins";

export const dynamic = "force-dynamic";

export default async function SignUpPage() {
  if ((await getAdminCount()) > 0) redirect("/signin");
  return <SignUpForm />;
}
