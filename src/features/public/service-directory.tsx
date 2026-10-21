"use client";

import Link from "next/link";
import { useClinic } from "@/shared/data/use-clinic";
import { localizedService } from "@/shared/data/mock/localized-copy";
import { ServiceCard } from "@/shared/components/service-card";
import { getServiceIcon } from "@/shared/components/service-icons";
import { useI18n } from "@/shared/i18n/locale-provider";

export function ServiceDirectory() {
  const { services } = useClinic();
  const { locale, t } = useI18n();
  return <main className="page-shell min-h-[60vh]">
    <header className="page-header"><p className="eyebrow">{t.services.directory.eyebrow}</p><h1 className="page-title">{t.services.directory.title}</h1><p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">{t.services.directory.lead}</p><p className="mt-3 text-sm text-muted-foreground">{t.services.directory.readyToContinue} <Link className="inline-flex min-h-11 items-center font-semibold text-brand-primary underline underline-offset-4" href="/book">{t.services.directory.startPreview}</Link></p></header>
    {services.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{services.map((service) => <ServiceCard {...service} {...localizedService(service, locale)} headingLevel="h2" Icon={getServiceIcon(service.id)} key={service.id} />)}</div> : <div className="surface p-7 text-sm text-muted-foreground">{t.services.directory.empty}</div>}
  </main>;
}
