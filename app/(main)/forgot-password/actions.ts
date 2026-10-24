"use server";

import axios from "axios";
import { redirect } from "next/navigation";
import { z } from "zod";
import { publicApi } from "@/lib/api/client";

export type ForgotPasswordState = {
  success?: string;
  error?: string;
  errors?: { email?: string[] };
};

export type ResetPasswordState = {
  error?: string;
  errors?: Partial<
    Record<"email" | "password" | "passwordConfirmation" | "token", string[]>
  >;
};

type BackendResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
});

const resetSchema = z
  .object({
    token: z.string().min(1, "Token reset password tidak tersedia"),
    email: z
      .string()
      .trim()
      .min(1, "Email wajib diisi")
      .email("Format email tidak valid"),
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
    passwordConfirmation: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "Konfirmasi password tidak sama",
  });

function backendMessage(data: BackendResponse | undefined, fallback: string) {
  return data?.message ?? fallback;
}

export async function forgotPassword(
  _previousState: ForgotPasswordState | undefined,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const parsed = emailSchema.safeParse({
    email: String(formData.get("email") ?? ""),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    const response = await publicApi.post("/auth/forgot-password", parsed.data);
    return {
      success:
        backendMessage(response.data, "Tautan reset password telah dikirim.") +
        " Jika tidak ada di inbox, periksa folder Spam.",
    };
  } catch (error) {
    const response = axios.isAxiosError<BackendResponse>(error)
      ? error.response
      : undefined;
    console.log(response);
    return {
      error: backendMessage(
        response?.data,
        "Permintaan reset password gagal. Silakan coba kembali.",
      ),
      errors: response?.data?.errors?.email
        ? { email: response.data.errors.email }
        : undefined,
    };
  }
}

export async function resetPassword(
  _previousState: ResetPasswordState | undefined,
  formData: FormData,
): Promise<ResetPasswordState> {
  const parsed = resetSchema.safeParse({
    token: String(formData.get("token") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    passwordConfirmation: String(formData.get("passwordConfirmation") ?? ""),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await publicApi.post("/auth/reset-password", {
      token: parsed.data.token,
      email: parsed.data.email,
      password: parsed.data.password,
      password_confirmation: parsed.data.passwordConfirmation,
    });
  } catch (error) {
    const response = axios.isAxiosError<BackendResponse>(error)
      ? error.response
      : undefined;
    const backendErrors = response?.data?.errors ?? {};

    return {
      error: backendMessage(
        response?.data,
        "Password gagal diubah. Tautan mungkin sudah kedaluwarsa.",
      ),
      errors: {
        email: backendErrors.email,
        password: backendErrors.password,
        passwordConfirmation:
          backendErrors.password_confirmation ??
          backendErrors.passwordConfirmation,
        token: backendErrors.token,
      },
    };
  }

  redirect("/login?password_reset=1");
}
