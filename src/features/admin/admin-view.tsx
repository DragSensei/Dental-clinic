"use client";

import { useClinic } from "@/shared/data/use-clinic";
import { Appointments as AdminAppointments, AppointmentDetail } from "@/features/admin/admin-appointments";
import { Calendar as AdminCalendar } from "@/features/admin/admin-calendar";
import { DoctorEditor, Doctors, ServiceEditor, Services } from "@/features/admin/admin-catalog";
import { AdminOverview } from "@/features/admin/admin-overview";
import { Patients } from "@/features/admin/admin-patients";
import { AdminSettings } from "@/features/admin/admin-settings";

type View = "overview" | "appointments" | "appointment" | "calendar" | "doctors" | "doctor" | "services" | "service" | "patients" | "settings";

export function AdminView({ view, id }: { view: View; id?: string }) {
  const clinic = useClinic();
  const { appointments, services, doctors } = clinic;
  const serviceFor = (serviceId: string) => services.find((service) => service.id === serviceId)?.title ?? "Removed service";
  const doctorFor = (doctorId: string) => doctors.find((doctor) => doctor.id === doctorId)?.name ?? "Unassigned doctor";

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
