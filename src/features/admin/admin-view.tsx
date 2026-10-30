"use client";

import { useClinic } from "@/data/use-clinic";
import { localizedDoctor, localizedService } from "@/data/mock/localized-copy";
import { useI18n } from "@/i18n/locale-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { Appointments as AdminAppointments, AppointmentDetail } from "@/features/admin/admin-appointments";
import { Calendar as AdminCalendar } from "@/features/admin/admin-calendar";
import { DoctorEditor, ServiceCreator, ServiceEditor, Services } from "@/features/admin/admin-catalog";
import { Accounts } from "@/features/admin/admin-accounts";
import { AccountCreator } from "@/features/admin/admin-account-creator";
import { AdminOverview } from "@/features/admin/admin-overview";
import { AdminSettings } from "@/features/admin/admin-settings";

type View = "overview" | "appointments" | "appointment" | "calendar" | "accounts" | "account-create" | "doctors" | "doctor" | "services" | "service" | "service-create" | "patients" | "settings";

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
    case "accounts": return <Accounts/>;
    case "account-create": return <AccountCreator/>;
    case "doctors": return <Accounts initialRole="doctor"/>;
    case "doctor": return <DoctorEditor id={id ?? ""} doctors={doctors} services={services} save={(doctor) => clinic.updateDoctor(doctor)}/>;
    case "services": return <Services services={services}/>;
    case "service-create": return <ServiceCreator save={(service) => clinic.createService(service)}/>;
    case "service": return <ServiceEditor id={id ?? ""} services={services} save={(service) => clinic.updateService(service)}/>;
    case "patients": return <Accounts initialRole="patient"/>;
    case "settings": return <AdminSettings clinic={clinic}/>;
  }
}

export function AppointmentFallback() {
  const { t } = useI18n();
  return (
    <div aria-busy="true" aria-label={t.admin.loading.appointment} className="space-y-6">
      <div className="mb-8 border-b border-border pb-6 space-y-3">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-2xl border border-border" />
        <Skeleton className="h-64 rounded-2xl border border-border" />
      </div>
    </div>
  );
}

export function DoctorFallback() {
  const { t } = useI18n();
  return (
    <div aria-busy="true" aria-label={t.admin.loading.doctor} className="space-y-6">
      <div className="mb-8 border-b border-border pb-6 space-y-3">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-[28rem] max-w-2xl rounded-2xl border border-border" />
    </div>
  );
}

export function ServiceFallback() {
  const { t } = useI18n();
  return (
    <div aria-busy="true" aria-label={t.admin.loading.service} className="space-y-6">
      <div className="mb-8 border-b border-border pb-6 space-y-3">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-72 max-w-2xl rounded-2xl border border-border" />
    </div>
  );
}
