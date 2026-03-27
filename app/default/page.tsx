import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE, ONBOARDED_COOKIE } from "@/lib/auth";

export default async function DefaultPage() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get(AUTH_COOKIE)?.value === "1";
  const onboarded = cookieStore.get(ONBOARDED_COOKIE)?.value === "1";

  if (!isLoggedIn) {
    redirect("/login");
  }

  redirect(onboarded ? "/dashboard" : "/onboarding");
}
