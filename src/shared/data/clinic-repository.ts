import { demoAccounts, doctors, services, type Account, type Appointment, type BookingDetails, type Doctor, type Service } from "@/shared/data/mock/catalog";

type Listener = () => void;
type ClinicSnapshot = Readonly<{ appointments: readonly Appointment[]; services: readonly Service[]; doctors: readonly Doctor[]; accounts: readonly Account[] }>;

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
  | "doctor_service_blocked";

// Codes let the interface present each failure in the active language.
export class ClinicError extends Error {
  readonly code: ClinicErrorCode;

  constructor(code: ClinicErrorCode) {
    super(code);
    this.name = "ClinicError";
    this.code = code;
  }
}

const listeners = new Set<Listener>();
const pendingBookings = new Map<string, Promise<Appointment>>();
const initialSnapshot: ClinicSnapshot = Object.freeze({ appointments: [], services, doctors, accounts: demoAccounts });
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

const toUtcDate = (date: Date) => date.toISOString().slice(0, 10);

export function getAvailableDates(serviceId: string, doctorId: string): string[] {
  const doctor = snapshot.doctors.find((item) => item.id === doctorId);
  if (!snapshot.services.some((item) => item.id === serviceId) || !doctor?.serviceIds.includes(serviceId)) return [];
  const dates: string[] = [];
  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);
  for (let offset = 1; offset <= 21 && dates.length < 10; offset += 1) {
    const day = new Date(cursor);
    day.setUTCDate(cursor.getUTCDate() + offset);
    if (day.getUTCDay() !== 5) dates.push(toUtcDate(day));
  }
  return dates;
}

const slotStarts = ["09:00", "09:45", "10:30", "11:15", "13:00", "13:45", "14:30", "15:15", "16:00"];
const minutes = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

function availableSlots(serviceId: string, doctorId: string, date: string, excludeId?: string): string[] {
  const service = snapshot.services.find((item) => item.id === serviceId);
  const doctor = snapshot.doctors.find((item) => item.id === doctorId);
  if (!service || !doctor || !doctor.serviceIds.includes(serviceId) || !getAvailableDates(serviceId, doctorId).includes(date)) return [];
  const active = snapshot.appointments.filter((item) => item.id !== excludeId && item.status === "confirmed" && item.doctorId === doctorId && item.date === date);
  return slotStarts.filter((time) => {
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

function validateBooking(input: BookingDetails) {
  const service = snapshot.services.find((item) => item.id === input.serviceId);
  const doctor = snapshot.doctors.find((item) => item.id === input.doctorId);
  if (!service || !doctor || !doctor.serviceIds.includes(input.serviceId)) throw new ClinicError("service_clinician_mismatch");
  if (!input.patientName.trim() || !/^\S+@\S+\.\S+$/.test(input.email) || !input.phone.trim()) throw new ClinicError("invalid_contact");
  if (!getAvailableSlots(input.serviceId, input.doctorId, input.date).includes(input.time)) throw new ClinicError("slot_unavailable");
}

export function bookAppointment(input: BookingDetails): Promise<Appointment> {
  const key = [input.serviceId, input.doctorId, input.date, input.time, input.patientName.trim(), input.email.trim().toLowerCase(), input.phone.trim()].join("|");
  const existing = pendingBookings.get(key);
  if (existing) return existing;
  const operation = Promise.resolve().then(() => {
    validateBooking(input);
    const appointment: Appointment = { ...input, patientName: input.patientName.trim(), email: input.email.trim(), phone: input.phone.trim(), id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, status: "confirmed" };
    publish({ ...snapshot, appointments: [...snapshot.appointments, appointment] });
    return appointment;
  }).finally(() => pendingBookings.delete(key));
  pendingBookings.set(key, operation);
  return operation;
}

export async function cancelAppointment(id: string): Promise<void> {
  const appointment = snapshot.appointments.find((item) => item.id === id);
  if (!appointment) throw new ClinicError("appointment_not_found");
  if (appointment.status === "cancelled") return;
  publish({ ...snapshot, appointments: snapshot.appointments.map((item) => item.id === id ? { ...item, status: "cancelled" } : item) });
}

export async function rescheduleAppointment(id: string, date: string, time: string): Promise<Appointment> {
  const appointment = snapshot.appointments.find((item) => item.id === id && item.status === "confirmed");
  if (!appointment) throw new ClinicError("confirmed_not_found");
  if (!availableSlots(appointment.serviceId, appointment.doctorId, date, id).includes(time)) throw new ClinicError("time_unavailable");
  const updated = { ...appointment, date, time };
  publish({ ...snapshot, appointments: snapshot.appointments.map((item) => item.id === id ? updated : item) });
  return updated;
}

export async function updateService(service: Service): Promise<Service> {
  if (!service.id || !service.title.trim() || !service.description.trim() || !Number.isInteger(service.durationMinutes) || service.durationMinutes < 15 || service.durationMinutes > 180) throw new ClinicError("invalid_service");
  if (!snapshot.services.some((item) => item.id === service.id)) throw new ClinicError("service_not_found");
  if (snapshot.services.find((item) => item.id === service.id)?.durationMinutes !== service.durationMinutes) {
    const affected = snapshot.appointments.filter((item) => item.status === "confirmed" && item.serviceId === service.id);
    for (let index = 0; index < affected.length; index += 1) {
      const appointment = affected[index];
      const start = minutes(appointment.time);
      const conflict = affected.slice(index + 1).some((other) => {
        if (other.doctorId !== appointment.doctorId || other.date !== appointment.date) return false;
        const otherStart = minutes(other.time);
        return start < otherStart + service.durationMinutes && otherStart < start + service.durationMinutes;
      });
      const externalConflict = snapshot.appointments.some((other) => {
        if (other.status !== "confirmed" || other.serviceId === service.id || other.doctorId !== appointment.doctorId || other.date !== appointment.date || other.id === appointment.id) return false;
        const otherStart = minutes(other.time);
        const otherService = snapshot.services.find((item) => item.id === other.serviceId);
        return start < otherStart + (otherService?.durationMinutes ?? 45) && otherStart < start + service.durationMinutes;
      });
      if (conflict || externalConflict) throw new ClinicError("duration_overlap");
    }
  }
  publish({
    ...snapshot,
    services: snapshot.services.map((item) =>
      item.id === service.id
        ? {
            ...service,
            title: service.title.trim(),
            description: service.description.trim(),
            category: service.category?.trim() || item.category || "Preventive Care",
            image: service.image || item.image || "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
            extendedDetails: service.extendedDetails ?? item.extendedDetails,
          }
        : item
    ),
  });
  return service;
}

export async function updateDoctor(doctor: Doctor): Promise<Doctor> {
  if (!doctor.id || !doctor.name.trim() || !doctor.specialty.trim() || !doctor.bio.trim() || !doctor.serviceIds.length || doctor.serviceIds.some((id) => !snapshot.services.some((service) => service.id === id))) throw new ClinicError("invalid_doctor");
  if (!snapshot.doctors.some((item) => item.id === doctor.id)) throw new ClinicError("doctor_not_found");
  if (snapshot.appointments.some((item) => item.status === "confirmed" && item.doctorId === doctor.id && !doctor.serviceIds.includes(item.serviceId))) throw new ClinicError("doctor_service_blocked");
  publish({ ...snapshot, doctors: snapshot.doctors.map((item) => item.id === doctor.id ? { ...doctor, name: doctor.name.trim(), specialty: doctor.specialty.trim(), bio: doctor.bio.trim() } : item) });
  return doctor;
}

export async function createService(serviceInput: Omit<Service, "id"> & { id?: string }): Promise<Service> {
  const title = serviceInput.title.trim();
  const description = serviceInput.description.trim();
  const durationMinutes = Number(serviceInput.durationMinutes);
  const category = serviceInput.category?.trim() || "Preventive Care";
  const image = serviceInput.image || "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80";
  if (!title || !description || !Number.isInteger(durationMinutes) || durationMinutes < 15 || durationMinutes > 180) {
    throw new ClinicError("invalid_service");
  }
  const id = serviceInput.id?.trim() || `service-${Date.now()}`;
  const service: Service = {
    id,
    title,
    description,
    durationMinutes,
    category,
    image,
    extendedDetails: serviceInput.extendedDetails || {
      overview: description,
      procedure: "Comprehensive diagnostic assessment and clinical care plan performed by specialized clinicians.",
      benefits: "High precision dental care, transparent treatment phases, and lasting oral health.",
      aftercare: "Follow routine hygiene and dentist recommendations.",
    },
  };
  publish({ ...snapshot, services: [...snapshot.services, Object.freeze(service)] });
  return service;
}

export async function createAccount(accountInput: Omit<Account, "id" | "createdAt"> & { id?: string; createdAt?: string }): Promise<Account> {
  const name = accountInput.name.trim();
  const email = accountInput.email.trim().toLowerCase();
  const phone = accountInput.phone.trim();
  if (!name || !email) throw new ClinicError("invalid_contact");
  const id = accountInput.id?.trim() || `account-${Date.now()}`;
  const createdAt = accountInput.createdAt || new Date().toISOString().slice(0, 10);
  const account: Account = {
    id,
    name,
    email,
    phone,
    role: accountInput.role,
    status: accountInput.status,
    specialty: accountInput.specialty?.trim(),
    bio: accountInput.bio?.trim(),
    serviceIds: accountInput.serviceIds,
    createdAt,
  };
  let nextDoctors = snapshot.doctors;
  if (account.role === "doctor") {
    const docId = `doctor-${Date.now()}`;
    const newDoctor: Doctor = {
      id: docId,
      name,
      specialty: account.specialty || "General Dentistry",
      bio: account.bio || "",
      serviceIds: account.serviceIds || [],
    };
    nextDoctors = [...snapshot.doctors, Object.freeze(newDoctor)];
  }
  publish({ ...snapshot, accounts: [...snapshot.accounts, Object.freeze(account)], doctors: nextDoctors });
  return account;
}

export function resetDemo() {
  pendingBookings.clear();
  publish(initialSnapshot);
}

