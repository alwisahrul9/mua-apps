import axios, { AxiosError, AxiosInstance } from "axios"
import type { Paginated } from "@/lib/api/types"

export const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "")

export const publicApi = axios.create({
  baseURL: apiBaseUrl,
  headers: { Accept: "application/json" },
  timeout: 15_000,
})

export function createApiClient(token?: string): AxiosInstance {
  return axios.create({
    baseURL: apiBaseUrl,
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    timeout: 20_000,
  })
}

export function apiErrorMessage(error: unknown, fallback = "Terjadi kesalahan saat menghubungi server.") {
  if (!axios.isAxiosError(error)) return error instanceof Error ? error.message : fallback

  const response = (error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>).response
  if (response?.data?.errors) return Object.values(response.data.errors).flat()[0] ?? fallback
  return response?.data?.message ?? fallback
}

export function unwrapData<T>(payload: T | { data: T }): T {
  const camelize = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(camelize)
    if (!value || typeof value !== "object" || value instanceof Date) return value

    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase()),
        camelize(item),
      ]),
    )
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    return camelize((payload as { data: T }).data) as T
  }
  return camelize(payload) as T
}

export function unwrapList<T>(payload: unknown): Paginated<T> {
  if (Array.isArray(payload)) {
    return { data: payload.map((item) => unwrapData<T>(item as T)) }
  }

  const outer = (payload ?? {}) as Record<string, unknown>
  const nested =
    outer.data && typeof outer.data === "object" && !Array.isArray(outer.data)
      ? (outer.data as Record<string, unknown>)
      : outer
  const rawData = Array.isArray(outer.data)
    ? outer.data
    : Array.isArray(nested.data)
      ? nested.data
      : []
  const meta =
    nested.meta && typeof nested.meta === "object"
      ? (nested.meta as Record<string, unknown>)
      : outer.meta && typeof outer.meta === "object"
        ? (outer.meta as Record<string, unknown>)
        : {}
  const data = rawData.map((item) => unwrapData<T>(item as T))

  return {
    data,
    currentPage: Number(meta.current_page ?? nested.current_page ?? 1),
    lastPage: Number(meta.last_page ?? nested.last_page ?? 1),
    perPage: Number(meta.per_page ?? nested.per_page ?? data.length),
    total: Number(meta.total ?? nested.total ?? data.length),
  }
}
