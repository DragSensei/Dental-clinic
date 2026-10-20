"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CalendarCheck2, CalendarX2, ClipboardList, Stethoscope } from "lucide-react";
import { getAvailableDates } from "@/shared/data/clinic-repository";
import type { Appointment, Doctor, Service } from "@/shared/data/mock/catalog";
import { AppointmentRows } from "@/features/admin/admin-appointments";
import { dateLabel, PageTitle, Panel } from "@/features/admin/admin-ui";

type OverviewProps = { appointments: readonly Appointment[]; services: readonly Service[]; doctors: readonly Doctor[] };

function ActivityChart({ appointments, dates }: { appointments: readonly Appointment[]; dates: string[] }) {
  const activity = dates.map((date) => ({ date, count: appointments.filter((item) => item.status === "confirmed" && item.date === date).length }));
  const maximum = Math.max(...activity.map(({ count }) => count), 1);
  const total = activity.reduce((sum, item) => sum + item.count, 0);
  return <Panel>
    <div className="mb-5 flex flex-wrap items-end justify-between gap-2"><div><h2 className="text-lg font-semibold">Appointment activity</h2><p className="mt-1 text-sm text-muted-foreground">Confirmed visits across the next seven available demo dates (UTC).</p></div><span className="text-sm tabular-nums text-muted-foreground">{total} scheduled</span></div>
    {activity.length === 0 ? <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">No sample availability dates are configured.</p> : <>
      <div role="img" aria-label={`Confirmed appointments across seven available UTC dates. ${activity.map(({ date, count }) => `${dateLabel(date)}: ${count}`).join("; ")}`} className="grid min-h-44 grid-cols-7 items-end gap-2 border-b border-border px-1 pb-0 pt-4 sm:gap-4">
        {activity.map(({ date, count }) => <div key={date} className="flex h-full min-w-0 flex-col items-center justify-end gap-2"><span className="text-xs tabular-nums text-muted-foreground">{count}</span><div className="flex h-24 w-full items-end"><div className="mx-auto w-full max-w-10 rounded-t-md bg-primary transition-[height] duration-300 motion-reduce:transition-none" style={{ height: `${count === 0 ? 3 : Math.max(10, (count / maximum) * 100)}%` }}/></div><span className="pb-2 text-center text-[11px] leading-tight text-muted-foreground">{new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" })}<span className="block tabular-nums">{new Date(`${date}T12:00:00Z`).getUTCDate()}</span></span></div>)}
      </div>
      {total === 0 && <p className="mt-4 text-sm text-muted-foreground">No confirmed appointments in this seven-date window.</p>}
      <ul className="sr-only">{activity.map(({ date, count }) => <li key={date}>{dateLabel(date)} UTC: {count} confirmed appointments</li>)}</ul>
    </>}
  </Panel>;
}

export function AdminOverview({ appointments, services, doctors }: OverviewProps) {
  const confirmed = appointments.filter((item) => item.status === "confirmed");
  const cancelled = appointments.length - confirmed.length;
  const serviceCoverage = useMemo(() => services.map((service) => {
    const matches = doctors.filter((doctor) => doctor.serviceIds.includes(service.id));
    const firstDate = matches.flatMap((doctor) => getAvailableDates(service.id, doctor.id)).sort()[0];
    return { service, doctorCount: matches.length, firstDate };
  }).sort((a, b) => b.doctorCount - a.doctorCount || a.service.title.localeCompare(b.service.title)).slice(0, 5), [doctors, services]);
  const dates = useMemo(() => {
    return Array.from(new Set(services.flatMap((service) => doctors.filter((doctor) => doctor.serviceIds.includes(service.id)).flatMap((doctor) => getAvailableDates(service.id, doctor.id))))).sort().slice(0, 7);
  }, [doctors, services]);
  const stats = [
    { label: "Confirmed", value: confirmed.length, Icon: CalendarCheck2 },
    { label: "Cancelled", value: cancelled, Icon: CalendarX2 },
    { label: "Doctors", value: doctors.length, Icon: Stethoscope },
    { label: "Services", value: services.length, Icon: ClipboardList },
  ];
  const upcoming = confirmed.slice().sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)).slice(0, 6);

  return <>
    <PageTitle title="Overview" description="A quick look at the sample schedule and clinic setup."/>
    <p className="mb-6 rounded-xl border border-brand-border bg-brand-subtle p-4 text-sm leading-6">Simulation only. Changes live in this browser session and reset when the demo is refreshed. This workspace has no staff sign-in, database, or live booking connection.</p>
    <section aria-label="Clinic summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, Icon }) => <Panel key={label}><div className="flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{label}</p><span className="grid size-10 place-items-center rounded-full bg-secondary text-primary"><Icon aria-hidden="true" className="size-5"/></span></div><p className="mt-4 text-3xl font-semibold tabular-nums">{value}</p></Panel>)}
    </section>
    <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <ActivityChart appointments={appointments} dates={dates}/>
      <Panel>
        <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Service coverage</h2><Link className="min-h-11 inline-flex items-center text-sm font-medium text-primary underline-offset-4 hover:underline" href="/admin/services">View services</Link></div>
        {serviceCoverage.length ? <div className="divide-y divide-border">{serviceCoverage.map(({ service, doctorCount, firstDate }) => <div key={service.id} className="flex min-h-16 items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate font-medium">{service.title}</p><p className="mt-1 text-xs text-muted-foreground">{doctorCount} eligible {doctorCount === 1 ? "doctor" : "doctors"}</p></div><span className="shrink-0 text-right text-xs tabular-nums text-muted-foreground">{firstDate ? `Next ${dateLabel(firstDate)} UTC` : "No dates"}</span></div>)}</div> : <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">No services are available in the demo catalog.</p>}
      </Panel>
    </div>
    <Panel className="mt-5">
      <div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Upcoming appointments</h2><p className="mt-1 text-sm text-muted-foreground">Next confirmed reservations in the demo schedule.</p></div><Link className="min-h-11 inline-flex items-center text-sm font-medium text-primary underline-offset-4 hover:underline" href="/admin/appointments">View schedule</Link></div>
      <AppointmentRows appointments={upcoming} serviceFor={(id) => services.find((item) => item.id === id)?.title ?? "Removed service"} doctorFor={(id) => doctors.find((item) => item.id === id)?.name ?? "Unassigned doctor"}/>
    </Panel>
  </>;
}
