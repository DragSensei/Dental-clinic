"use client";

import Link from "next/link";
import { useI18n } from "@/shared/i18n/locale-provider";

export default function NotFound() {
  const { t } = useI18n();
  return <main className="page-shell flex-1"><section className="surface mx-auto max-w-2xl p-8 text-center"><p className="eyebrow">{t.system.notFoundEyebrow}</p><h1 className="page-title">{t.system.notFoundTitle}</h1><p className="mt-4 text-muted-foreground">{t.system.notFoundBody}</p><Link className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-primary px-5 font-semibold text-primary-foreground" href="/">{t.system.returnHome}</Link></section></main>;
}
