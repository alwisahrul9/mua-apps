import ResetPasswordForm from "./ResetPasswordForm"

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<{ email?: string | string[] }>
}) {
  const [{ token }, query] = await Promise.all([params, searchParams])
  const email = typeof query.email === "string" ? query.email : ""

  return <ResetPasswordForm token={token} initialEmail={email} />
}
