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
    async jwt({ token, user, account }) {
      if (user) {
        token.accessToken = user.accessToken
        token.roles = user.roles
        token.permissions = user.permissions
        token.isEmailVerified = user.isEmailVerified
        token.profile = user.profile
      }

      if (account?.provider === "google" && account.id_token) {
        const response = await publicApi.post("/auth/google", { id_token: account.id_token })
        const payload = unwrapData<AuthResponse & { accessToken?: string }>(response.data)
        token.accessToken = payload.token ?? payload.accessToken
        token.sub = payload.user.id
        token.name = payload.user.name
        token.email = payload.user.email
        token.picture = payload.user.profile?.profileImageUrl ?? token.picture
        token.roles = payload.user.roles ?? []
        token.permissions = payload.user.permissions ?? []
        token.isEmailVerified = Boolean(payload.user.emailVerifiedAt)
        token.profile = payload.user.profile ?? null
      }

      return token
    },
    session({ session, token }) {
      session.accessToken = typeof token.accessToken === "string" ? token.accessToken : undefined
      session.user.id = token.sub ?? ""
      session.user.roles = Array.isArray(token.roles) ? token.roles.filter((role): role is string => typeof role === "string") : []
      session.user.permissions = Array.isArray(token.permissions) ? token.permissions.filter((permission): permission is string => typeof permission === "string") : []
      session.user.isEmailVerified = Boolean(token.isEmailVerified)
      session.user.profile = token.profile && typeof token.profile === "object" ? token.profile as import("@/lib/api/types").MuaProfile : null
      return session
    },
  },
})
