"use client";

import Link from "next/link";
import { useI18n } from "@/shared/i18n/locale-provider";
import { AlertErrorWithEverything } from "@/shared/components/ui/alert-error";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useI18n();

  return (
    <main className="page-shell flex-1 py-16">
      <div className="mx-auto max-w-2xl">
        <AlertErrorWithEverything
          title={t.system.errorTitle}
          description={error?.message || t.system.errorBody}
          onRetry={reset}
          retryLabel={t.system.tryAgain}
          action={
            <Link
              href="/"
              className="inline-flex min-h-9 items-center rounded-lg border border-brand-border px-3 text-xs font-semibold text-foreground hover:bg-muted"
            >
              {t.system.returnHome}
            </Link>
          }
        />
      </div>
    </main>
  );
}
