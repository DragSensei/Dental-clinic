import { Suspense } from "react";
import { SiteFooterClient } from "@/shared/components/site-footer-client";

export function SiteFooter() {
  return (
    <Suspense fallback={null}>
      <SiteFooterClient />
    </Suspense>
  );
}
