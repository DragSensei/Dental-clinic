import { Suspense } from "react";
import { SiteNavInteractive } from "@/components/site-nav-interactive";

export function SiteNav() {
  return (
    <Suspense fallback={<header className="sticky top-0 z-50 w-full min-h-[64px]" />}>
      <SiteNavInteractive />
    </Suspense>
  );
}
