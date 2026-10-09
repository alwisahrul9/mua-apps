import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { serverApi } from "@/lib/api/server"
import { extractMuaProfile, isProfileComplete } from "@/lib/profile"
import { getProvinces } from "@/lib/indonesia-regions"
import OnboardingForm from "./OnboardingForm"

export const metadata: Metadata = {
  title: "Lengkapi Profil MUA",
  robots: { index: false, follow: false },
}

export default async function OnboardingPage() {
  const session = await auth()
  if (!session?.user || !session.accessToken) redirect("/login")

  const response = await (await serverApi()).get("/user/profile").catch(() => null)
  const profile = response
    ? extractMuaProfile(response.data)
    : session.user.profile

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
