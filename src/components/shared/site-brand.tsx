"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/locale-provider";

export function SiteBrand({ footer = false }: { footer?: boolean }) {
  const { t } = useI18n();
  return <Link aria-label={t.brand.home} className={`inline-flex min-h-11 min-w-11 shrink-0 items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 ${footer ? "font-semibold text-foreground" : "text-foreground"}`} href="/#home">
    <span className="grid size-10 place-items-center rounded-full bg-brand-subtle text-brand-primary">
      <svg aria-hidden="true" className="size-[19px]" fill="none" viewBox="0 0 24 24">
        <path d="M7.4 4.25c-2.12 0-3.4 1.72-3.4 4.2 0 2.29.86 3.48 1.73 4.83.78 1.2 1.17 4.72 2.43 4.72 1.03 0 1.39-3.76 3.84-3.76s2.81 3.76 3.84 3.76c1.26 0 1.65-3.52 2.43-4.72.87-1.35 1.73-2.54 1.73-4.83 0-2.48-1.28-4.2-3.4-4.2-1.54 0-2.23.71-4.6.71s-3.06-.71-4.6-.71Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
      </svg>
    </span>
    <span className="text-sm font-bold tracking-tight sm:text-base">{t.brand.name}</span>
  </Link>;
}
