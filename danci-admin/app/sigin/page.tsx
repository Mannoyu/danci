import { redirect } from "next/navigation";

export default function MisspelledSignInPage() {
  redirect("/signin");
}
