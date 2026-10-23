"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CalendarCheck2, CalendarX2, ClipboardList, Stethoscope } from "lucide-react";
import { getAvailableDates } from "@/data/clinic-repository";
import { localizedDoctor, localizedService } from "@/data/mock/localized-copy";
import type { Appointment, Doctor, Service } from "@/data/mock/catalog";
import { interpolate } from "@/i18n/format";
import { useI18n } from "@/i18n/locale-provider";
import { AppointmentRows } from "@/features/admin/admin-appointments";
import { PageTitle, Panel, useDateLabel } from "@/features/admin/admin-ui";

type OverviewProps = { appointments: readonly Appointment[]; services: readonly Service[]; doctors: readonly Doctor[] };

function ActivityChart({ appointments, dates }: { appointments: readonly Appointment[]; dates: string[] }) {
  const { formatDate, t } = useI18n();
  const dateLabel = useDateLabel();
  const activity = dates.map((date) => ({ date, count: appointments.filter((item) => item.status === "confirmed" && item.date === date).length }));
  const maximum = Math.max(...activity.map(({ count }) => count), 1);
  const total = activity.reduce((sum, item) => sum + item.count, 0);
  const summary = activity.map(({ date, count }) => interpolate(t.admin.overview.dateCount, { date: dateLabel(date), count })).join("; ");
  return <Panel>
    <div className="mb-5 flex flex-wrap items-end justify-between gap-2"><div><h2 className="text-lg font-semibold">{t.admin.overview.activityTitle}</h2><p className="mt-1 text-sm text-muted-foreground">{t.admin.overview.activityBody}</p></div><span className="text-sm tabular-nums text-muted-foreground">{interpolate(t.admin.overview.scheduled, { count: total })}</span></div>
    {activity.length === 0 ? <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">{t.admin.overview.noDates}</p> : <>
      <div role="img" aria-label={interpolate(t.admin.overview.chartLabel, { summary })} className="grid min-h-44 grid-cols-7 items-end gap-2 border-b border-border px-1 pb-0 pt-4 sm:gap-4">
        {activity.map(({ date, count }) => <div key={date} className="flex h-full min-w-0 flex-col items-center justify-end gap-2"><span className="text-xs tabular-nums text-muted-foreground">{count}</span><div className="flex h-24 w-full items-end"><div className="mx-auto w-full max-w-10 rounded-t-md bg-primary transition-[height] duration-300 motion-reduce:transition-none" style={{ height: `${count === 0 ? 3 : Math.max(10, (count / maximum) * 100)}%` }}/></div><span className="pb-2 text-center text-[11px] leading-tight text-muted-foreground">{formatDate(date, { weekday: "short" })}<span className="block tabular-nums">{new Date(`${date}T12:00:00Z`).getUTCDate()}</span></span></div>)}
      </div>
      {total === 0 && <p className="mt-4 text-sm text-muted-foreground">{t.admin.overview.noneInWindow}</p>}
      <ul className="sr-only">{activity.map(({ date, count }) => <li key={date}>{interpolate(t.admin.overview.utcCount, { date: dateLabel(date), count })}</li>)}</ul>
    </>}
  </Panel>;
}

export function AdminOverview({ appointments, services, doctors }: OverviewProps) {
  const { locale, t } = useI18n();
  const dateLabel = useDateLabel();
  const confirmed = appointments.filter((item) => item.status === "confirmed");
  const cancelled = appointments.length - confirmed.length;
  const serviceCoverage = useMemo(() => services.map((service) => {
    const matches = doctors.filter((doctor) => doctor.serviceIds.includes(service.id));
    const firstDate = matches.flatMap((doctor) => getAvailableDates(service.id, doctor.id)).sort()[0];
    return { service, title: localizedService(service, locale).title, doctorCount: matches.length, firstDate };
  }).sort((a, b) => b.doctorCount - a.doctorCount || a.title.localeCompare(b.title, locale)).slice(0, 5), [doctors, services, locale]);
  const dates = useMemo(() => {
    return Array.from(new Set(services.flatMap((service) => doctors.filter((doctor) => doctor.serviceIds.includes(service.id)).flatMap((doctor) => getAvailableDates(service.id, doctor.id))))).sort().slice(0, 7);
  }, [doctors, services]);
  const stats = [
    { label: t.admin.overview.confirmed, value: confirmed.length, Icon: CalendarCheck2 },
    { label: t.admin.overview.cancelled, value: cancelled, Icon: CalendarX2 },
    { label: t.admin.overview.doctors, value: doctors.length, Icon: Stethoscope },
    { label: t.admin.overview.services, value: services.length, Icon: ClipboardList },
  ];
  const upcoming = confirmed.slice().sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)).slice(0, 6);
  const serviceTitle = (id: string) => services.find((item) => item.id === id);
  const doctorName = (id: string) => doctors.find((item) => item.id === id);

  return <>
    <PageTitle title={t.admin.overview.title} description={t.admin.overview.description}/>
    <p className="mb-6 rounded-xl border border-brand-border bg-brand-subtle p-4 text-sm leading-6">{t.admin.overview.simulation}</p>
    <section aria-label={t.admin.overview.clinicSummary} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, Icon }) => <Panel key={label}><div className="flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{label}</p><span className="grid size-10 place-items-center rounded-full bg-secondary text-primary"><Icon aria-hidden="true" className="size-5"/></span></div><p className="mt-4 text-3xl font-semibold tabular-nums">{value}</p></Panel>)}
    </section>
    <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <ActivityChart appointments={appointments} dates={dates}/>
      <Panel>
        <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">{t.admin.overview.coverageTitle}</h2><Link className="min-h-11 inline-flex items-center text-sm font-medium text-primary underline-offset-4 hover:underline" href="/admin/services">{t.admin.overview.viewServices}</Link></div>
        {serviceCoverage.length ? <div className="divide-y divide-border">{serviceCoverage.map(({ service, title, doctorCount, firstDate }) => <div key={service.id} className="flex min-h-16 items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate font-medium">{title}</p><p className="mt-1 text-xs text-muted-foreground">{doctorCount === 1 ? t.admin.overview.eligibleOne : interpolate(t.admin.overview.eligibleMany, { count: doctorCount })}</p></div><span className="shrink-0 text-end text-xs tabular-nums text-muted-foreground">{firstDate ? interpolate(t.admin.overview.nextDate, { date: dateLabel(firstDate) }) : t.admin.overview.noDatesShort}</span></div>)}</div> : <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">{t.admin.overview.noServicesCatalog}</p>}
      </Panel>
    </div>
    <Panel className="mt-5">
      <div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">{t.admin.overview.upcomingTitle}</h2><p className="mt-1 text-sm text-muted-foreground">{t.admin.overview.upcomingBody}</p></div><Link className="min-h-11 inline-flex items-center text-sm font-medium text-primary underline-offset-4 hover:underline" href="/admin/appointments">{t.admin.overview.viewSchedule}</Link></div>
      <AppointmentRows appointments={upcoming} serviceFor={(id) => { const item = serviceTitle(id); return item ? localizedService(item, locale).title : t.admin.unknownService; }} doctorFor={(id) => { const item = doctorName(id); return item ? localizedDoctor(item, locale).name : t.admin.unknownDoctor; }}/>
    </Panel>
  </>;
}
