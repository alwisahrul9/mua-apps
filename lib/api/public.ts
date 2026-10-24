import { cache } from "react";
import { unstable_cache } from "next/cache";
import { publicApi, unwrapData, unwrapList } from "@/lib/api/client";
import type {
  Article,
  AddOn,
  Booking,
  BookingAddOn,
  MuaProfile,
  Portfolio,
  Review,
  ReviewCheck,
  SeoDirectory,
  SeoDirectoryOption,
  SeoSitemapEntry,
  Service,
} from "@/lib/api/types";
import {
  profileCacheSeconds,
  publicMuaListCacheTag,
  publicProfileCacheTag,
} from "@/lib/profile-cache";
import {
  contentCacheSeconds,
  publicPortfoliosCacheTag,
  publicServicesCacheTag,
} from "@/lib/content-cache";
import {
  publicArticleCacheTag,
  publicArticlesCacheTag,
  publicReviewsCacheTag,
  seoSitemapCacheTag,
} from "@/lib/seo-cache";

function numericValue(...values: unknown[]) {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }
  return 0;
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function normalizeBookingAddOns(booking: Record<string, unknown>) {
  const priceBreakdown = objectValue(booking.priceBreakdown);
  const candidates =
    booking.addOns ??
    booking.addons ??
    booking.bookingAddOns ??
    booking.bookingAddons ??
    priceBreakdown.addOns ??
    priceBreakdown.addons;

  if (!Array.isArray(candidates)) return [];

  return candidates.flatMap<BookingAddOn>((candidate, index) => {
    const item = objectValue(candidate);
    const addOn = objectValue(item.addOn ?? item.addon);
    const pivot = objectValue(item.pivot);
    const source = Object.keys(addOn).length > 0 ? addOn : item;
    const id = String(
      source.id ?? item.addonId ?? item.addOnId ?? `addon-${index}`,
    );
    const name = String(source.name ?? item.name ?? "Add-on");
    const quantity = Math.max(
      1,
      numericValue(item.quantity, pivot.quantity, 1),
    );
    const unitPrice = numericValue(
      item.unitPrice,
      pivot.unitPrice,
      pivot.price,
      source.price,
      item.price,
    );
    const subtotal = numericValue(
      item.subtotal,
      item.totalPrice,
      item.total,
      pivot.subtotal,
      unitPrice * quantity,
    );
    const billingType = source.billingType ?? item.billingType;
    const unit = source.unit ?? item.unit;

    return [
      {
        id,
        name,
        quantity,
        unitPrice,
        subtotal,
        ...(billingType === "flat" || billingType === "per_unit"
          ? { billingType }
          : {}),
        ...(unit === "item" ||
        unit === "hourly" ||
        unit === "person" ||
        unit === null
          ? { unit }
          : {}),
      },
    ];
  });
}

function normalizeBooking(
  booking: Record<string, unknown>,
  customCode: string,
) {
  const priceBreakdown = objectValue(booking.priceBreakdown);
  const serviceBreakdown = objectValue(priceBreakdown.service);
  const service = objectValue(booking.service);
  const totalPerson = Math.max(1, numericValue(booking.totalPerson, 1));
  const servicePrice = numericValue(
    booking.servicePrice,
    serviceBreakdown.unitPrice,
    serviceBreakdown.price,
    service.price,
  );
  const serviceSubtotal = numericValue(
    booking.serviceSubtotal,
    serviceBreakdown.subtotal,
    servicePrice * totalPerson,
  );

  return {
    ...booking,
    customCode: customCode.trim(),
    totalPrice: numericValue(booking.totalPrice),
    dpAmount: numericValue(booking.dpAmount),
    servicePrice,
    serviceSubtotal,
    addOns: normalizeBookingAddOns(booking),
  } as Booking;
}

function unwrapBooking(payload: unknown): Booking {
  let current = payload;

  for (let depth = 0; depth < 4; depth += 1) {
    const unwrapped = unwrapData<unknown>(current);
    if (!unwrapped || typeof unwrapped !== "object") break;
    const normalized = unwrapped as Record<string, unknown>;
    const customCode =
      normalized.customCode ?? normalized.bookingCode ?? normalized.code;

    if (typeof customCode === "string" && customCode.trim()) {
      return normalizeBooking(normalized, customCode);
    }

    const nested = normalized.booking ?? normalized.data;
    if (!nested || typeof nested !== "object" || nested === current) break;
    current = nested;
  }

  throw new Error("Kode booking tidak ditemukan pada respons server.");
}

export const getPublicMua = cache(async (slug: string) => {
  const normalizedSlug = slug.trim().toLowerCase();

  return unstable_cache(
    async () => {
      const response = await publicApi.get(
        `/mua/${encodeURIComponent(normalizedSlug)}`,
      );
      return unwrapData<MuaProfile>(response.data);
    },
    ["public-mua-profile", normalizedSlug],
    {
      revalidate: profileCacheSeconds,
      tags: [publicProfileCacheTag(normalizedSlug)],
    },
  )();
});

export const listPublicMuas = cache(
  async (filters?: { city?: string; category?: string }) => {
    const city = filters?.city?.trim().toLowerCase() ?? "";
    const category = filters?.category?.trim().toLowerCase() ?? "";
    return unstable_cache(
      async () => {
        const profiles: MuaProfile[] = [];
        let page = 1;
        let lastPage = 1;

        do {
          const response = await publicApi.get("/mua", {
            params: {
              page,
              per_page: 100,
              city: city || undefined,
              category: category || undefined,
            },
          });
          const result = unwrapList<MuaProfile>(response.data);
          profiles.push(...result.data);
          lastPage = Math.max(1, result.lastPage ?? 1);
          page += 1;
        } while (page <= lastPage);

        return profiles;
      },
      ["public-mua-list", city, category],
      {
        revalidate: profileCacheSeconds,
        tags: [publicMuaListCacheTag],
      },
    )();
  },
);

export const getPublicServices = cache(async (slug: string) => {
  const normalizedSlug = slug.trim().toLowerCase();
  return unstable_cache(
    async () => {
      const response = await publicApi.get(
        `/mua/${encodeURIComponent(normalizedSlug)}/services`,
      );
      return unwrapList<Service & { addons?: AddOn[] }>(response.data).data.map(
        (service) => ({
          ...service,
          addOns: service.addOns ?? service.addons ?? [],
        }),
      );
    },
    ["public-mua-services", normalizedSlug],
    {
      revalidate: contentCacheSeconds,
      tags: [publicServicesCacheTag(normalizedSlug)],
    },
  )();
});

export const getPublicPortfolios = cache(async (slug: string) => {
  const normalizedSlug = slug.trim().toLowerCase();
  return unstable_cache(
    async () => {
      const response = await publicApi.get(
        `/mua/${encodeURIComponent(normalizedSlug)}/portfolios`,
      );
      return unwrapList<Portfolio>(response.data).data;
    },
    ["public-mua-portfolios", normalizedSlug],
    {
      revalidate: contentCacheSeconds,
      tags: [publicPortfoliosCacheTag(normalizedSlug)],
    },
  )();
});

function directoryOptions(value: unknown): SeoDirectoryOption[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (typeof item === "string") {
      const name = item.trim();
      return name
        ? [
            {
              name,
              slug: name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, ""),
            },
          ]
        : [];
    }
    if (!item || typeof item !== "object") return [];
    const normalized = unwrapData<Record<string, unknown>>(
      item as Record<string, unknown>,
    );
    const name = String(
      normalized.name ??
        normalized.label ??
        normalized.city ??
        normalized.category ??
        "",
    ).trim();
    const slug = String(
      normalized.slug ??
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
    ).trim();
    return name && slug
      ? [
          {
            name,
            slug,
            count:
              normalized.count == null ? undefined : Number(normalized.count),
          },
        ]
      : [];
  });
}

export const getSeoDirectory = cache(
  async (): Promise<SeoDirectory> =>
    unstable_cache(
      async () => {
        const response = await publicApi.get("/seo/directory");
        const data = unwrapData<Record<string, unknown>>(response.data);
        return {
          cities: directoryOptions(data.cities ?? data.serviceAreas),
          categories: directoryOptions(data.categories ?? data.services),
        };
      },
      ["seo-directory"],
      { revalidate: profileCacheSeconds, tags: [publicMuaListCacheTag] },
    )(),
);

function extractSitemapEntries(payload: unknown): SeoSitemapEntry[] {
  const normalized = unwrapData<unknown>(payload as never);
  const record =
    normalized && typeof normalized === "object" && !Array.isArray(normalized)
      ? (normalized as Record<string, unknown>)
      : null;
  const items = Array.isArray(normalized)
    ? normalized
    : ([
        record?.items,
        record?.urls,
        record?.profiles,
        record?.articles,
        record?.data,
      ].find(Array.isArray) ?? []);
  return (items as unknown[]).flatMap((item) => {
    if (typeof item === "string") return [{ url: item }];
    if (!item || typeof item !== "object") return [];
    const value = unwrapData<Record<string, unknown>>(
      item as Record<string, unknown>,
    );
    const url = String(value.url ?? value.loc ?? "").trim();
    if (!url) return [];
    const rawImages = value.images ?? value.imageUrls;
    return [
      {
        url,
        lastModified:
          typeof (value.lastModified ?? value.updatedAt) === "string"
            ? String(value.lastModified ?? value.updatedAt)
            : undefined,
        images: Array.isArray(rawImages)
          ? rawImages.filter(
              (image): image is string => typeof image === "string",
            )
          : undefined,
      },
    ];
  });
}

export const getSeoSitemap = cache(async (type: "profiles" | "articles") =>
  unstable_cache(
    async () => {
      const response = await publicApi.get("/seo/sitemap", {
        params: { type },
      });
      return extractSitemapEntries(response.data);
    },
    ["seo-sitemap", type],
    { revalidate: 3600, tags: [seoSitemapCacheTag(type)] },
  )(),
);

export const getPublicReviews = cache(async (username: string) =>
  unstable_cache(
    async () => {
      const response = await publicApi.get(
        `/mua/${encodeURIComponent(username)}/reviews`,
      );
      return unwrapList<Review>(response.data).data;
    },
    ["public-mua-reviews", username.toLowerCase()],
    { revalidate: 300, tags: [publicReviewsCacheTag(username)] },
  )(),
);

export async function checkReviewToken(token: string) {
  const response = await publicApi.get("/reviews/check", { params: { token } });
  const data = unwrapData<ReviewCheck>(response.data);
  return { ...data, valid: data.valid !== false };
}

export async function submitReview(data: {
  token: string;
  rating: number;
  reviewText: string;
  consent: boolean;
}) {
  const response = await publicApi.post("/reviews", {
    token: data.token,
    rating: data.rating,
    review_text: data.reviewText,
    consent: data.consent,
  });
  return unwrapData<Review>(response.data);
}

export const listPublicArticles = cache(async (page = 1) =>
  unstable_cache(
    async () => {
      const response = await publicApi.get("/articles", { params: { page } });
      return unwrapList<Article>(response.data);
    },
    ["public-articles", String(page)],
    { revalidate: 3600, tags: [publicArticlesCacheTag] },
  )(),
);

export const getPublicArticle = cache(async (slug: string) =>
  unstable_cache(
    async () => {
      const response = await publicApi.get(
        `/articles/${encodeURIComponent(slug)}`,
      );
      return unwrapData<Article>(response.data);
    },
    ["public-article", slug.toLowerCase()],
    { revalidate: 3600, tags: [publicArticleCacheTag(slug)] },
  )(),
);

export async function createPublicBooking(data: Record<string, unknown>) {
  const response = await publicApi.post("/bookings", data, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  return unwrapBooking(response.data);
}

export async function getPublicBooking(username: string, code: string) {
  const response = await publicApi.get("/bookings/check", {
    params: {
      username,
      custom_code: code,
    },
  });
  return unwrapBooking(response.data);
}
