import { Suspense } from "react";
import { SiteNavInteractive } from "@/shared/components/site-nav-interactive";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 shadow-xs backdrop-blur supports-[backdrop-filter]:bg-background/90">
      <div className="mx-auto flex min-h-[64px] sm:min-h-[68px] w-full items-center justify-between gap-3 px-4 sm:px-8 lg:px-12 2xl:px-16">
        <Suspense fallback={<nav aria-label="Main Navigation" className="min-h-11 w-full animate-pulse" />}>
          <SiteNavInteractive />
        </Suspense>
      </div>
    </header>
  );
}
