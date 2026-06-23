function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200/80 ${className}`}
      aria-hidden="true"
    />
  );
}

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#f3f6fb] text-slate-950" aria-busy="true">
      <div className="flex min-h-screen">
        <aside className="hidden min-h-screen w-[260px] shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex items-center gap-3">
              <SkeletonBlock className="size-11" />
              <div className="space-y-2">
                <SkeletonBlock className="h-4 w-36" />
                <SkeletonBlock className="h-3 w-28" />
              </div>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-2 px-4 py-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 rounded-lg px-4 py-3">
                <SkeletonBlock className="size-5" />
                <SkeletonBlock className="h-4 w-32" />
              </div>
            ))}
          </div>
          <div className="border-t border-slate-200 p-4">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <SkeletonBlock className="size-11 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-28" />
                <SkeletonBlock className="h-3 w-36" />
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="border-b border-slate-200 bg-white px-6 py-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <SkeletonBlock className="h-8 w-48" />
                <SkeletonBlock className="h-4 w-72 max-w-full" />
              </div>
              <div className="flex items-center gap-3">
                <SkeletonBlock className="size-10" />
                <SkeletonBlock className="h-10 w-24" />
              </div>
            </div>
          </header>

          <div className="space-y-6 px-6 py-6">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <SkeletonBlock className="h-4 w-28" />
                      <SkeletonBlock className="h-8 w-20" />
                    </div>
                    <SkeletonBlock className="size-11" />
                  </div>
                  <SkeletonBlock className="mt-5 h-3 w-full" />
                </div>
              ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <SkeletonBlock className="h-4 w-24" />
                <div className="mt-6 space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <SkeletonBlock className="h-3 w-20" />
                      <SkeletonBlock className="h-11 w-full" />
                    </div>
                  ))}
                </div>
                <SkeletonBlock className="mt-6 h-11 w-full" />
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div className="space-y-2">
                    <SkeletonBlock className="h-4 w-24" />
                    <SkeletonBlock className="h-7 w-56" />
                  </div>
                  <SkeletonBlock className="h-11 w-full max-w-sm" />
                </div>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="grid gap-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                      <SkeletonBlock className="size-14" />
                      <div className="space-y-3">
                        <SkeletonBlock className="h-5 w-52" />
                        <SkeletonBlock className="h-4 w-72 max-w-full" />
                        <SkeletonBlock className="h-4 w-44" />
                      </div>
                      <div className="flex gap-2 sm:w-32 sm:flex-col">
                        <SkeletonBlock className="size-9 sm:self-end" />
                        <SkeletonBlock className="h-9 w-full" />
                        <SkeletonBlock className="h-9 w-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
