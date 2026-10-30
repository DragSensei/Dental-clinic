import {
  demoAccounts,
  demoIntakeForms,
  demoInvoices,
  demoTreatmentPlans,
  demoVisitSummaries,
  doctors,
  lastCleaningDateByEmail,
  services,
  type Account,
  type Appointment,
  type BookingDetails,
  type Doctor,
  type PatientIntakeForm,
  type PatientInvoice,
  type Service,
  type TreatmentPlan,
  type VisitCareSummary,
  createDefaultIntakeForm,
  createDefaultInvoice,
  createDefaultTreatmentPlan,
  createDefaultVisitSummary,
} from "@/data/mock/catalog";
import { hoursUntil, CANCEL_WINDOW_HOURS } from "@/lib/clinic-time";

type Listener = () => void;

export type ClinicWorkingHoursDTO = {
  dayOfWeek: number;
  isClosed: boolean;
  startTime?: string;
  endTime?: string;
  slotIntervalMinutes?: number;
};

type ClinicSnapshot = Readonly<{
  appointments: readonly Appointment[];
  services: readonly Service[];
  doctors: readonly Doctor[];
  accounts: readonly Account[];
  intakeForms: readonly PatientIntakeForm[];
  treatmentPlans: readonly TreatmentPlan[];
  visitSummaries: readonly VisitCareSummary[];
  invoices: readonly PatientInvoice[];
  workingHours: readonly ClinicWorkingHoursDTO[];
}>;

export type ClinicErrorCode =
  | "service_clinician_mismatch"
  | "invalid_contact"
  | "slot_unavailable"
  | "appointment_not_found"
  | "confirmed_not_found"
  | "time_unavailable"
  | "invalid_service"
  | "service_not_found"
  | "duration_overlap"
  | "invalid_doctor"
  | "doctor_not_found"
  | "doctor_service_blocked"
  | "cancellation_policy_locked"
  | "cancellation_window"
  | "invalid_transition"
  | "already_paid"
  | "invoice_not_found"
  | "plan_not_found"
  | "already_approved"
  | "invalid_reference"
  | "request_failed"
  | "rate_limited";

export class ClinicError extends Error {
  readonly code: ClinicErrorCode;

  constructor(code: ClinicErrorCode) {
    super(code);
    this.name = "ClinicError";
    this.code = code;
  }
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ClinicError((body.error as ClinicErrorCode) ?? "request_failed");
  return body as T;
}

const listeners = new Set<Listener>();
const pendingBookings = new Map<string, Promise<Appointment>>();
const initialSnapshot: ClinicSnapshot = Object.freeze({
  appointments: [],
  services,
  doctors,
  accounts: demoAccounts,
  intakeForms: demoIntakeForms,
  treatmentPlans: demoTreatmentPlans,
  visitSummaries: demoVisitSummaries,
  invoices: demoInvoices,
  workingHours: [
    { dayOfWeek: 0, isClosed: false },
    { dayOfWeek: 1, isClosed: false },
    { dayOfWeek: 2, isClosed: false },
    { dayOfWeek: 3, isClosed: false },
    { dayOfWeek: 4, isClosed: false },
    { dayOfWeek: 5, isClosed: true },
    { dayOfWeek: 6, isClosed: false },
  ],
});
let snapshot = initialSnapshot;

function publish(next: ClinicSnapshot) {
  snapshot = Object.freeze(next);
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot() {
  return snapshot;
}

export function getServerSnapshot() {
  return initialSnapshot;
}

export async function hydrateClinicData(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const data = await api<{
      services?: Service[];
      doctors?: Doctor[];
      workingHours?: ClinicWorkingHoursDTO[];
    }>("/api/clinic");

    publish({
      ...snapshot,
      services:
        Array.isArray(data.services) && data.services.length > 0
          ? data.services
          : snapshot.services,
      doctors:
        Array.isArray(data.doctors) && data.doctors.length > 0
          ? data.doctors
          : snapshot.doctors,
      workingHours: Array.isArray(data.workingHours)
        ? data.workingHours
        : snapshot.workingHours,
    });
  } catch (err) {
    console.warn("Could not hydrate clinic catalog from API:", err);
  }
}

export async function hydrateAppointments(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const data = await api<{ appointments?: Appointment[] }>("/api/appointments");
    if (Array.isArray(data.appointments)) {
      publish({
        ...snapshot,
        appointments: data.appointments,
      });
    }
  } catch {
    // Silently keep current snapshot when unauthenticated or during initial session check
  }
}

export async function hydratePatientData(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || typeof window === "undefined") return;

  try {
    const [intakeRes, planRes, careRes, billingRes] = await Promise.allSettled([
      api<{ intakeForm?: PatientIntakeForm }>(
        `/api/patient/intake?email=${encodeURIComponent(cleanEmail)}`
      ),
      api<{ treatmentPlan?: TreatmentPlan }>(
        `/api/patient/treatment-plan?email=${encodeURIComponent(cleanEmail)}`
      ),
      api<{ careSummaries?: VisitCareSummary[] }>(
        `/api/patient/care?email=${encodeURIComponent(cleanEmail)}`
      ),
      api<{ invoices?: PatientInvoice[] }>(
        `/api/patient/billing?email=${encodeURIComponent(cleanEmail)}`
      ),
    ]);

    let nextForms = snapshot.intakeForms;
    let nextPlans = snapshot.treatmentPlans;
    let nextSummaries = snapshot.visitSummaries;
    let nextInvoices = snapshot.invoices;

    if (intakeRes.status === "fulfilled" && intakeRes.value.intakeForm) {
      nextForms = [
        ...nextForms.filter((f) => f.patientEmail.toLowerCase() !== cleanEmail),
        Object.freeze(intakeRes.value.intakeForm),
      ];
    }

    if (planRes.status === "fulfilled" && planRes.value.treatmentPlan) {
      nextPlans = [
        ...nextPlans.filter((p) => p.patientEmail.toLowerCase() !== cleanEmail),
        Object.freeze(planRes.value.treatmentPlan),
      ];
    }

    if (careRes.status === "fulfilled" && Array.isArray(careRes.value.careSummaries)) {
      nextSummaries = [
        ...nextSummaries.filter((s) => s.patientEmail.toLowerCase() !== cleanEmail),
        ...careRes.value.careSummaries.map((s) => Object.freeze(s)),
      ];
    }

    if (billingRes.status === "fulfilled" && Array.isArray(billingRes.value.invoices)) {
      nextInvoices = [
        ...nextInvoices.filter((i) => i.patientEmail.toLowerCase() !== cleanEmail),
        ...billingRes.value.invoices.map((i) => Object.freeze(i)),
      ];
    }

    publish({
      ...snapshot,
      intakeForms: nextForms,
      treatmentPlans: nextPlans,
      visitSummaries: nextSummaries,
      invoices: nextInvoices,
    });
  } catch (err) {
    console.warn("Could not hydrate patient workflows:", err);
  }
}

// Module-load auto-hydration: only /api/clinic (which is public)
if (typeof window !== "undefined") {
  hydrateClinicData().catch(() => {});
}

const toUtcDate = (date: Date) => date.toISOString().slice(0, 10);

export function getAvailableDates(serviceId: string, doctorId: string): string[] {
  const doctor = snapshot.doctors.find((item) => item.id === doctorId);
  if (
    !snapshot.services.some((item) => item.id === serviceId) ||
    !doctor?.serviceIds.includes(serviceId)
  )
    return [];

  const closedDays = new Set(
    snapshot.workingHours && snapshot.workingHours.length > 0
      ? snapshot.workingHours.filter((h) => h.isClosed).map((h) => h.dayOfWeek)
      : [5]
  );

  const dates: string[] = [];
  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);
  for (let offset = 1; offset <= 21 && dates.length < 10; offset += 1) {
    const day = new Date(cursor);
    day.setUTCDate(cursor.getUTCDate() + offset);
    if (!closedDays.has(day.getUTCDay())) dates.push(toUtcDate(day));
  }
  return dates;
}

const slotStarts = [
  "09:00",
  "09:45",
  "10:30",
  "11:15",
  "13:00",
  "13:45",
  "14:30",
  "15:15",
  "16:00",
];
const minutes = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

function availableSlots(
  serviceId: string,
  doctorId: string,
  date: string,
  excludeId?: string
): string[] {
  const service = snapshot.services.find((item) => item.id === serviceId);
  const doctor = snapshot.doctors.find((item) => item.id === doctorId);
  if (
    !service ||
    !doctor ||
    !doctor.serviceIds.includes(serviceId) ||
    !getAvailableDates(serviceId, doctorId).includes(date)
  )
    return [];

  const active = snapshot.appointments.filter(
    (item) =>
      item.id !== excludeId &&
      item.status === "confirmed" &&
      item.doctorId === doctorId &&
      item.date === date
  );

  const now = Date.now();

  return slotStarts.filter((time) => {
    const remaining = hoursUntil(date, time, now);
    if (remaining <= 0) return false;

    const start = minutes(time);
    const end = start + service.durationMinutes;
    return !active.some((item) => {
      const otherStart = minutes(item.time);
      const otherService = snapshot.services.find((candidate) => candidate.id === item.serviceId);
      const otherEnd = otherStart + (otherService?.durationMinutes ?? 45);
      return start < otherEnd && otherStart < end;
    });
  });
}

export function getAvailableSlots(serviceId: string, doctorId: string, date: string): string[] {
  return availableSlots(serviceId, doctorId, date);
}

export function getAvailableDatesForAnyDoctor(serviceId: string): string[] {
  const eligibleDoctors = snapshot.doctors.filter((doc) => doc.serviceIds.includes(serviceId));
  if (eligibleDoctors.length === 0) return [];
  const dateSet = new Set<string>();
  for (const doc of eligibleDoctors) {
    const dates = getAvailableDates(serviceId, doc.id);
    for (const d of dates) {
      dateSet.add(d);
    }
  }
  return Array.from(dateSet).sort();
}

export function getAvailableSlotsForAnyDoctor(
  serviceId: string,
  date: string
): { time: string; doctorId: string; doctorName: string }[] {
  const eligibleDoctors = snapshot.doctors.filter((doc) => doc.serviceIds.includes(serviceId));
  const results: { time: string; doctorId: string; doctorName: string }[] = [];
  for (const time of slotStarts) {
    for (const doc of eligibleDoctors) {
      const slots = availableSlots(serviceId, doc.id, date);
      if (slots.includes(time)) {
        results.push({ time, doctorId: doc.id, doctorName: doc.name });
        break;
      }
    }
  }
  return results;
}

function validateBooking(input: BookingDetails) {
  const service = snapshot.services.find((item) => item.id === input.serviceId);
  const doctor = snapshot.doctors.find((item) => item.id === input.doctorId);
  if (!service || !doctor || !doctor.serviceIds.includes(input.serviceId))
    throw new ClinicError("service_clinician_mismatch");
  if (!input.patientName.trim() || !/^\S+@\S+\.\S+$/.test(input.email) || !input.phone.trim())
    throw new ClinicError("invalid_contact");
  if (!getAvailableSlots(input.serviceId, input.doctorId, input.date).includes(input.time))
    throw new ClinicError("slot_unavailable");
}

export function bookAppointment(input: BookingDetails): Promise<Appointment> {
  const key = [
    input.serviceId,
    input.doctorId,
    input.date,
    input.time,
    input.patientName.trim(),
    input.email.trim().toLowerCase(),
    input.phone.trim(),
  ].join("|");
  const existing = pendingBookings.get(key);
  if (existing) return existing;

  const operation = (async () => {
    validateBooking(input);
    const data = await api<{ appointment: Appointment }>("/api/appointments", {
      method: "POST",
      body: JSON.stringify(input),
    });
    const appointment = data.appointment;
    publish({
      ...snapshot,
      appointments: [
        ...snapshot.appointments.filter((a) => a.id !== appointment.id),
        appointment,
      ],
    });
    return appointment;
  })().finally(() => pendingBookings.delete(key));

  pendingBookings.set(key, operation);
  return operation;
}

export async function cancelAppointment(id: string): Promise<void> {
  const appointment = snapshot.appointments.find((item) => item.id === id);
  if (!appointment) throw new ClinicError("appointment_not_found");
  if (appointment.status === "cancelled") return;

  const data = await api<{ appointment: Appointment }>(`/api/appointments/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ action: "cancel" }),
  });

  publish({
    ...snapshot,
    appointments: snapshot.appointments.map((item) =>
      item.id === id ? data.appointment : item
    ),
  });
}

export async function confirmAppointmentAttendance(id: string): Promise<Appointment> {
  const appointment = snapshot.appointments.find((item) => item.id === id);
  if (!appointment) throw new ClinicError("appointment_not_found");

  const data = await api<{ appointment: Appointment }>(`/api/appointments/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ action: "confirm_attendance" }),
  });

  publish({
    ...snapshot,
    appointments: snapshot.appointments.map((item) =>
      item.id === id ? data.appointment : item
    ),
  });
  return data.appointment;
}

export async function markAppointmentCalendarSynced(
  id: string,
  googleEventId?: string
): Promise<Appointment> {
  const appointment = snapshot.appointments.find((item) => item.id === id);
  if (!appointment) throw new ClinicError("appointment_not_found");
  const updated: Appointment = {
    ...appointment,
    calendarSynced: true,
    ...(googleEventId ? { googleEventId } : {}),
  };
  publish({
    ...snapshot,
    appointments: snapshot.appointments.map((item) => (item.id === id ? updated : item)),
  });
  return updated;
}

export function canCancelAppointment(
  appointment: Pick<Appointment, "date" | "time">,
  now?: Date
): { allowed: boolean; hoursRemaining: number } {
  const remaining = hoursUntil(appointment.date, appointment.time, now?.getTime());
  const hoursRemaining = Math.max(0, Math.floor(remaining));
  const allowed = remaining >= CANCEL_WINDOW_HOURS;
  return { allowed, hoursRemaining };
}

export async function rescheduleAppointment(
  id: string,
  date: string,
  time: string
): Promise<Appointment> {
  const appointment = snapshot.appointments.find(
    (item) => item.id === id && item.status === "confirmed"
  );
  if (!appointment) throw new ClinicError("confirmed_not_found");
  if (!availableSlots(appointment.serviceId, appointment.doctorId, date, id).includes(time))
    throw new ClinicError("time_unavailable");

  const data = await api<{ appointment: Appointment }>(`/api/appointments/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ action: "reschedule", date, time }),
  });

  publish({
    ...snapshot,
    appointments: snapshot.appointments.map((item) =>
      item.id === id ? data.appointment : item
    ),
  });
  return data.appointment;
}

export async function updateService(service: Service): Promise<Service> {
  if (
    !service.id ||
    !service.title.trim() ||
    !service.description.trim() ||
    !Number.isInteger(service.durationMinutes) ||
    service.durationMinutes < 15 ||
    service.durationMinutes > 180
  )
    throw new ClinicError("invalid_service");
  if (!snapshot.services.some((item) => item.id === service.id))
    throw new ClinicError("service_not_found");

  const previous = snapshot.services.find((item) => item.id === service.id);
  if (previous && previous.durationMinutes !== service.durationMinutes) {
    for (const appointment of snapshot.appointments) {
      if (appointment.status !== "confirmed" || appointment.serviceId !== service.id) continue;
      const start = minutes(appointment.time);
      const conflict = snapshot.appointments.some((other) => {
        if (
          other.status !== "confirmed" ||
          other.serviceId !== service.id ||
          other.doctorId !== appointment.doctorId ||
          other.date !== appointment.date ||
          other.id === appointment.id
        )
          return false;
        const otherStart = minutes(other.time);
        return otherStart >= start && otherStart < start + service.durationMinutes;
      });
      const externalConflict = snapshot.appointments.some((other) => {
        if (
          other.status !== "confirmed" ||
          other.serviceId === service.id ||
          other.doctorId !== appointment.doctorId ||
          other.date !== appointment.date ||
          other.id === appointment.id
        )
          return false;
        const otherStart = minutes(other.time);
        const otherService = snapshot.services.find((item) => item.id === other.serviceId);
        return (
          start < otherStart + (otherService?.durationMinutes ?? 45) &&
          otherStart < start + service.durationMinutes
        );
      });
      if (conflict || externalConflict) throw new ClinicError("duration_overlap");
    }
  }

  const data = await api<{ service: Service }>(`/api/admin/services/${service.id}`, {
    method: "PATCH",
    body: JSON.stringify(service),
  });

  publish({
    ...snapshot,
    services: snapshot.services.map((item) => (item.id === service.id ? data.service : item)),
  });
  return data.service;
}

export async function updateDoctor(doctor: Doctor): Promise<Doctor> {
  if (
    !doctor.id ||
    !doctor.name.trim() ||
    !doctor.specialty.trim() ||
    !doctor.bio.trim() ||
    !doctor.serviceIds.length ||
    doctor.serviceIds.some((id) => !snapshot.services.some((service) => service.id === id))
  )
    throw new ClinicError("invalid_doctor");
  if (!snapshot.doctors.some((item) => item.id === doctor.id))
    throw new ClinicError("doctor_not_found");
  if (
    snapshot.appointments.some(
      (item) =>
        item.status === "confirmed" &&
        item.doctorId === doctor.id &&
        !doctor.serviceIds.includes(item.serviceId)
    )
  ) {
    throw new ClinicError("doctor_service_blocked");
  }

  const data = await api<{ doctor: Doctor }>(`/api/admin/doctors/${doctor.id}`, {
    method: "PATCH",
    body: JSON.stringify(doctor),
  });

  publish({
    ...snapshot,
    doctors: snapshot.doctors.map((item) => (item.id === doctor.id ? data.doctor : item)),
  });
  return data.doctor;
}

export async function createService(
  serviceInput: Omit<Service, "id"> & { id?: string }
): Promise<Service> {
  const title = serviceInput.title.trim();
  const description = serviceInput.description.trim();
  const durationMinutes = Number(serviceInput.durationMinutes);
  const category = serviceInput.category?.trim() || "Preventive Care";
  const image =
    serviceInput.image ||
    "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80";
  if (
    !title ||
    !description ||
    !Number.isInteger(durationMinutes) ||
    durationMinutes < 15 ||
    durationMinutes > 180
  ) {
    throw new ClinicError("invalid_service");
  }
  const id = serviceInput.id?.trim() || `service-${Date.now()}`;
  const servicePayload = {
    id,
    title,
    description,
    durationMinutes,
    category,
    image,
    extendedDetails: serviceInput.extendedDetails || {
      overview: description,
      procedure:
        "Comprehensive diagnostic assessment and clinical care plan performed by specialized clinicians.",
      benefits:
        "High precision dental care, transparent treatment phases, and lasting oral health.",
      aftercare: "Follow routine hygiene and dentist recommendations.",
    },
  };

  const data = await api<{ service: Service }>("/api/admin/services", {
    method: "POST",
    body: JSON.stringify(servicePayload),
  });

  publish({ ...snapshot, services: [...snapshot.services, Object.freeze(data.service)] });
  return data.service;
}

export async function createAccount(
  accountInput: Omit<Account, "id" | "createdAt"> & { id?: string; createdAt?: string }
): Promise<Account> {
  const name = accountInput.name.trim();
  const email = accountInput.email.trim().toLowerCase();
  const phone = accountInput.phone.trim();
  if (!name || !email) throw new ClinicError("invalid_contact");

  const payload = {
    name,
    email,
    phone,
    role: accountInput.role,
    status: accountInput.status,
    specialty: accountInput.specialty?.trim(),
    bio: accountInput.bio?.trim(),
    serviceIds: accountInput.serviceIds,
  };

  const data = await api<{ account: Account }>("/api/admin/accounts", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const createdAccount = data.account;

  if (createdAccount.role === "doctor") {
    hydrateClinicData().catch(() => {});
  }

  publish({
    ...snapshot,
    accounts: [...snapshot.accounts, Object.freeze(createdAccount)],
  });
  return createdAccount;
}

export async function savePatientIntakeForm(
  input: PatientIntakeForm
): Promise<PatientIntakeForm> {
  const data = await api<{ intakeForm: PatientIntakeForm }>("/api/patient/intake", {
    method: "PUT",
    body: JSON.stringify(input),
  });

  const updatedForm = data.intakeForm;
  const targetEmail = updatedForm.patientEmail.toLowerCase();
  const exists = snapshot.intakeForms.some(
    (f) => f.patientEmail.toLowerCase() === targetEmail
  );
  const nextForms = exists
    ? snapshot.intakeForms.map((f) =>
        f.patientEmail.toLowerCase() === targetEmail ? updatedForm : f
      )
    : [...snapshot.intakeForms, Object.freeze(updatedForm)];
  publish({ ...snapshot, intakeForms: nextForms });
  return updatedForm;
}

export async function approveTreatmentPlan(
  planId: string,
  signedByName: string,
  signatureDataUrl: string,
  patientEmail?: string
): Promise<TreatmentPlan> {
  const existing = snapshot.treatmentPlans.find((p) => p.id === planId);
  const targetEmail =
    existing?.patientEmail || patientEmail?.trim().toLowerCase() || "";

  const data = await api<{ treatmentPlan: TreatmentPlan }>("/api/patient/treatment-plan", {
    method: "POST",
    body: JSON.stringify({
      email: targetEmail,
      action: "approve",
      signatureDataUrl,
      signedByName,
    }),
  });

  const updated = data.treatmentPlan;
  const nextPlans = snapshot.treatmentPlans.some((p) => p.id === updated.id)
    ? snapshot.treatmentPlans.map((p) => (p.id === updated.id ? Object.freeze(updated) : p))
    : [...snapshot.treatmentPlans, Object.freeze(updated)];
  publish({
    ...snapshot,
    treatmentPlans: nextPlans,
  });
  return updated;
}

export async function linkPhaseAppointment(
  planId: string,
  phaseId: string,
  appointmentId: string,
  patientEmail?: string
): Promise<TreatmentPlan> {
  const existing = snapshot.treatmentPlans.find((p) => p.id === planId);
  const fallbackEmail =
    patientEmail?.trim().toLowerCase() ||
    (planId.startsWith("plan-default-") ? planId.replace("plan-default-", "") : "");
  const plan = existing ?? (fallbackEmail ? createDefaultTreatmentPlan(fallbackEmail) : undefined);
  if (!plan) throw new ClinicError("plan_not_found");
  const updated: TreatmentPlan = {
    ...plan,
    phases: plan.phases.map((phase) =>
      phase.id === phaseId
        ? Object.freeze({ ...phase, scheduledAppointmentId: appointmentId })
        : phase
    ),
  };
  const nextPlans = existing
    ? snapshot.treatmentPlans.map((p) => (p.id === planId ? Object.freeze(updated) : p))
    : [...snapshot.treatmentPlans, Object.freeze(updated)];
  publish({
    ...snapshot,
    treatmentPlans: nextPlans,
  });
  return updated;
}

export async function payPatientInvoice(
  invoiceId: string,
  paymentMethod: "card" | "apple_pay" | "google_pay" | "mobile_wallet",
  patientEmail?: string
): Promise<PatientInvoice> {
  const data = await api<{ invoice: PatientInvoice }>("/api/patient/billing", {
    method: "POST",
    body: JSON.stringify({ invoiceId, paymentMethod, email: patientEmail }),
  });

  const updated = data.invoice;
  const nextInvoices = snapshot.invoices.some((inv) => inv.id === invoiceId)
    ? snapshot.invoices.map((inv) => (inv.id === invoiceId ? Object.freeze(updated) : inv))
    : [...snapshot.invoices, Object.freeze(updated)];
  publish({
    ...snapshot,
    invoices: nextInvoices,
  });
  return updated;
}

export async function ensurePatientDemoAppointment(
  email: string,
  patientName?: string,
  phone?: string
): Promise<void> {
  void email;
  void patientName;
  void phone;
}

export function getPatientIntakeForm(email: string): PatientIntakeForm {
  const clean = email.trim().toLowerCase();
  const found = snapshot.intakeForms.find((f) => f.patientEmail.toLowerCase() === clean);
  return found ?? createDefaultIntakeForm(clean);
}

export function getPatientTreatmentPlan(email: string): TreatmentPlan {
  const clean = email.trim().toLowerCase();
  const found = snapshot.treatmentPlans.find((p) => p.patientEmail.toLowerCase() === clean);
  return found ?? createDefaultTreatmentPlan(clean);
}

export function getPatientVisitSummaries(email: string): readonly VisitCareSummary[] {
  const clean = email.trim().toLowerCase();
  const found = snapshot.visitSummaries.filter((s) => s.patientEmail.toLowerCase() === clean);
  return found.length > 0 ? found : [createDefaultVisitSummary(clean)];
}

export function getPatientInvoices(email: string): readonly PatientInvoice[] {
  const clean = email.trim().toLowerCase();
  const found = snapshot.invoices.filter((inv) => inv.patientEmail.toLowerCase() === clean);
  return found.length > 0 ? found : [createDefaultInvoice(clean)];
}

export function getLastCleaningDate(email: string): string {
  const clean = email.trim().toLowerCase();
  return lastCleaningDateByEmail[clean] || "2026-04-15";
}

export function resetDemo() {
  pendingBookings.clear();
  publish(initialSnapshot);
}
