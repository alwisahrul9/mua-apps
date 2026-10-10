import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getAuthenticatedUserState } from "@/lib/auth-route"
import { isProfileComplete } from "@/lib/profile"

export const metadata: Metadata = {
  title: "Login MUA",
  robots: { index: false, follow: false },
}

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userState = await getAuthenticatedUserState()

  if (userState) {
    redirect(isProfileComplete(userState.profile) ? "/dashboard" : "/onboarding")
  }

  return children
}
