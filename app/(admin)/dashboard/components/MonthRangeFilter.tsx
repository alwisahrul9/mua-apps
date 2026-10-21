"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function MonthRangeFilter({
  initialStartMonth = "",
  initialEndMonth = "",
}: {
  initialStartMonth?: string;
  initialEndMonth?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isNavigating, startNavigation] = useTransition();

  const [startMonth, setStartMonth] = useState(initialStartMonth);
  const [endMonth, setEndMonth] = useState(initialEndMonth);
  const invalidRange = Boolean(startMonth && endMonth && startMonth > endMonth);

  const handleFilter = () => {
    if (invalidRange) return;

    const params = new URLSearchParams(searchParams.toString());
    if (startMonth) {
      params.set("start", startMonth);
    } else {
      params.delete("start");
    }

    if (endMonth) {
      params.set("end", endMonth);
    } else {
      params.delete("end");
    }

    startNavigation(() => {
      router.push(`/dashboard${params.size ? `?${params.toString()}` : ""}`, {
        scroll: false,
      });
    });
  };

  const handleReset = () => {
    setStartMonth("");
    setEndMonth("");
    startNavigation(() => {
      router.push("/dashboard", { scroll: false });
    });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap items-end gap-4 p-4 bg-background dark:bg-background-dark rounded-2xl border border-foreground/10 dark:border-foreground-dark/10 shadow-sm">
      <div className="flex-1 w-full flex flex-col gap-2">
        <Label
          htmlFor="start-month"
          className="text-muted-foreground dark:text-muted-foreground-dark"
        >
          Bulan & Tahun Mulai
        </Label>
        <Input
          id="start-month"
          type="month"
          value={startMonth}
          max={endMonth || undefined}
          onChange={(e) => setStartMonth(e.target.value)}
          className="w-full bg-transparent appearance-none h-11 md:h-10 cursor-pointer"
        />
      </div>
      <div className="flex-1 w-full flex flex-col gap-2">
        <Label
          htmlFor="end-month"
          className="text-muted-foreground dark:text-muted-foreground-dark"
        >
          Bulan & Tahun Akhir
        </Label>
        <Input
          id="end-month"
          type="month"
          value={endMonth}
          min={startMonth || undefined}
          onChange={(e) => setEndMonth(e.target.value)}
          className="w-full bg-transparent appearance-none h-11 md:h-10 cursor-pointer"
        />
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={isNavigating}
          className="flex-1 bg-transparent sm:flex-none border-foreground/20 dark:border-foreground-dark/20 hover:bg-muted dark:hover:bg-muted-dark h-11 md:h-10"
        >
          Reset
        </Button>
        <Button
          onClick={handleFilter}
          disabled={invalidRange || isNavigating}
          className="flex-1 sm:flex-none bg-primary dark:bg-primary-dark text-primary-foreground dark:text-primary-foreground-dark hover:bg-primary/90 dark:hover:bg-primary-dark/90 h-11 md:h-10"
        >
          Terapkan
        </Button>
      </div>
      {invalidRange && (
        <p className="w-full text-sm text-destructive sm:basis-full">
          Bulan akhir tidak boleh lebih awal dari bulan mulai.
        </p>
      )}
    </div>
  );
}
