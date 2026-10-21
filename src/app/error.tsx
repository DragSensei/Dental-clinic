"use client";

import Link from "next/link";
import { useI18n } from "@/shared/i18n/locale-provider";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useI18n();
  return <main className="page-shell flex-1"><section className="surface mx-auto max-w-2xl p-8 text-center"><p className="eyebrow">{t.system.errorEyebrow}</p><h1 className="page-title">{t.system.errorTitle}</h1><p className="mt-4 text-muted-foreground">{t.system.errorBody}</p><div className="mt-6 flex flex-wrap justify-center gap-3"><button className="min-h-11 rounded-lg bg-primary px-5 font-semibold text-primary-foreground" onClick={reset} type="button">{t.system.tryAgain}</button><Link className="inline-flex min-h-11 items-center rounded-lg border border-brand-border px-5 font-semibold text-foreground hover:bg-muted" href="/">{t.system.returnHome}</Link></div></section></main>;
}
