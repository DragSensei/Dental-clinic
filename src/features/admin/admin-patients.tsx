"use client";
import { useMemo } from "react";
import Link from "next/link";
import type { Appointment } from "@/shared/data/mock/catalog";
import { useI18n } from "@/shared/i18n/locale-provider";
import { Empty, PageTitle, Panel } from "@/features/admin/admin-ui";
export function Patients({ appointments }: { appointments: readonly Appointment[] }) {
  const { t } = useI18n();
  const patients = useMemo(() => Array.from(new Map(appointments.map((item) => [`${item.email.toLowerCase()}|${item.phone}`,item])).values()).sort((a,b) => a.patientName.localeCompare(b.patientName)), [appointments]);
  return <><PageTitle title={t.admin.patients.title} description={t.admin.patients.description}/><Panel>{patients.length ? <div className="divide-y divide-border">{patients.map((item) => <div key={`${item.email}|${item.phone}`} className="flex min-h-16 min-w-0 flex-col justify-center gap-1 py-3 sm:flex-row sm:justify-between"><span className="min-w-0 break-words font-medium">{item.patientName}</span><span className="min-w-0 break-all text-sm text-muted-foreground">{item.email} · {item.phone}</span></div>)}</div> : <Empty>{t.admin.patients.emptyBefore} <Link className="inline-flex min-h-11 items-center text-primary underline" href="/book">{t.admin.patients.publicPage}</Link> {t.admin.patients.emptyAfter}</Empty>}</Panel></>;
}
