"use client";

import { useClinic } from "@/shared/data/use-clinic";
import { localizedDoctor, localizedService } from "@/shared/data/mock/localized-copy";
import { useI18n } from "@/shared/i18n/locale-provider";
import { Appointments as AdminAppointments, AppointmentDetail } from "@/features/admin/admin-appointments";
import { Calendar as AdminCalendar } from "@/features/admin/admin-calendar";
import { DoctorEditor, Doctors, ServiceEditor, Services } from "@/features/admin/admin-catalog";
import { AdminOverview } from "@/features/admin/admin-overview";
import { Patients } from "@/features/admin/admin-patients";
import { AdminSettings } from "@/features/admin/admin-settings";

type View = "overview" | "appointments" | "appointment" | "calendar" | "doctors" | "doctor" | "services" | "service" | "patients" | "settings";

export function AdminView({ view, id }: { view: View; id?: string }) {
  const clinic = useClinic();
  const { locale, t } = useI18n();
  const { appointments, services, doctors } = clinic;
  const serviceFor = (serviceId: string) => {
    const service = services.find((item) => item.id === serviceId);
    return service ? localizedService(service, locale).title : t.admin.unknownService;
  };
  const doctorFor = (doctorId: string) => {
    const doctor = doctors.find((item) => item.id === doctorId);
    return doctor ? localizedDoctor(doctor, locale).name : t.admin.unknownDoctor;
  };
  switch (view) {
    case "overview": return <AdminOverview appointments={appointments} services={services} doctors={doctors}/>;
    case "appointments": return <AdminAppointments appointments={appointments} serviceFor={serviceFor} doctorFor={doctorFor}/>;
    case "appointment": return <AppointmentDetail id={id ?? ""} appointments={appointments} serviceFor={serviceFor} doctorFor={doctorFor}/>;
    case "calendar": return <AdminCalendar appointments={appointments} serviceFor={serviceFor} doctorFor={doctorFor}/>;
    case "doctors": return <Doctors doctors={doctors}/>;
    case "doctor": return <DoctorEditor id={id ?? ""} doctors={doctors} services={services} save={(doctor) => clinic.updateDoctor(doctor)}/>;
    case "services": return <Services services={services}/>;
    case "service": return <ServiceEditor id={id ?? ""} services={services} save={(service) => clinic.updateService(service)}/>;
    case "patients": return <Patients appointments={appointments}/>;
    case "settings": return <AdminSettings clinic={clinic}/>;
  }
}

export function AppointmentFallback() {
  const { t } = useI18n();
  return <div aria-busy="true" aria-label={t.admin.loading.appointment} className="motion-reduce:animate-none animate-pulse"><div className="mb-8 border-b border-border pb-6"><div className="h-3 w-40 rounded bg-muted"/><div className="mt-4 h-9 w-64 rounded bg-muted"/><div className="mt-3 h-4 w-80 max-w-full rounded bg-muted"/></div><div className="grid gap-5 lg:grid-cols-2"><div className="h-64 rounded-2xl border border-border bg-card"/><div className="h-64 rounded-2xl border border-border bg-card"/></div></div>;
}

export function DoctorFallback() {
  const { t } = useI18n();
  return <div aria-busy="true" aria-label={t.admin.loading.doctor} className="motion-reduce:animate-none animate-pulse"><div className="mb-8 border-b border-border pb-6"><div className="h-3 w-40 rounded bg-muted"/><div className="mt-4 h-9 w-64 rounded bg-muted"/><div className="mt-3 h-4 w-80 max-w-full rounded bg-muted"/></div><div className="h-[28rem] max-w-2xl rounded-2xl border border-border bg-card"/></div>;
}

export function ServiceFallback() {
  const { t } = useI18n();
  return <div aria-busy="true" aria-label={t.admin.loading.service} className="motion-reduce:animate-none animate-pulse"><div className="mb-8 border-b border-border pb-6"><div className="h-3 w-40 rounded bg-muted"/><div className="mt-4 h-9 w-64 rounded bg-muted"/><div className="mt-3 h-4 w-80 max-w-full rounded bg-muted"/></div><div className="h-72 max-w-2xl rounded-2xl border border-border bg-card"/></div>;
}
