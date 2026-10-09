"use server";

import axios, { AxiosError } from "axios";
import { redirect } from "next/navigation";
import { z } from "zod";
import { publicApi } from "@/lib/api/client";
import { toTitleCase } from "@/lib/text";

export type RegisterFields = {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

export type RegisterState = {
  error?: string;
  success?: string;
  errors?: Partial<Record<keyof RegisterFields, string[]>>;
};

type LaravelValidationResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

const backendFieldNames: Record<string, keyof RegisterFields> = {
  name: "name",
  email: "email",
  password: "password",
  password_confirmation: "passwordConfirmation",
  passwordConfirmation: "passwordConfirmation",
};

const schema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
    password: z
      .string()
      .min(
        8,
        "Password minimal 8 karakter, terdiri dari huruf besar, huruf kecil, angka, dan simbol",
      )
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password harus mengandung huruf besar, huruf kecil, angka, dan simbol",
      ),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "Konfirmasi password tidak sama",
  });

export async function register(
  _previousState: RegisterState | undefined,
  formData: FormData,
): Promise<RegisterState> {
  const fields: RegisterFields = {
    name: toTitleCase(String(formData.get("name") ?? "")),
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    passwordConfirmation: String(formData.get("passwordConfirmation") ?? ""),
  };
  const parsed = schema.safeParse(fields);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  try {
    await publicApi.post("/auth/register", {
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
      password_confirmation: parsed.data.passwordConfirmation,
    });
  } catch (error) {
    console.error("Register error:", error);
    if (!axios.isAxiosError(error)) {
      return {
        error: error instanceof Error ? error.message : "Pendaftaran gagal.",
      };
    }

    const response = (error as AxiosError<LaravelValidationResponse>).response;
    const errors: RegisterState["errors"] = {};

    for (const [backendField, messages] of Object.entries(
      response?.data?.errors ?? {},
    )) {
      const field = backendFieldNames[backendField];
      if (field && Array.isArray(messages)) errors[field] = messages;
    }

    const hasFieldErrors = Object.keys(errors).length > 0;
    return {
      error:
        response?.data?.message ??
        (hasFieldErrors
          ? "Periksa kembali data pendaftaran Anda."
          : "Pendaftaran gagal. Silakan coba lagi."),
      ...(hasFieldErrors ? { errors } : {}),
    };
  }

  redirect("/login?registered=1");
}
