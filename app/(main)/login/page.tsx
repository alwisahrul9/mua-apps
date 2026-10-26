"use client";

import {
  Suspense,
  useActionState,
  useEffect,
  useState,
  useTransition,
} from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import { login, loginWithGoogle, type LoginFields } from "./actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { resendVerificationEmail } from "@/app/actions/email-verification";
import PasswordInput from "@/components/PasswordInput";

const verificationDeadlineKey = "registration-email-verification-resend-at";

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.97-.9 6.63-2.36l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.39 13.93A6.02 6.02 0 0 1 6.07 12c0-.67.12-1.32.32-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.64.39 3.19 1.04 4.55l3.35-2.62Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.94c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z"
      />
    </svg>
  );
}

function GoogleLoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="outline"
      disabled={pending}
      className="h-auto w-full rounded-full border-foreground/20 bg-transparent py-3.5 text-foreground hover:bg-muted disabled:opacity-60"
    >
      {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
      {pending ? "Menghubungkan ke Google..." : "Lanjutkan dengan Google"}
    </Button>
  );
}

function RegistrationSuccessNotice({ resendAt }: { resendAt: string | null }) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    null,
  );
  const [resending, startResending] = useTransition();

  useEffect(() => {
    const urlDeadline = resendAt ? Date.parse(resendAt) : 0;
    const storedDeadline = Number(
      window.localStorage.getItem(verificationDeadlineKey),
    );
    const nextDeadline = Math.max(
      Number.isFinite(urlDeadline) ? urlDeadline : 0,
      Number.isFinite(storedDeadline) ? storedDeadline : 0,
    );

    if (nextDeadline <= Date.now()) {
      window.localStorage.removeItem(verificationDeadlineKey);
      queueMicrotask(() => setRemaining(0));
      return;
    }

    window.localStorage.setItem(verificationDeadlineKey, String(nextDeadline));
    queueMicrotask(() => setDeadline(nextDeadline));
  }, [resendAt]);

  useEffect(() => {
    if (!deadline) return;

    const updateCountdown = () => {
      const nextRemaining = Math.max(
        0,
        Math.ceil((deadline - Date.now()) / 1000),
      );
      setRemaining(nextRemaining);
      if (nextRemaining === 0) {
        window.localStorage.removeItem(verificationDeadlineKey);
        setDeadline(null);
      }
    };

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [deadline]);

  function handleResend() {
    if (resending || remaining !== 0) return;

    setMessage("");
    setMessageType(null);
    startResending(async () => {
      const result = await resendVerificationEmail();
      const availableAt = result.resendAvailableAt
        ? Date.parse(result.resendAvailableAt)
        : 0;
      const retryDeadline =
        result.retryAfter > 0 ? Date.now() + result.retryAfter * 1000 : 0;
      const nextDeadline = Math.max(
        Number.isFinite(availableAt) ? availableAt : 0,
        retryDeadline,
      );

      if (nextDeadline > Date.now()) {
        window.localStorage.setItem(
          verificationDeadlineKey,
          String(nextDeadline),
        );
        setDeadline(nextDeadline);
        setRemaining(Math.ceil((nextDeadline - Date.now()) / 1000));
      }

      setMessage(result.message);
      setMessageType(result.success ? "success" : "error");
    });
  }

  return (
    <div
      role="status"
      className="mb-6 rounded-xl border border-green-700/30 bg-green-50 p-4 text-sm text-green-800"
    >
      Periksa email Anda untuk melakukan verifikasi. Jika email tidak ada di
      inbox, periksa folder Spam.{" "}
      {remaining === null
        ? "Menghitung waktu kirim ulang..."
        : remaining > 0
          ? `Kirim ulang email verifikasi dalam ${remaining} detik.`
          : null}
      {remaining === 0 && (
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="font-semibold underline underline-offset-4 transition-opacity hover:opacity-80 disabled:cursor-wait disabled:opacity-60"
        >
          {resending ? "Mengirim ulang..." : "Kirim ulang email verifikasi"}
        </button>
      )}
      {message && (
        <p
          className={`mt-2 ${
            messageType === "error" ? "text-red-700" : "text-green-700"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const [values, setValues] = useState<LoginFields>({
    email: "",
    password: "",
  });
  const searchParams = useSearchParams();
  const registrationSucceeded = searchParams.get("registered") === "1";
  const verificationResendAt = searchParams.get("resend_at");
  const passwordResetSucceeded = searchParams.get("password_reset") === "1";
  const oauthError = searchParams.get("error");
  const oauthErrorMessage = (() => {
    switch (oauthError) {
      case "OAuthAccountNotLinked":
        return "Email ini sudah terdaftar dengan metode login lain. Masuk menggunakan email dan password.";
      case "GoogleTokenMissing":
        return "Google tidak mengirimkan token login. Coba pilih akun Google kembali.";
      case "GoogleBackendUnavailable":
        return "Server autentikasi belum dapat dihubungi. Coba kembali beberapa saat lagi.";
      case "GoogleBackendRejected":
        return "Token Google ditolak oleh backend. Pastikan Google Client ID pada frontend dan backend menggunakan nilai yang sama.";
      case null:
        return null;
      default:
        return "Login Google gagal diproses. Pastikan URL callback Google sesuai dengan domain yang sedang digunakan.";
    }
  })();

  function updateField(name: keyof LoginFields, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  return (
    <div className="public-light flex min-h-dvh w-full items-center justify-center bg-background px-4 pb-12 pt-24 text-foreground">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl mb-4">MUA Dashboard</h1>
          <p className="text-muted-foreground">
            Silakan login untuk mengelola booking.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-foreground/10 bg-card p-8 shadow-sm"
        >
          {registrationSucceeded && (
            <RegistrationSuccessNotice resendAt={verificationResendAt} />
          )}

          {passwordResetSucceeded && (
            <div className="mb-6 rounded-xl border border-green-700/30 bg-green-50 p-4 text-sm text-green-800">
              Password berhasil diperbarui. Silakan login dengan password baru.
            </div>
          )}

          {state?.error && (
            <div className="mb-6 rounded-xl border border-red-700/30 bg-red-50 p-4 text-sm text-red-800">
              {state.error}
            </div>
          )}

          {oauthErrorMessage && (
            <div className="mb-6 rounded-xl border border-red-700/30 bg-red-50 p-4 text-sm text-red-800">
              {oauthErrorMessage}
            </div>
          )}

          <form action={action} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  required
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  disabled={pending}
                  aria-invalid={Boolean(state?.errors?.email)}
                  aria-describedby={
                    state?.errors?.email ? "email-error" : undefined
                  }
                  suppressHydrationWarning
                  className="w-full pl-10 pr-4 py-3 h-auto rounded-xl border-foreground/20 bg-transparent focus-visible:ring-primary/50 transition-all"
                  placeholder="admin@example.com"
                />
              </div>
              {state?.errors?.email && (
                <p id="email-error" className="text-xs text-red-700">
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary transition-opacity hover:opacity-80"
                >
                  Lupa password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                required
                name="password"
                autoComplete="current-password"
                value={values.password}
                onChange={(event) =>
                  updateField("password", event.target.value)
                }
                disabled={pending}
                aria-invalid={Boolean(state?.errors?.password)}
                aria-describedby={
                  state?.errors?.password ? "password-error" : undefined
                }
                suppressHydrationWarning
                className="h-auto w-full rounded-xl border-foreground/20 bg-transparent py-3 focus-visible:ring-primary/50"
                placeholder="••••••••"
              />
              {state?.errors?.password && (
                <p id="password-error" className="text-xs text-red-700">
                  {state.errors.password[0]}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={pending}
              className="w-full h-auto py-4 bg-primary text-primary-foreground hover:bg-primary rounded-full font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {pending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Login ke Dashboard
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-foreground/10" />
            atau
            <span className="h-px flex-1 bg-foreground/10" />
          </div>

          <form action={loginWithGoogle}>
            <GoogleLoginButton />
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Belum memiliki akun?{" "}
            <Link href="/register" className="font-medium text-primary">
              Daftar sekarang
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
