import { doctors, services, type Appointment, type BookingDetails, type Doctor, type Service } from "@/shared/data/mock/catalog";

type Listener = () => void;
type ClinicSnapshot = Readonly<{ appointments: readonly Appointment[]; services: readonly Service[]; doctors: readonly Doctor[] }>;

const listeners = new Set<Listener>();
const pendingBookings = new Map<string, Promise<Appointment>>();
const initialSnapshot: ClinicSnapshot = Object.freeze({ appointments: [], services, doctors });
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
  if (!service || !doctor || !doctor.serviceIds.includes(input.serviceId)) throw new Error("Choose an available service and clinician.");
  if (!input.patientName.trim() || !/^\S+@\S+\.\S+$/.test(input.email) || !input.phone.trim()) throw new Error("Enter your name, a valid email, and phone number.");
  if (!getAvailableSlots(input.serviceId, input.doctorId, input.date).includes(input.time)) throw new Error("That time is no longer available. Choose another slot.");
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
  if (!appointment) throw new Error("Appointment not found.");
  if (appointment.status === "cancelled") return;
  publish({ ...snapshot, appointments: snapshot.appointments.map((item) => item.id === id ? { ...item, status: "cancelled" } : item) });
}

export async function rescheduleAppointment(id: string, date: string, time: string): Promise<Appointment> {
  const appointment = snapshot.appointments.find((item) => item.id === id && item.status === "confirmed");
  if (!appointment) throw new Error("Confirmed appointment not found.");
  if (!availableSlots(appointment.serviceId, appointment.doctorId, date, id).includes(time)) throw new Error("That time is not available.");
  const updated = { ...appointment, date, time };
  publish({ ...snapshot, appointments: snapshot.appointments.map((item) => item.id === id ? updated : item) });
  return updated;
}

export async function updateService(service: Service): Promise<Service> {
  if (!service.id || !service.title.trim() || !service.description.trim() || !Number.isInteger(service.durationMinutes) || service.durationMinutes < 15 || service.durationMinutes > 180) throw new Error("Enter a title, description, and whole-number duration from 15 to 180 minutes.");
  if (!snapshot.services.some((item) => item.id === service.id)) throw new Error("Service not found.");
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
      if (conflict || externalConflict) throw new Error("Duration cannot change because it would overlap a confirmed appointment.");
    }
  }
  publish({ ...snapshot, services: snapshot.services.map((item) => item.id === service.id ? { ...service, title: service.title.trim(), description: service.description.trim() } : item) });
  return service;
}

export async function updateDoctor(doctor: Doctor): Promise<Doctor> {
  if (!doctor.id || !doctor.name.trim() || !doctor.specialty.trim() || !doctor.bio.trim() || !doctor.serviceIds.length || doctor.serviceIds.some((id) => !snapshot.services.some((service) => service.id === id))) throw new Error("Enter clinician details and choose at least one valid service.");
  if (!snapshot.doctors.some((item) => item.id === doctor.id)) throw new Error("Clinician not found.");
  if (snapshot.appointments.some((item) => item.status === "confirmed" && item.doctorId === doctor.id && !doctor.serviceIds.includes(item.serviceId))) throw new Error("This clinician has confirmed appointments for a service you are removing.");
  publish({ ...snapshot, doctors: snapshot.doctors.map((item) => item.id === doctor.id ? { ...doctor, name: doctor.name.trim(), specialty: doctor.specialty.trim(), bio: doctor.bio.trim() } : item) });
  return doctor;
}

export function resetDemo() {
  pendingBookings.clear();
  publish(initialSnapshot);
}
