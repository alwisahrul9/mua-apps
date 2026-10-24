import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import axios from "axios"
import { z } from "zod"
import { publicApi, unwrapData } from "@/lib/api/client"
import type { AuthResponse } from "@/lib/api/types"

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

type GoogleLoginError =
  | "GoogleTokenMissing"
  | "GoogleBackendRejected"
  | "GoogleBackendUnavailable"

function googleLoginErrorUrl(error: GoogleLoginError) {
  return `/login?error=${error}`
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  providers: [
    Credentials({
      name: "Email dan password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        let payload: AuthResponse & { accessToken?: string }

        try {
          const response = await publicApi.post("/auth/login", parsed.data)
          payload = unwrapData<AuthResponse & { accessToken?: string }>(response.data)
        } catch (error) {
          if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 422)
          ) {
            return null
          }
          throw error
        }

        const accessToken = payload.token ?? payload.accessToken
        if (!payload.user || !accessToken) return null

        return {
          id: payload.user.id,
          name: payload.user.name,
          email: payload.user.email,
          image: payload.user.profile?.profileImageUrl ?? null,
          accessToken,
          roles: payload.user.roles ?? [],
          permissions: payload.user.permissions ?? [],
          isEmailVerified: Boolean(payload.user.emailVerifiedAt),
          verificationEmailResendAvailableAt:
            payload.user.verificationEmailResendAvailableAt ?? null,
          verificationEmailRetryAfter:
            payload.user.verificationEmailRetryAfter ?? 0,
          profile: payload.user.profile ?? null,
        }
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      const requiresAuth =
        request.nextUrl.pathname.startsWith("/dashboard") ||
        request.nextUrl.pathname.startsWith("/onboarding")
      if (!requiresAuth) return true
      return Boolean(auth?.user && auth.accessToken)
    },
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true

      if (!account.id_token) {
        console.error("[auth][google] Google tidak mengembalikan ID token.")
        return googleLoginErrorUrl("GoogleTokenMissing")
      }

      try {
        const response = await publicApi.post("/auth/google", {
          id_token: account.id_token,
        })
        const payload = unwrapData<AuthResponse & { accessToken?: string }>(
          response.data,
        )
        const accessToken = payload.token ?? payload.accessToken

        if (!payload.user || !accessToken) {
          console.error(
            "[auth][google] Respons backend tidak memuat user atau access token.",
          )
          return googleLoginErrorUrl("GoogleBackendRejected")
        }

        Object.assign(user, {
          id: payload.user.id,
          name: payload.user.name,
          email: payload.user.email,
          image: payload.user.profile?.profileImageUrl ?? user.image,
          accessToken,
          roles: payload.user.roles ?? [],
          permissions: payload.user.permissions ?? [],
          isEmailVerified: Boolean(payload.user.emailVerifiedAt),
          verificationEmailResendAvailableAt:
            payload.user.verificationEmailResendAvailableAt ?? null,
          verificationEmailRetryAfter:
            payload.user.verificationEmailRetryAfter ?? 0,
          profile: payload.user.profile ?? null,
        })

        return true
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("[auth][google] Backend menolak login Google.", {
            apiUrl: `${publicApi.defaults.baseURL}/auth/google`,
            status: error.response?.status ?? null,
            message: error.response?.data?.message ?? error.message,
          })

          return googleLoginErrorUrl(
            error.response
              ? "GoogleBackendRejected"
              : "GoogleBackendUnavailable",
          )
        }

        console.error("[auth][google] Login Google gagal.", error)
        return googleLoginErrorUrl("GoogleBackendRejected")
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token.accessToken = user.accessToken
        token.roles = user.roles
        token.permissions = user.permissions
        token.isEmailVerified = user.isEmailVerified
        token.verificationEmailResendAvailableAt =
          user.verificationEmailResendAvailableAt
        token.verificationEmailRetryAfter = user.verificationEmailRetryAfter
        token.profile = user.profile
      }

      return token
    },
    session({ session, token }) {
      session.accessToken = typeof token.accessToken === "string" ? token.accessToken : undefined
      session.user.id = token.sub ?? ""
      session.user.roles = Array.isArray(token.roles) ? token.roles.filter((role): role is string => typeof role === "string") : []
      session.user.permissions = Array.isArray(token.permissions) ? token.permissions.filter((permission): permission is string => typeof permission === "string") : []
      session.user.isEmailVerified = Boolean(token.isEmailVerified)
      session.user.verificationEmailResendAvailableAt =
        typeof token.verificationEmailResendAvailableAt === "string"
          ? token.verificationEmailResendAvailableAt
          : null
      session.user.verificationEmailRetryAfter =
        typeof token.verificationEmailRetryAfter === "number"
          ? token.verificationEmailRetryAfter
          : 0
      session.user.profile = token.profile && typeof token.profile === "object" ? token.profile as import("@/lib/api/types").MuaProfile : null
      return session
    },
  },
})
