export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-pulse" aria-busy="true">
      <div className="space-y-2">
        <div className="h-9 w-44 rounded-lg bg-muted dark:bg-muted-dark" />
        <div className="h-4 w-80 max-w-full rounded bg-muted dark:bg-muted-dark" />
      </div>
      {[1, 2, 3].map((item) => (
        <div key={item} className="space-y-5 rounded-2xl border border-foreground/10 p-6 dark:border-foreground-dark/10">
          <div className="h-6 w-52 rounded bg-muted dark:bg-muted-dark" />
          <div className="h-24 rounded-xl bg-muted dark:bg-muted-dark" />
        </div>
      ))}
    </div>
  );
}
