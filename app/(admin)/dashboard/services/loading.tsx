export default function ServicesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="h-8 w-32 bg-muted/60 rounded-md mb-2"></div>
          <div className="h-4 w-64 bg-muted/60 rounded-md"></div>
        </div>
        <div className="h-11 w-40 bg-muted/60 rounded-xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-background border border-foreground/10 p-5 rounded-2xl shadow-sm h-[130px] flex flex-col justify-between">
            <div>
              <div className="h-6 w-3/4 bg-muted/60 rounded-md mb-2"></div>
              <div className="h-4 w-full bg-muted/60 rounded-md"></div>
            </div>
            <div className="pt-4 border-t border-foreground/5 mt-4 flex items-center justify-between">
              <div className="h-5 w-1/3 bg-muted/60 rounded-md"></div>
              <div className="h-3 w-1/4 bg-muted/60 rounded-md"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
