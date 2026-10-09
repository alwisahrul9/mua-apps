import type { DefaultSession } from "next-auth"
import type { MuaProfile } from "@/lib/api/types"

declare module "next-auth" {
  interface User {
    accessToken: string
    roles: string[]
    permissions: string[]
    isEmailVerified: boolean
    profile: MuaProfile | null
  }

  interface Session {
    accessToken?: string
    user: DefaultSession["user"] & {
      id: string
      roles: string[]
      permissions: string[]
      isEmailVerified: boolean
      profile: MuaProfile | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    roles?: string[]
    permissions?: string[]
    isEmailVerified?: boolean
    profile?: MuaProfile | null
  }
}
