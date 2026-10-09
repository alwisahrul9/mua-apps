import { Card, CardContent, CardHeader } from "@/components/ui/card";

function Line({ className = "h-4 w-32" }: { className?: string }) {
  return <div className={`rounded-md bg-muted dark:bg-muted-dark ${className}`} />;
}

function FieldSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div className="space-y-2">
      <Line className="h-4 w-28" />
      <Line className={tall ? "h-24 w-full rounded-xl" : "h-11 w-full rounded-xl"} />
    </div>
  );
}

function SectionSkeleton({
  titleWidth,
  children,
}: {
  titleWidth: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <Line className={`h-6 ${titleWidth}`} />
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function ProfileLoading() {
  return (
    <div
      className="mx-auto max-w-5xl space-y-6 animate-pulse"
      aria-busy="true"
      aria-label="Memuat profil bisnis"
    >
      <span className="sr-only" role="status">Memuat profil bisnis...</span>

      <div className="space-y-2">
        <Line className="h-9 w-52 rounded-lg" />
        <Line className="h-4 w-full max-w-md" />
      </div>

      <div className="space-y-6 p-3">
        <SectionSkeleton titleWidth="w-64">
          <div className="grid gap-5 md:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => <FieldSkeleton key={index} />)}
            <div className="flex items-center justify-between gap-4 rounded-xl border border-foreground/10 p-4 md:col-span-2 dark:border-foreground-dark/10">
              <div className="space-y-2">
                <Line className="h-4 w-32" />
                <Line className="h-3 w-56 max-w-full" />
              </div>
              <div className="h-5 w-5 rounded bg-muted dark:bg-muted-dark" />
            </div>
          </div>
        </SectionSkeleton>

        <SectionSkeleton titleWidth="w-44">
          <div className="space-y-5">
            <FieldSkeleton />
            <FieldSkeleton tall />
            <div className="grid items-start gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Line className="h-4 w-24" />
                <div className="mx-auto aspect-square w-48 rounded-full bg-muted md:mx-0 dark:bg-muted-dark" />
              </div>
              <div className="space-y-2">
                <Line className="h-4 w-28" />
                <div className="h-48 w-full rounded-2xl bg-muted dark:bg-muted-dark" />
              </div>
            </div>
            <FieldSkeleton tall />
          </div>
        </SectionSkeleton>

        <SectionSkeleton titleWidth="w-60">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-5 rounded-2xl border border-foreground/10 p-4 md:col-span-2 dark:border-foreground-dark/10">
              <FieldSkeleton />
              <FieldSkeleton />
              <Line className="h-10 w-36 rounded-xl" />
            </div>
            <FieldSkeleton />
            <FieldSkeleton />
            <div className="md:col-span-2"><FieldSkeleton tall /></div>
          </div>
        </SectionSkeleton>

        <SectionSkeleton titleWidth="w-48">
          <div className="space-y-4">
            <div className="grid gap-4 rounded-2xl border border-foreground/10 p-4 md:grid-cols-3 dark:border-foreground-dark/10">
              <FieldSkeleton />
              <FieldSkeleton />
              <FieldSkeleton />
            </div>
            <Line className="h-10 w-44 rounded-xl" />
          </div>
        </SectionSkeleton>

        <div className="flex justify-end border-t pt-4">
          <Line className="h-11 w-full rounded-xl sm:w-44" />
        </div>
      </div>
    </div>
  );
}
