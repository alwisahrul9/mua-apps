import type { MuaProfile } from "@/lib/api/types"
import { unwrapData } from "@/lib/api/client"
import { isValidWhatsappNumber, normalizeWhatsappNumber } from "@/lib/phone"

export function extractMuaProfile(payload: unknown): MuaProfile | null {
  const data = unwrapData<Record<string, unknown>>(
    payload as Record<string, unknown>,
  )
  const nestedUser = data.user as Record<string, unknown> | undefined
  const candidate =
    data.profile ??
    data.muaProfile ??
    nestedUser?.profile ??
    nestedUser?.muaProfile ??
    data

  if (!candidate || typeof candidate !== "object") return null

  const profile = candidate as Partial<MuaProfile>
  if (
    typeof profile.brandName !== "string" &&
    !Array.isArray(profile.serviceArea) &&
    typeof profile.slug !== "string"
  ) {
    return null
  }

  return profile as MuaProfile
}

export function isProfileComplete(
  profile: MuaProfile | null | undefined,
): profile is MuaProfile {
  if (!profile) return false

  return Boolean(
    profile.brandName?.trim() &&
      profile.username?.trim() &&
      profile.serviceArea?.length > 0 &&
      Boolean(profile.paymentMethod?.length) &&
      profile.whatsappNumber?.trim() &&
      isValidWhatsappNumber(profile.whatsappNumber) &&
      normalizeWhatsappNumber(profile.whatsappNumber) === profile.whatsappNumber,
  )
}
