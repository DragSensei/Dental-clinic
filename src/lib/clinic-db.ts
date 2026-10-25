import prisma from "@/lib/prisma";

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
  | "cancellation_policy_locked";

export class ClinicError extends Error {
  readonly code: ClinicErrorCode;

  constructor(code: ClinicErrorCode) {
    super(code);
    this.name = "ClinicError";
    this.code = code;
  }
}

const slotStarts = ["09:00", "09:45", "10:30", "11:15", "13:00", "13:45", "14:30", "15:15", "16:00"];

export const minutes = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

const toUtcDate = (date: Date) => date.toISOString().slice(0, 10);

// 1. Health check
export async function checkDatabaseHealth() {
  try {
    const serviceCount = await prisma.service.count();
    return { status: "healthy", database: "connected", serviceCount };
  } catch (err) {
    console.error("Database health check error:", err);
    return { status: "unhealthy", database: "disconnected" };
  }
}

// 2. Working hours & Catalog
export async function getClinicWorkingHours() {
  return await prisma.clinicWorkingHours.findMany({
    take: 7,
    orderBy: { dayOfWeek: "asc" },
  });
}

export async function updateClinicWorkingHours(
  items: Array<{ dayOfWeek: number; isClosed: boolean; startTime: string; endTime: string; slotIntervalMinutes?: number }>
) {
  return await prisma.$transaction(
    items.map((item) =>
      prisma.clinicWorkingHours.upsert({
        where: { dayOfWeek: item.dayOfWeek },
        update: {
          isClosed: item.isClosed,
          startTime: item.startTime,
          endTime: item.endTime,
          slotIntervalMinutes: item.slotIntervalMinutes ?? 45,
        },
        create: {
          dayOfWeek: item.dayOfWeek,
          isClosed: item.isClosed,
          startTime: item.startTime,
          endTime: item.endTime,
          slotIntervalMinutes: item.slotIntervalMinutes ?? 45,
        },
      })
    )
  );
}

export async function getServices() {
  return await prisma.service.findMany({
    take: 100,
    orderBy: { createdAt: "asc" },
  });
}

export async function createService(input: {
  id?: string;
  title: string;
  description: string;
  durationMinutes: number;
  category: string;
  image: string;
  overview?: string;
  procedure?: string;
  benefits?: string;
  aftercare?: string;
}) {
  const title = input.title.trim();
  const description = input.description.trim();
  const durationMinutes = Number(input.durationMinutes);
  if (!title || !description || !Number.isInteger(durationMinutes) || durationMinutes < 15 || durationMinutes > 180) {
    throw new ClinicError("invalid_service");
  }
  return await prisma.service.create({
    data: {
      id: input.id?.trim() || undefined,
      title,
      description,
      durationMinutes,
      category: input.category.trim() || "Preventive Care",
      image: input.image.trim(),
      overview: input.overview,
      procedure: input.procedure,
      benefits: input.benefits,
      aftercare: input.aftercare,
    },
  });
}

export async function updateService(
  id: string,
  input: {
    title: string;
    description: string;
    durationMinutes: number;
    category?: string;
    image?: string;
    overview?: string;
    procedure?: string;
    benefits?: string;
    aftercare?: string;
  }
) {
  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) throw new ClinicError("service_not_found");
  if (
    !input.title.trim() ||
    !input.description.trim() ||
    !Number.isInteger(input.durationMinutes) ||
    input.durationMinutes < 15 ||
    input.durationMinutes > 180
  ) {
    throw new ClinicError("invalid_service");
  }

  // Duration overlap check with existing active appointments
  if (existing.durationMinutes !== input.durationMinutes) {
    const affected = await prisma.appointment.findMany({
      where: { serviceId: id, status: "confirmed" },
      include: { service: true },
      take: 100,
    });
    if (affected.length > 0) {
      const doctorIds = [...new Set(affected.map((a) => a.doctorId))];
      const dates = [...new Set(affected.map((a) => a.date))];
      const allDoctorAppointments = await prisma.appointment.findMany({
        where: {
          doctorId: { in: doctorIds },
          date: { in: dates },
          status: "confirmed",
        },
        include: { service: true },
        take: 500,
      });

      for (const app of affected) {
        const start = minutes(app.time);
        const end = start + input.durationMinutes;
        const otherApps = allDoctorAppointments.filter(
          (o) => o.id !== app.id && o.doctorId === app.doctorId && o.date === app.date
        );
        const conflict = otherApps.some((other) => {
          const otherStart = minutes(other.time);
          const otherDuration = other.serviceId === id ? input.durationMinutes : other.service.durationMinutes;
          const otherEnd = otherStart + otherDuration;
          return start < otherEnd && otherStart < end;
        });
        if (conflict) throw new ClinicError("duration_overlap");
      }
    }
  }

  return await prisma.service.update({
    where: { id },
    data: {
      title: input.title.trim(),
      description: input.description.trim(),
      durationMinutes: input.durationMinutes,
      category: input.category?.trim() || existing.category,
      image: input.image?.trim() || existing.image,
      overview: input.overview ?? existing.overview,
      procedure: input.procedure ?? existing.procedure,
      benefits: input.benefits ?? existing.benefits,
      aftercare: input.aftercare ?? existing.aftercare,
    },
  });
}

export async function getDoctors() {
  const doctors = await prisma.doctor.findMany({
    include: {
      services: { select: { serviceId: true } },
      workingHours: true,
    },
    take: 100,
    orderBy: { createdAt: "asc" },
  });
  return doctors.map((d) => ({
    id: d.id,
    name: d.name,
    specialty: d.specialty,
    bio: d.bio,
    status: d.status,
    userId: d.userId,
    serviceIds: d.services.map((s) => s.serviceId),
    workingHours: d.workingHours,
  }));
}

export async function updateDoctor(
  id: string,
  input: {
    name: string;
    specialty: string;
    bio: string;
    serviceIds: string[];
    status?: string;
  }
) {
  const existing = await prisma.doctor.findUnique({
    where: { id },
    include: { services: true },
  });
  if (!existing) throw new ClinicError("doctor_not_found");

  const services = await prisma.service.findMany({
    where: { id: { in: input.serviceIds } },
    take: 100,
  });
  if (services.length !== input.serviceIds.length) {
    throw new ClinicError("invalid_doctor");
  }

  // Active appointment guard: doctor cannot remove a service for which they have confirmed future appointments
  const activeBlocked = await prisma.appointment.findFirst({
    where: {
      doctorId: id,
      status: "confirmed",
      serviceId: { notIn: input.serviceIds },
    },
  });
  if (activeBlocked) {
    throw new ClinicError("doctor_service_blocked");
  }

  return await prisma.$transaction(async (tx) => {
    await tx.doctorService.deleteMany({ where: { doctorId: id } });
    await tx.doctorService.createMany({
      data: input.serviceIds.map((serviceId) => ({ doctorId: id, serviceId })),
    });
    return await tx.doctor.update({
      where: { id },
      data: {
        name: input.name.trim(),
        specialty: input.specialty.trim(),
        bio: input.bio.trim(),
        status: input.status || existing.status,
      },
      include: { services: true },
    });
  });
}

// 3. Availability & Scheduling Engine
export async function getAvailableDates(serviceId: string, doctorId: string): Promise<string[]> {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: { services: true, workingHours: true },
  });
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !doctor || !doctor.services.some((s) => s.serviceId === serviceId)) return [];

  const clinicHours = await prisma.clinicWorkingHours.findMany({ take: 7 });
  const closedDays = new Set(clinicHours.filter((h) => h.isClosed).map((h) => h.dayOfWeek));
  // Default Friday closed if no records
  if (clinicHours.length === 0) closedDays.add(5);

  const dates: string[] = [];
  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);

  for (let offset = 1; offset <= 21 && dates.length < 10; offset += 1) {
    const day = new Date(cursor);
    day.setUTCDate(cursor.getUTCDate() + offset);
    const dayOfWeek = day.getUTCDay();

    // Check clinic and doctor day off
    if (closedDays.has(dayOfWeek)) continue;
    const docDay = doctor.workingHours.find((h) => h.dayOfWeek === dayOfWeek);
    if (docDay?.isOff) continue;

    dates.push(toUtcDate(day));
  }
  return dates;
}

export async function getAvailableSlots(serviceId: string, doctorId: string, date: string, excludeId?: string): Promise<string[]> {
  const dates = await getAvailableDates(serviceId, doctorId);
  if (!dates.includes(date)) return [];

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return [];

  const active = await prisma.appointment.findMany({
    where: {
      doctorId,
      date,
      status: "confirmed",
      id: excludeId ? { not: excludeId } : undefined,
    },
    include: { service: true },
    take: 100,
  });

  return slotStarts.filter((time) => {
    const start = minutes(time);
    const end = start + service.durationMinutes;
    return !active.some((item) => {
      const otherStart = minutes(item.time);
      const otherEnd = otherStart + item.service.durationMinutes;
      return start < otherEnd && otherStart < end;
    });
  });
}

// 4. Appointment Booking, Cancellation & Rescheduling
export async function bookAppointment(input: {
  serviceId: string;
  doctorId: string;
  date: string;
  time: string;
  patientName: string;
  email: string;
  phone: string;
  note?: string;
  reasonCategory?: string;
}) {
  const patientName = input.patientName.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();
  if (!patientName || !/^\S+@\S+\.\S+$/.test(email) || !phone) {
    throw new ClinicError("invalid_contact");
  }

  return await prisma.$transaction(async (tx) => {
    const doctor = await tx.doctor.findUnique({
      where: { id: input.doctorId },
      include: { services: true },
    });
    const service = await tx.service.findUnique({
      where: { id: input.serviceId },
    });
    if (!service || !doctor || !doctor.services.some((s) => s.serviceId === input.serviceId)) {
      throw new ClinicError("service_clinician_mismatch");
    }

    // Check availability inside transaction
    const active = await tx.appointment.findMany({
      where: {
        doctorId: input.doctorId,
        date: input.date,
        status: "confirmed",
      },
      include: { service: true },
      take: 100,
    });

    const start = minutes(input.time);
    const end = start + service.durationMinutes;
    const hasConflict = active.some((item) => {
      const otherStart = minutes(item.time);
      const otherEnd = otherStart + item.service.durationMinutes;
      return start < otherEnd && otherStart < end;
    });
    if (hasConflict) throw new ClinicError("slot_unavailable");

    return await tx.appointment.create({
      data: {
        serviceId: input.serviceId,
        doctorId: input.doctorId,
        date: input.date,
        time: input.time,
        durationMinutes: service.durationMinutes,
        patientName,
        email,
        phone,
        note: input.note?.trim(),
        reasonCategory: input.reasonCategory,
        status: "confirmed",
      },
      include: { service: true, doctor: true },
    });
  });
}

export function canCancelAppointment(dateStr: string, timeStr: string): { allowed: boolean; hoursRemaining: number } {
  try {
    const appointmentDateTime = new Date(`${dateStr}T${timeStr}:00`);
    const now = new Date();
    const diffMs = appointmentDateTime.getTime() - now.getTime();
    const hoursRemaining = Math.round(diffMs / (1000 * 60 * 60));
    return {
      allowed: hoursRemaining >= 24,
      hoursRemaining,
    };
  } catch {
    return { allowed: false, hoursRemaining: 0 };
  }
}

export async function cancelAppointment(id: string, isStaff: boolean = false) {
  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) throw new ClinicError("appointment_not_found");
  if (appointment.status === "cancelled") return appointment;

  // Unless staff override, enforce 24-hour hold-button cancellation policy
  if (!isStaff) {
    const check = canCancelAppointment(appointment.date, appointment.time);
    if (!check.allowed) {
      throw new ClinicError("cancellation_policy_locked");
    }
  }

  return await prisma.appointment.update({
    where: { id },
    data: { status: "cancelled" },
    include: { service: true, doctor: true },
  });
}

export async function rescheduleAppointment(id: string, date: string, time: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id, status: "confirmed" },
    include: { service: true },
  });
  if (!appointment) throw new ClinicError("confirmed_not_found");

  const available = await getAvailableSlots(appointment.serviceId, appointment.doctorId, date, id);
  if (!available.includes(time)) throw new ClinicError("time_unavailable");

  return await prisma.appointment.update({
    where: { id },
    data: { date, time },
    include: { service: true, doctor: true },
  });
}

export async function confirmAppointmentAttendance(id: string) {
  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) throw new ClinicError("appointment_not_found");
  return await prisma.appointment.update({
    where: { id },
    data: { attendanceConfirmed: true, confirmedAt: new Date() },
    include: { service: true, doctor: true },
  });
}

export async function getAppointments(filter?: { email?: string; doctorId?: string; date?: string; status?: string }) {
  return await prisma.appointment.findMany({
    where: {
      email: filter?.email ? filter.email.toLowerCase() : undefined,
      doctorId: filter?.doctorId,
      date: filter?.date,
      status: filter?.status,
    },
    include: { service: true, doctor: true },
    take: 500,
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });
}

// 5. Patient Portal: Digital Intake & e-Consent
export async function getPatientIntakeForm(email: string) {
  return await prisma.patientIntakeForm.findUnique({
    where: { patientEmail: email.toLowerCase() },
  });
}

export async function upsertPatientIntakeForm(
  email: string,
  input: {
    phone: string;
    emergencyContact: string;
    noChangesVerified?: boolean;
    insuranceEnabled?: boolean;
    insuranceProvider?: string;
    insuranceMemberId?: string;
    conditions: string[];
    allergies: string[];
    medications?: string;
    consentSigned?: boolean;
    signatureDataUrl?: string;
    signedByName?: string;
  }
) {
  const patientEmail = email.toLowerCase();
  return await prisma.patientIntakeForm.upsert({
    where: { patientEmail },
    update: {
      phone: input.phone,
      emergencyContact: input.emergencyContact,
      noChangesVerified: input.noChangesVerified ?? false,
      insuranceEnabled: input.insuranceEnabled ?? false,
      insuranceProvider: input.insuranceProvider,
      insuranceMemberId: input.insuranceMemberId,
      conditions: input.conditions,
      allergies: input.allergies,
      medications: input.medications,
      consentSigned: input.consentSigned ?? false,
      signatureDataUrl: input.signatureDataUrl,
      signedByName: input.signedByName,
      signedAt: input.consentSigned ? new Date() : undefined,
    },
    create: {
      patientEmail,
      phone: input.phone,
      emergencyContact: input.emergencyContact,
      noChangesVerified: input.noChangesVerified ?? false,
      insuranceEnabled: input.insuranceEnabled ?? false,
      insuranceProvider: input.insuranceProvider,
      insuranceMemberId: input.insuranceMemberId,
      conditions: input.conditions,
      allergies: input.allergies,
      medications: input.medications,
      consentSigned: input.consentSigned ?? false,
      signatureDataUrl: input.signatureDataUrl,
      signedByName: input.signedByName,
      signedAt: input.consentSigned ? new Date() : undefined,
    },
  });
}

// 6. Patient Portal: FDI 32-Tooth Treatment Plans
export async function getTreatmentPlan(email: string) {
  return await prisma.treatmentPlan.findUnique({
    where: { patientEmail: email.toLowerCase() },
    include: {
      doctor: true,
      teeth: { orderBy: { toothNumber: "asc" } },
      phases: {
        include: { service: true, scheduledAppointment: true },
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function approveTreatmentPlan(email: string, signatureDataUrl: string, signedByName: string) {
  const patientEmail = email.toLowerCase();
  return await prisma.treatmentPlan.update({
    where: { patientEmail },
    data: {
      status: "approved",
      signatureDataUrl,
      signedByName,
      approvedAt: new Date(),
    },
    include: {
      doctor: true,
      teeth: true,
      phases: { include: { service: true } },
    },
  });
}

// 7. Patient Portal: Care Summaries & Invoices
export async function getVisitCareSummaries(email: string) {
  return await prisma.visitCareSummary.findMany({
    where: { patientEmail: email.toLowerCase() },
    include: { doctor: true, service: true, prescriptions: true },
    take: 100,
    orderBy: { visitDate: "desc" },
  });
}

export async function getPatientInvoices(email: string) {
  return await prisma.patientInvoice.findMany({
    where: { patientEmail: email.toLowerCase() },
    include: { doctor: true, items: true },
    take: 100,
    orderBy: { issuedDate: "desc" },
  });
}

export async function payPatientInvoice(invoiceId: string, paymentMethod: string) {
  const invoice = await prisma.patientInvoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) throw new Error("Invoice not found");
  return await prisma.patientInvoice.update({
    where: { id: invoiceId },
    data: {
      paidAmountEgp: invoice.totalFeeEgp,
      balanceEgp: 0,
      status: "paid",
      paymentMethod,
      receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
      paidAt: new Date(),
    },
    include: { doctor: true, items: true },
  });
}

// 8. Accounts & Users
export async function getAccounts() {
  const users = await prisma.user.findMany({
    include: { doctorProfile: { include: { services: true } } },
    take: 200,
    orderBy: { createdAt: "desc" },
  });
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone || "",
    role: u.role,
    status: u.status,
    specialty: u.doctorProfile?.specialty,
    bio: u.doctorProfile?.bio,
    serviceIds: u.doctorProfile?.services.map((s) => s.serviceId) || [],
    createdAt: u.createdAt.toISOString().slice(0, 10),
  }));
}

export async function createAccount(input: {
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "doctor" | "patient";
  status?: string;
  specialty?: string;
  bio?: string;
  serviceIds?: string[];
}) {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (!name || !email) throw new ClinicError("invalid_contact");

  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        phone: input.phone?.trim() || null,
        role: input.role,
        status: input.status || "active",
      },
    });

    if (input.role === "doctor") {
      const doctor = await tx.doctor.create({
        data: {
          userId: user.id,
          name,
          specialty: input.specialty?.trim() || "General dentistry",
          bio: input.bio?.trim() || "",
          status: "active",
        },
      });
      if (input.serviceIds && input.serviceIds.length > 0) {
        await tx.doctorService.createMany({
          data: input.serviceIds.map((serviceId) => ({
            doctorId: doctor.id,
            serviceId,
          })),
        });
      }
    }
    return user;
  });
}
