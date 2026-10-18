export default function BookingDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl animate-pulse space-y-5 pb-8">
      <div className="h-10 w-52 rounded-xl bg-muted dark:bg-muted-dark" />

      <div className="overflow-hidden rounded-3xl border border-foreground/10 bg-background dark:border-foreground-dark/10 dark:bg-background-dark">
        <div className="space-y-2 border-b border-foreground/10 p-5 dark:border-foreground-dark/10 sm:p-6">
          <div className="h-8 w-44 rounded-lg bg-muted dark:bg-muted-dark" />
          <div className="h-4 w-28 rounded bg-muted dark:bg-muted-dark" />
        </div>

        <div className="grid grid-cols-1 gap-8 p-5 sm:p-6 md:grid-cols-2">
          {[0, 1].map((column) => (
            <div key={column} className="space-y-6">
              {[0, 1].map((section) => (
                <div key={section} className="space-y-3">
                  <div className="h-4 w-32 rounded bg-muted dark:bg-muted-dark" />
                  <div className="space-y-4 rounded-2xl border border-foreground/5 p-4 dark:border-foreground-dark/5">
                    {[0, 1, 2].map((item) => (
                      <div key={item} className="flex items-center gap-3">
                        <div className="h-9 w-9 shrink-0 rounded-full bg-muted dark:bg-muted-dark" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-1/3 rounded bg-muted dark:bg-muted-dark" />
                          <div className="h-4 w-2/3 rounded bg-muted dark:bg-muted-dark" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
