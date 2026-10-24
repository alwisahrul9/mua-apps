"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Loader2, PackagePlus, Plus } from "lucide-react";
import type { AddOn } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAddOnsPage } from "../actions";

type LoadStatus = "idle" | "loading" | "loaded" | "error";

export default function ServicesTabsClient({
  serviceContent,
  initialTab = "services",
}: {
  serviceContent: ReactNode;
  initialTab?: "services" | "add-ons";
}) {
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [page, setPage] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const loadAddOns = useCallback(async (requestedPage: number) => {
    setStatus("loading");
    setError(null);

    const result = await getAddOnsPage(requestedPage);
    if (result.error) {
      setStatus("error");
      setError(result.error);
      return;
    }

    setAddOns((current) => {
      const existingIds = new Set(current.map((item) => item.id));
      return [
        ...current,
        ...result.data.filter((item) => !existingIds.has(item.id)),
      ];
    });
    setPage(result.currentPage);
    setLastPage(result.lastPage);
    setTotal(result.total);
    setStatus("loaded");
  }, []);

  useEffect(() => {
    if (initialTab !== "add-ons" || status !== "idle") return;

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void loadAddOns(1);
    });

    return () => {
      cancelled = true;
    };
  }, [initialTab, loadAddOns, status]);

  const handleTabChange = (value: string) => {
    if (value === "add-ons" && status === "idle") {
      void loadAddOns(1);
    }
  };

  const lastAddOnRef = useCallback(
    (node: HTMLDivElement | null) => {
      observer.current?.disconnect();
      if (
        !node ||
        status === "loading" ||
        status === "error" ||
        page >= lastPage
      )
        return;

      observer.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) void loadAddOns(page + 1);
        },
        { rootMargin: "200px 0px" },
      );
      observer.current.observe(node);
    },
    [lastPage, loadAddOns, page, status],
  );

  return (
    <Tabs
      defaultValue={initialTab}
      onValueChange={handleTabChange}
      className="w-full gap-5"
    >
      <div className="overflow-x-auto overflow-y-hidden border-b border-foreground/10 pb-2 dark:border-foreground-dark/10">
        <TabsList variant="line" className="h-11 min-w-max justify-start px-0">
          <TabsTrigger value="services" className="min-w-28 px-4">
            Daftar Layanan
          </TabsTrigger>
          <TabsTrigger value="add-ons" className="min-w-24 px-4">
            Add-on
            {status !== "idle" && status !== "loading" && (
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] tabular-nums dark:bg-muted-dark">
                {total}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="services" className="space-y-4">
        {serviceContent}
      </TabsContent>

      <TabsContent value="add-ons" className="space-y-4">
        {addOns.length > 0 && (
          <div className="flex justify-end">
            <Button
              render={<Link href="/dashboard/services/addons/create" />}
              nativeButton={false}
              className="h-10 shrink-0 rounded-xl px-4 text-xs shadow-sm sm:h-11 sm:px-6 sm:text-sm"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Tambah Add-on
            </Button>
          </div>
        )}
        {status === "loading" && addOns.length === 0 ? (
          <AddOnSkeleton />
        ) : status === "error" && addOns.length === 0 ? (
          <LoadError message={error} onRetry={() => void loadAddOns(1)} />
        ) : addOns.length === 0 ? (
          <Card className="rounded-2xl border-foreground/10 shadow-sm dark:border-foreground-dark/10">
            <CardContent className="flex flex-col items-center justify-center gap-3 p-8 text-center sm:p-12">
              <PackagePlus className="h-9 w-9 text-muted-foreground/70 dark:text-muted-foreground-dark/70" />
              <div>
                <p className="font-medium">Belum ada add-on.</p>
              </div>
              <Button
                render={<Link href="/dashboard/services/addons/create" />}
                nativeButton={false}
                className="h-10 rounded-xl px-4 text-xs shadow-sm sm:h-11 sm:px-6 sm:text-sm"
              >
                <Plus className="h-4 w-4" />
                Tambah Add-on
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
              {total.toLocaleString("id-ID")} add-on tersimpan
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {addOns.map((addOn, index) => (
                <div
                  key={addOn.id}
                  ref={index === addOns.length - 1 ? lastAddOnRef : null}
                >
                  <Link
                    href={`/dashboard/services/addons/${addOn.id}`}
                    className="block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <Card className="h-full rounded-2xl border-primary p-1 shadow-sm transition-shadow hover:shadow-md dark:border-primary-dark">
                      <CardHeader className="p-4 pb-0">
                        <CardTitle className="line-clamp-1 text-lg">
                          {addOn.name}
                        </CardTitle>
                        <CardDescription className="mt-1 line-clamp-2">
                          {addOn.description || "Tidak ada deskripsi."}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="p-4 pt-4 border-t border-primary/20 dark:border-primary-dark/20 mt-4 flex items-center justify-between">
                        <p className="font-medium text-foreground dark:text-foreground-dark">
                          Rp{" "}
                          {Intl.NumberFormat("id-ID", {
                            style: "decimal",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(addOn.price)}
                        </p>
                        <span className="text-xs text-muted-foreground opacity-50 transition-opacity group-hover:opacity-100 dark:text-muted-foreground-dark">
                          Lihat Detail &rarr;
                        </span>
                      </CardFooter>
                    </Card>
                  </Link>
                </div>
              ))}
            </div>

            {status === "loading" && (
              <div className="flex justify-center p-6" role="status">
                <Loader2 className="h-7 w-7 animate-spin text-primary dark:text-primary-dark" />
                <span className="sr-only">Memuat add-on berikutnya...</span>
              </div>
            )}

            {status === "error" && (
              <LoadError
                message={error}
                onRetry={() => void loadAddOns(page + 1)}
              />
            )}

            {status === "loaded" && page >= lastPage && (
              <p className="pb-24 pt-4 text-center text-sm text-muted-foreground md:pb-6 dark:text-muted-foreground-dark">
                Semua add-on telah ditampilkan.
              </p>
            )}
          </>
        )}
      </TabsContent>
    </Tabs>
  );
}

function AddOnSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
      aria-label="Memuat add-on"
    >
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-36 animate-pulse rounded-2xl border border-foreground/10 p-5 dark:border-foreground-dark/10"
        >
          <div className="h-5 w-2/3 rounded bg-muted dark:bg-muted-dark" />
          <div className="mt-3 h-4 w-full rounded bg-muted dark:bg-muted-dark" />
          <div className="mt-8 h-5 w-1/3 rounded bg-muted dark:bg-muted-dark" />
        </div>
      ))}
    </div>
  );
}

function LoadError({
  message,
  onRetry,
}: {
  message: string | null;
  onRetry: () => void;
}) {
  return (
    <div className="space-y-3 py-8 text-center">
      <p role="alert" className="text-sm text-red-500">
        {message || "Gagal memuat daftar add-on."}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="text-sm font-medium text-primary hover:underline dark:text-primary-dark"
      >
        Coba lagi
      </button>
    </div>
  );
}
