import { Suspense } from "react";
import { SiteFooterClient } from "@/components/site-footer-client";

function SiteFooterFallback() {
  return (
    <footer className="border-t border-border bg-muted text-foreground">
      <div className="mx-auto grid w-full gap-8 px-5 py-10 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-12 lg:py-14 2xl:px-16">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="inline-flex min-h-11 shrink-0 items-center gap-2.5 font-semibold text-foreground">
            <span className="grid size-10 place-items-center rounded-full bg-brand-subtle text-brand-primary">
              <svg aria-hidden="true" className="size-[19px]" fill="none" viewBox="0 0 24 24">
                <path
                  d="M7.4 4.25c-2.12 0-3.4 1.72-3.4 4.2 0 2.29.86 3.48 1.73 4.83.78 1.2 1.17 4.72 2.43 4.72 1.03 0 1.39-3.76 3.84-3.76s2.81 3.76 3.84 3.76c1.26 0 1.65-3.52 2.43-4.72.87-1.35 1.73-2.54 1.73-4.83 0-2.48-1.28-4.2-3.4-4.2-1.54 0-2.23.71-4.6-.71s-3.06-.71-4.6-.71Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.6"
                />
              </svg>
            </span>
            <span className="text-sm font-bold tracking-tight sm:text-base">BlueHaven Dental</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
            Thoughtful dental care designed around clear steps, transparent expectations, and calm visits.
          </p>
        </div>
        <div className="sm:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="h-4 w-20 rounded bg-muted-foreground/20 animate-pulse" />
            <div className="h-4 w-28 rounded bg-muted-foreground/10 animate-pulse" />
            <div className="h-4 w-24 rounded bg-muted-foreground/10 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 rounded bg-muted-foreground/20 animate-pulse" />
            <div className="h-4 w-28 rounded bg-muted-foreground/10 animate-pulse" />
            <div className="h-4 w-24 rounded bg-muted-foreground/10 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 rounded bg-muted-foreground/20 animate-pulse" />
            <div className="h-4 w-28 rounded bg-muted-foreground/10 animate-pulse" />
            <div className="h-4 w-24 rounded bg-muted-foreground/10 animate-pulse" />
          </div>
        </div>
      </div>
      <div className="border-t border-border px-5 py-4 text-xs text-muted-foreground sm:px-8 lg:px-12 2xl:px-16">
        <div className="mx-auto flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>BlueHaven Dental Clinic</p>
          <p>Demo &amp; preview environment</p>
        </div>
      </div>
    </footer>
  );
}

export function SiteFooter() {
  return (
    <Suspense fallback={<SiteFooterFallback />}>
      <SiteFooterClient />
    </Suspense>
  );
}
