"use client";
import { useMemo, useState } from "react";
import type { Appointment } from "@/shared/data/mock/catalog";
import { getAvailableDates } from "@/shared/data/clinic-repository";
import { useClinic } from "@/shared/data/use-clinic";
import { AppointmentRows } from "@/features/admin/admin-appointments";
import { PageTitle, Panel, dateLabel } from "@/features/admin/admin-ui";
import { AppCombobox } from "@/shared/components/ui/combobox";
export function Calendar({ appointments, serviceFor, doctorFor }: { appointments: readonly Appointment[]; serviceFor: (id: string) => string; doctorFor: (id: string) => string }) {
  const { services, doctors } = useClinic();
  const days = useMemo(() => Array.from(new Set(services.flatMap((service) => doctors.filter((doctor) => doctor.serviceIds.includes(service.id)).flatMap((doctor) => getAvailableDates(service.id, doctor.id))).concat(appointments.filter((item) => item.status === "confirmed").map((item) => item.date)))).sort(), [appointments, doctors, services]);
  const [date, setDate] = useState(days[0] ?? ""); const rows = appointments.filter((item) => item.status === "confirmed" && item.date === date).sort((a,b) => a.time.localeCompare(b.time));
  return <><PageTitle title="Calendar" description="Pick an available sample date in UTC to review its appointments."/><Panel><div className="max-w-sm"><AppCombobox label="Date (UTC)" options={days.map((day) => ({ value: day, label: dateLabel(day) }))} value={date} onValueChange={setDate} placeholder="Choose a date" emptyMessage="No matching dates."/></div><h2 className="mt-6 text-lg font-semibold">{date ? `${dateLabel(date)} UTC` : "No sample dates available"}</h2><div className="mt-2"><AppointmentRows appointments={rows} serviceFor={serviceFor} doctorFor={doctorFor}/></div></Panel></>;
}



