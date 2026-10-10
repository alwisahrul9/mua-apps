import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { apiBaseUrl } from "@/lib/api/client"
import { extractMuaProfile, isProfileComplete } from "@/lib/profile"

const authRoutes = new Set(["/login", "/register"])

export const proxy = auth(async (request) => {
  const { pathname } = request.nextUrl
  const session = request.auth
  const isAuthRoute = authRoutes.has(pathname)
  const isDashboardRoute = pathname.startsWith("/dashboard")
  const isOnboardingRoute = pathname.startsWith("/onboarding")

  if (!session?.user || !session.accessToken) {
    if (isDashboardRoute || isOnboardingRoute) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    return NextResponse.next()
  }

  const response = await fetch(`${apiBaseUrl}/user/profile`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  }).catch(() => null)

  const profile = response?.ok
    ? extractMuaProfile(await response.json().catch(() => null))
    : session.user.profile
  const profileComplete = isProfileComplete(profile)

  if (isAuthRoute) {
    return NextResponse.redirect(
      new URL(profileComplete ? "/dashboard" : "/onboarding", request.url),
    )
  }

  if (isOnboardingRoute && profileComplete) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (isDashboardRoute && !profileComplete) {
    return NextResponse.redirect(new URL("/onboarding", request.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/login",
    "/register",
    "/dashboard/:path*",
    "/onboarding/:path*",
  ],
}
