"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiteBrand } from "@/shared/components/site-brand";
import { useI18n } from "@/shared/i18n/locale-provider";

export function SiteFooter() {
  const pathname = usePathname();
  const { t } = useI18n();
  const groups = [
    { title: t.footer.explore, links: [[t.footer.services, "/services"], [t.footer.doctors, "/doctors"], [t.footer.firstVisit, "/visit"]] },
    { title: t.footer.onThisSite, links: [[t.footer.storyLink, "/#who-we-are"], [t.footer.faqs, "/#faq"], [t.footer.contact, "/#clinic"]] },
    { title: t.footer.appointments, links: [[t.footer.bookingPreview, "/book"], [t.footer.admin, "/admin"]] },
  ];
  if (pathname.startsWith("/admin")) return <footer className="border-t border-border bg-muted px-5 py-3 text-xs text-muted-foreground sm:px-8 lg:px-12 2xl:px-16"><p>{t.footer.adminNote}</p></footer>;
  return <footer className="border-t border-border bg-muted text-foreground">
    <div className="mx-auto grid w-full gap-8 px-5 py-10 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-12 lg:py-14 2xl:px-16">
      <div className="sm:col-span-2 lg:col-span-1"><SiteBrand footer /><p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">{t.footer.tagline}</p></div>
      {groups.map(({ title, links }) => <nav aria-label={title} key={title}><h2 className="mb-2 text-sm font-semibold">{title}</h2><ul className="space-y-1">{links.map(([label, href]) => <li key={label}><Link className="inline-flex min-h-11 min-w-11 items-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-ring" href={href}>{label}</Link></li>)}</ul></nav>)}
    </div>
    <div className="border-t border-border px-5 py-4 text-xs text-muted-foreground sm:px-8 lg:px-12 2xl:px-16"><div className="mx-auto flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><p>{t.footer.publicNote}</p><p>{t.footer.bookingNote}</p></div></div>
  </footer>;
}
