"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Lock, Mail, User } from "lucide-react";
import { register, type RegisterFields } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fields = [
  {
    name: "name",
    label: "Nama lengkap",
    type: "text",
    placeholder: "Nama lengkap Anda",
    autoComplete: "name",
    icon: User,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "nama@example.com",
    autoComplete: "email",
    icon: Mail,
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "••••••••",
    autoComplete: "new-password",
    icon: Lock,
  },
  {
    name: "passwordConfirmation",
    label: "Konfirmasi password",
    type: "password",
    placeholder: "••••••••",
    autoComplete: "new-password",
    icon: Lock,
  },
] as const;

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, undefined);
  const [values, setValues] = useState<RegisterFields>({
    name: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });

  function updateField(name: keyof RegisterFields, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  return (
    <div className="container-custom flex min-h-dvh items-center justify-center px-4 pb-12 pt-24">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="mb-4 font-serif text-4xl">Buat Akun MUA</h1>
          <p className="text-muted-foreground-dark">
            Daftar untuk mengelola layanan, portofolio, dan booking.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-foreground-dark/10 bg-background-dark p-8 shadow-sm"
        >
          {state?.error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
              {state.error}
            </div>
          )}

          <form action={action} className="space-y-6">
            {fields.map(({ name, label, type, placeholder, autoComplete, icon: Icon }) => {
              const fieldError = state?.errors?.[name as keyof typeof state.errors];

              return (
                <div key={name} className="space-y-2">
                  <Label htmlFor={name} className="text-sm font-medium">
                    {label}
                  </Label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground-dark" />
                    <Input
                      id={name}
                      name={name}
                      type={type}
                      placeholder={placeholder}
                      autoComplete={autoComplete}
                      value={values[name]}
                      onChange={(event) => updateField(name, event.target.value)}
                      required
                      disabled={pending}
                      aria-invalid={Boolean(fieldError)}
                      aria-describedby={fieldError ? `${name}-error` : undefined}
                      suppressHydrationWarning
                      className="h-auto w-full rounded-xl border-foreground-dark/20 bg-transparent py-3 pl-10 pr-4 transition-all focus-visible:ring-primary-dark/50"
                    />
                  </div>
                  {fieldError && (
                    <p id={`${name}-error`} className="text-xs text-red-500">
                      {fieldError[0]}
                    </p>
                  )}
                </div>
              );
            })}

            <Button
              type="submit"
              disabled={pending}
              className="flex h-auto w-full items-center justify-center gap-2 rounded-full bg-primary-dark py-4 font-medium text-primary-foreground-dark transition-opacity hover:bg-primary-dark hover:opacity-90 disabled:opacity-50"
            >
              {pending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Buat Akun
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground-dark">
            Sudah memiliki akun?{" "}
            <Link href="/login" className="font-medium text-primary-dark">
              Masuk
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
