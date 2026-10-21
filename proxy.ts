import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { apiBaseUrl } from "@/lib/api/client";
import { extractMuaProfile, isProfileComplete } from "@/lib/profile";

const authRoutes = new Set(["/login", "/register", "/forgot-password"]);

export const proxy = auth(async (request) => {
  const { pathname } = request.nextUrl;
  const session = request.auth;
  const isAuthRoute =
    authRoutes.has(pathname) ||
    pathname === "/reset-password" ||
    pathname.startsWith("/reset-password/");
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isOnboardingRoute = pathname.startsWith("/onboarding");

  if (!session?.user || !session.accessToken) {
    if (isDashboardRoute || isOnboardingRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  }

  // DashboardLayout mengambil profil terbaru untuk navbar sekaligus memblokir
  // profil yang belum lengkap. Hindari request backend kedua di Proxy pada
  // setiap navigasi dashboard.
  if (isDashboardRoute) return NextResponse.next();

  const response = await fetch(`${apiBaseUrl}/user/profile`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  }).catch(() => null);

  const profileResponseSucceeded = response?.ok === true;
  const profile = profileResponseSucceeded
    ? extractMuaProfile(await response.json().catch(() => null))
    : session.user.profile;
  const profileComplete = isProfileComplete(profile);

  if (isAuthRoute) {
    return NextResponse.redirect(
      new URL(
        profileResponseSucceeded && !profileComplete
          ? "/onboarding"
          : "/dashboard",
        request.url,
      ),
    );
  }

  if (isOnboardingRoute && profileComplete) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password/:path*",
    "/dashboard/:path*",
    "/onboarding/:path*",
  ],
};
