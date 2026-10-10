import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getAuthenticatedUserState } from "@/lib/auth-route"
import { isProfileComplete } from "@/lib/profile"
import { getProvinces } from "@/lib/indonesia-regions"
import OnboardingForm from "./OnboardingForm"

export const metadata: Metadata = {
  title: "Lengkapi Profil MUA",
  robots: { index: false, follow: false },
}

export default async function OnboardingPage() {
  const userState = await getAuthenticatedUserState()
  if (!userState) redirect("/login")

  const { session, profile } = userState

  if (isProfileComplete(profile)) redirect("/dashboard")

  const provinces = await getProvinces().catch(() => [])

  return (
    <OnboardingForm
      profile={profile}
      provinces={provinces}
      userName={session.user.name ?? "MUA"}
    />
  )
}
