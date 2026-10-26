import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reset Password",
  robots: { index: false, follow: false },
}

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="public-light min-h-dvh w-full bg-background text-foreground">
      {children}
    </div>
  )
}
