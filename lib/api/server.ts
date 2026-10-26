import "server-only";

import axios from "axios";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createApiClient } from "@/lib/api/client";

export async function serverApi() {
  const session = await auth();
  if (!session?.user || !session.accessToken) {
    redirect("/auth/invalid-session");
  }

  const client = createApiClient(session.accessToken);
  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        redirect("/auth/invalid-session");
      }
      return Promise.reject(error);
    },
  );

  return client;
}
