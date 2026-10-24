export default function ReviewsLoading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="h-9 w-36 rounded-lg bg-muted dark:bg-muted-dark" />
          <div className="h-5 w-64 rounded-lg bg-muted dark:bg-muted-dark" />
        </div>
        <div className="h-11 w-full rounded-xl bg-muted dark:bg-muted-dark sm:w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-48 rounded-2xl bg-muted dark:bg-muted-dark"
          />
        ))}
      </div>
    </div>
  );
}
