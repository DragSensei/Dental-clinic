"use client";

import { useI18n } from "@/i18n/locale-provider";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  const { t } = useI18n();
  return (
    <main aria-busy="true" aria-label={t.system.loading} className="page-shell flex-1">
      <div className="surface p-8">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-5 h-9 max-w-md" />
        <Skeleton className="mt-4 h-4 max-w-xl" />
      </div>
    </main>
  );
}
