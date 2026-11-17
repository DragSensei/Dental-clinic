import prisma from "@/lib/prisma";
import { clinicInstant, hoursUntil, CANCEL_WINDOW_HOURS } from "@/lib/clinic-time";

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
  | "invalid_reference";

export class ClinicError extends Error {
  readonly code: ClinicErrorCode;

  constructor(code: ClinicErrorCode) {
    super(code);
    this.name = "ClinicError";
    this.code = code;
  }
}

export class ClinicForbiddenError extends Error {
  constructor(message = "forbidden") {
    super(message);
    this.name = "ClinicForbiddenError";
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
  title?: string;
  titleAr?: string | null;
  description?: string;
  descriptionAr?: string | null;
  defaultLocale?: "bilingual" | "en" | "ar";
  durationMinutes: number;
  category: string;
  image: string;
  overview?: string | null;
  overviewAr?: string | null;
  procedure?: string | null;
  procedureAr?: string | null;
  benefits?: string | null;
  benefitsAr?: string | null;
  aftercare?: string | null;
  aftercareAr?: string | null;
}) {
  const defaultLocale = input.defaultLocale ?? "bilingual";
  const rawTitle = (input.title ?? "").trim();
  const rawTitleAr = (input.titleAr ?? "").trim();
  const rawDescription = (input.description ?? "").trim();
  const rawDescriptionAr = (input.descriptionAr ?? "").trim();

  const title = defaultLocale === "ar" ? rawTitleAr || rawTitle : rawTitle;
  const description = defaultLocale === "ar" ? rawDescriptionAr || rawDescription : rawDescription;
  const titleAr = defaultLocale === "en" ? null : rawTitleAr || (defaultLocale === "ar" ? title : null);
  const descriptionAr =
    defaultLocale === "en" ? null : rawDescriptionAr || (defaultLocale === "ar" ? description : null);

  const durationMinutes = Number(input.durationMinutes);
  if (!title || !description || !Number.isInteger(durationMinutes) || durationMinutes < 15 || durationMinutes > 180) {
    throw new ClinicError("invalid_service");
  }
  return await prisma.service.create({
    data: {
      id: input.id?.trim() || undefined,
      title,
      titleAr,
      description,
      descriptionAr,
      defaultLocale,
      durationMinutes,
      category: input.category.trim() || "Preventive Care",
      image: input.image.trim(),
      overview: defaultLocale === "ar" ? input.overviewAr ?? input.overview ?? null : input.overview ?? null,
      overviewAr: defaultLocale === "en" ? null : input.overviewAr ?? null,
      procedure: defaultLocale === "ar" ? input.procedureAr ?? input.procedure ?? null : input.procedure ?? null,
      procedureAr: defaultLocale === "en" ? null : input.procedureAr ?? null,
      benefits: defaultLocale === "ar" ? input.benefitsAr ?? input.benefits ?? null : input.benefits ?? null,
      benefitsAr: defaultLocale === "en" ? null : input.benefitsAr ?? null,
      aftercare: defaultLocale === "ar" ? input.aftercareAr ?? input.aftercare ?? null : input.aftercare ?? null,
      aftercareAr: defaultLocale === "en" ? null : input.aftercareAr ?? null,
    },
  });
}

export async function updateService(
  id: string,
  input: {
    title?: string;
    titleAr?: string | null;
    description?: string;
    descriptionAr?: string | null;
    defaultLocale?: "bilingual" | "en" | "ar";
    durationMinutes?: number;
    category?: string;
    image?: string;
    overview?: string | null;
    overviewAr?: string | null;
    procedure?: string | null;
    procedureAr?: string | null;
    benefits?: string | null;
    benefitsAr?: string | null;
    aftercare?: string | null;
    aftercareAr?: string | null;
  }
) {
  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) throw new ClinicError("service_not_found");

  const nextLocale =
    input.defaultLocale ??
    (existing.defaultLocale === "en" || existing.defaultLocale === "ar" ? existing.defaultLocale : "bilingual");

  const resolvedTitleAr =
    nextLocale === "en"
      ? null
      : input.titleAr !== undefined
      ? input.titleAr?.trim() || null
      : existing.titleAr;
  const resolvedDescriptionAr =
    nextLocale === "en"
      ? null
      : input.descriptionAr !== undefined
      ? input.descriptionAr?.trim() || null
      : existing.descriptionAr;

  const nextTitle =
    nextLocale === "ar"
      ? (resolvedTitleAr || input.title || existing.title).trim()
      : (input.title ?? existing.title).trim();
  const nextDescription =
    nextLocale === "ar"
      ? (resolvedDescriptionAr || input.description || existing.description).trim()
      : (input.description ?? existing.description).trim();

  const nextDuration = input.durationMinutes ?? existing.durationMinutes;
  if (
    !nextTitle ||
    !nextDescription ||
    (nextLocale === "ar" && (!resolvedTitleAr || !resolvedDescriptionAr)) ||
    !Number.isInteger(nextDuration) ||
    nextDuration < 15 ||
    nextDuration > 180
  ) {
    throw new ClinicError("invalid_service");
  }

  // Duration overlap check with existing active appointments
  if (existing.durationMinutes !== nextDuration) {
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
        const end = start + nextDuration;
        const otherApps = allDoctorAppointments.filter(
          (o) => o.id !== app.id && o.doctorId === app.doctorId && o.date === app.date
        );
        const conflict = otherApps.some((other) => {
          const otherStart = minutes(other.time);
          const otherDuration =
            other.serviceId === id ? nextDuration : other.durationMinutes || other.service.durationMinutes;
          const otherEnd = otherStart + otherDuration;
          return start < otherEnd && otherStart < end;
        });
        if (conflict) throw new ClinicError("duration_overlap");
      }
    }
  }

  const nextOverviewAr =
    nextLocale === "en" ? null : input.overviewAr !== undefined ? input.overviewAr : existing.overviewAr;
  const nextProcedureAr =
    nextLocale === "en" ? null : input.procedureAr !== undefined ? input.procedureAr : existing.procedureAr;
  const nextBenefitsAr =
    nextLocale === "en" ? null : input.benefitsAr !== undefined ? input.benefitsAr : existing.benefitsAr;
  const nextAftercareAr =
    nextLocale === "en" ? null : input.aftercareAr !== undefined ? input.aftercareAr : existing.aftercareAr;

  const nextOverview =
    nextLocale === "ar"
      ? nextOverviewAr ?? null
      : input.overview !== undefined
      ? input.overview
      : existing.overview;
  const nextProcedure =
    nextLocale === "ar"
      ? nextProcedureAr ?? null
      : input.procedure !== undefined
      ? input.procedure
      : existing.procedure;
  const nextBenefits =
    nextLocale === "ar"
      ? nextBenefitsAr ?? null
      : input.benefits !== undefined
      ? input.benefits
      : existing.benefits;
  const nextAftercare =
    nextLocale === "ar"
      ? nextAftercareAr ?? null
      : input.aftercare !== undefined
      ? input.aftercare
      : existing.aftercare;

  return await prisma.service.update({
    where: { id },
    data: {
      title: nextTitle,
      titleAr: resolvedTitleAr,
      description: nextDescription,
      descriptionAr: resolvedDescriptionAr,
      defaultLocale: nextLocale,
      durationMinutes: nextDuration,
      category: input.category?.trim() || existing.category,
      image: input.image?.trim() || existing.image,
      overview: nextOverview,
      overviewAr: nextOverviewAr,
      procedure: nextProcedure,
      procedureAr: nextProcedureAr,
      benefits: nextBenefits,
      benefitsAr: nextBenefitsAr,
      aftercare: nextAftercare,
      aftercareAr: nextAftercareAr,
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
    image: d.image,
    credentials: d.credentials,
    experienceBadge: d.experienceBadge,
    experienceSummary: d.experienceSummary,
    languages: d.languages,
    comfortFocus: d.comfortFocus,
    status: d.status,
    userId: d.userId,
    serviceIds: d.services.map((s) => s.serviceId),
    workingHours: d.workingHours,
  }));
}

export async function updateDoctor(
  id: string,
  input: {
    name?: string;
    specialty?: string;
    bio?: string;
    image?: string | null;
    credentials?: string | null;
    experienceBadge?: string | null;
    experienceSummary?: string | null;
    languages?: string | null;
    comfortFocus?: string | null;
    serviceIds?: string[];
    status?: string;
  }
) {
  const existing = await prisma.doctor.findUnique({
    where: { id },
    include: { services: true },
  });
  if (!existing) throw new ClinicError("doctor_not_found");

  const nextServiceIds = input.serviceIds ?? existing.services.map((s) => s.serviceId);
  if (nextServiceIds.length > 0) {
    const services = await prisma.service.findMany({
      where: { id: { in: nextServiceIds } },
      take: 100,
    });
    if (services.length !== nextServiceIds.length) {
      throw new ClinicError("invalid_reference");
    }
  }

  // Active appointment guard: doctor cannot remove a service for which they have confirmed future appointments
  const activeBlocked = await prisma.appointment.findFirst({
    where: {
      doctorId: id,
      status: "confirmed",
      serviceId: { notIn: nextServiceIds },
    },
  });
  if (activeBlocked) {
    throw new ClinicError("doctor_service_blocked");
  }

  const pickNullableField = (incoming: string | null | undefined, current: string | null) =>
    incoming !== undefined ? incoming?.trim() || null : current;

  return await prisma.$transaction(async (tx) => {
    await tx.doctorService.deleteMany({ where: { doctorId: id } });
    if (nextServiceIds.length > 0) {
      await tx.doctorService.createMany({
        data: nextServiceIds.map((serviceId) => ({ doctorId: id, serviceId })),
      });
    }
    return await tx.doctor.update({
      where: { id },
      data: {
        name: (input.name ?? existing.name).trim(),
        specialty: (input.specialty ?? existing.specialty).trim(),
        bio: (input.bio ?? existing.bio).trim(),
        image: pickNullableField(input.image, existing.image),
        credentials: pickNullableField(input.credentials, existing.credentials),
        experienceBadge: pickNullableField(input.experienceBadge, existing.experienceBadge),
        experienceSummary: pickNullableField(input.experienceSummary, existing.experienceSummary),
        languages: pickNullableField(input.languages, existing.languages),
        comfortFocus: pickNullableField(input.comfortFocus, existing.comfortFocus),
        status: input.status || existing.status,
      },
      include: { services: true, workingHours: true },
    });
  });
}

// 3. Availability & Scheduling Engine
function computeOpenDates(
  doctorWorkingHours: Array<{ dayOfWeek: number; isOff: boolean }>,
  clinicHours: Array<{ dayOfWeek: number; isClosed: boolean }>
): string[] {
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
    const docDay = doctorWorkingHours.find((h) => h.dayOfWeek === dayOfWeek);
    if (docDay?.isOff) continue;

    dates.push(toUtcDate(day));
  }
  return dates;
}

export async function getAvailableDates(serviceId: string, doctorId: string): Promise<string[]> {
  const [doctor, service, clinicHours] = await Promise.all([
    prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { services: true, workingHours: true },
    }),
    prisma.service.findUnique({ where: { id: serviceId } }),
    prisma.clinicWorkingHours.findMany({ take: 7 }),
  ]);
  if (
    !service ||
    !doctor ||
    doctor.status === "inactive" ||
    !doctor.services.some((s) => s.serviceId === serviceId)
  ) {
    return [];
  }

  return computeOpenDates(doctor.workingHours, clinicHours);
}

export async function getAvailableSlots(serviceId: string, doctorId: string, date: string, excludeId?: string): Promise<string[]> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];

  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);
  const targetMs = Date.parse(`${date}T00:00:00Z`);
  const diffDays = Math.round((targetMs - cursor.getTime()) / 86_400_000);
  if (diffDays < 1 || diffDays > 21) return [];

  const dayOfWeek = new Date(targetMs).getUTCDay();
  const [doctor, service, clinicHours, active] = await Promise.all([
    prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { services: true, workingHours: true },
    }),
    prisma.service.findUnique({ where: { id: serviceId } }),
    prisma.clinicWorkingHours.findMany({ take: 7 }),
    prisma.appointment.findMany({
      where: {
        doctorId,
        date,
        status: "confirmed",
        id: excludeId ? { not: excludeId } : undefined,
      },
      take: 100,
    }),
  ]);
  if (
    !service ||
    !doctor ||
    doctor.status === "inactive" ||
    !doctor.services.some((s) => s.serviceId === serviceId)
  ) {
    return [];
  }

  const dates = computeOpenDates(doctor.workingHours, clinicHours);
  if (!dates.includes(date)) return [];

  const docDay = doctor.workingHours.find((h) => h.dayOfWeek === dayOfWeek);
  const clinicDay = clinicHours.find((h) => h.dayOfWeek === dayOfWeek);
  if (docDay?.isOff || clinicDay?.isClosed) return [];

  const startBound = minutes(docDay?.startTime || clinicDay?.startTime || "09:00");
  const endBound = minutes(docDay?.endTime || clinicDay?.endTime || "16:45");
  const slotStep = Math.min(service.durationMinutes, 45);
  const now = Date.now();

  return slotStarts.filter((time) => {
    // Reject slots in the past even if today
    if (clinicInstant(date, time) <= now) {
      return false;
    }
    const start = minutes(time);
    if (start < startBound || start + slotStep > endBound) {
      return false;
    }
    const end = start + service.durationMinutes;
    return !active.some((item) => {
      const otherStart = minutes(item.time);
      const otherEnd = otherStart + (item.durationMinutes || 45);
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

  // 1. Server-side slot validation
  const available = await getAvailableSlots(input.serviceId, input.doctorId, input.date);
  if (!available.includes(input.time)) {
    throw new ClinicError("slot_unavailable");
  }

  // 2. Concurrency: per-doctor-per-day advisory lock inside transaction
  return await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${input.doctorId} || ':' || ${input.date}))`;

    const service = await tx.service.findUnique({
      where: { id: input.serviceId },
    });
    if (!service) {
      throw new ClinicError("service_clinician_mismatch");
    }

    // Re-run the overlap query with tx
    const active = await tx.appointment.findMany({
      where: {
        doctorId: input.doctorId,
        date: input.date,
        status: "confirmed",
      },
      take: 100,
    });

    const start = minutes(input.time);
    const end = start + service.durationMinutes;
    const hasConflict = active.some((item) => {
      const otherStart = minutes(item.time);
      const otherEnd = otherStart + (item.durationMinutes || 45);
      return start < otherEnd && otherStart < end;
    });
    if (hasConflict) {
      throw new ClinicError("slot_unavailable");
    }

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
    const remaining = hoursUntil(dateStr, timeStr);
    return {
      allowed: remaining >= CANCEL_WINDOW_HOURS,
      hoursRemaining: Math.max(0, Math.floor(remaining)),
    };
  } catch {
    return { allowed: false, hoursRemaining: 0 };
  }
}

export async function cancelAppointment(id: string, isStaff: boolean = false, ownerEmail?: string) {
  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) throw new ClinicError("appointment_not_found");
  if (!isStaff && ownerEmail && appointment.email.toLowerCase() !== ownerEmail.toLowerCase()) {
    throw new ClinicError("appointment_not_found");
  }

  if (appointment.status !== "confirmed") {
    throw new ClinicError("invalid_transition");
  }

  const remaining = hoursUntil(appointment.date, appointment.time);
  if (remaining <= 0) {
    throw new ClinicError("invalid_transition");
  }

  if (!isStaff && remaining < CANCEL_WINDOW_HOURS) {
    throw new ClinicError("cancellation_window");
  }

  return await prisma.appointment.update({
    where: { id },
    data: { status: "cancelled" },
    include: { service: true, doctor: true },
  });
}

export async function rescheduleAppointment(
  id: string,
  date: string,
  time: string,
  isStaff: boolean = false,
  ownerEmail?: string
) {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
  });
  if (!appointment) throw new ClinicError("appointment_not_found");
  if (!isStaff && ownerEmail && appointment.email.toLowerCase() !== ownerEmail.toLowerCase()) {
    throw new ClinicError("appointment_not_found");
  }

  if (appointment.status !== "confirmed") {
    throw new ClinicError("invalid_transition");
  }

  const remainingOld = hoursUntil(appointment.date, appointment.time);
  if (remainingOld <= 0) {
    throw new ClinicError("invalid_transition");
  }

  if (!isStaff && remainingOld < CANCEL_WINDOW_HOURS) {
    throw new ClinicError("cancellation_window");
  }

  // Target slot availability check
  const available = await getAvailableSlots(appointment.serviceId, appointment.doctorId, date, id);
  if (!available.includes(time)) {
    throw new ClinicError("slot_unavailable");
  }

  return await prisma.$transaction(async (tx) => {
    // Acquire locks in sorted order to avoid deadlock
    const lockKeys = Array.from(
      new Set([`${appointment.doctorId}:${appointment.date}`, `${appointment.doctorId}:${date}`])
    ).sort();

    for (const key of lockKeys) {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))`;
    }

    const service = await tx.service.findUnique({ where: { id: appointment.serviceId } });
    const duration = appointment.durationMinutes || service?.durationMinutes || 45;

    const active = await tx.appointment.findMany({
      where: {
        doctorId: appointment.doctorId,
        date,
        status: "confirmed",
        id: { not: id },
      },
      take: 100,
    });

    const start = minutes(time);
    const end = start + duration;
    const hasConflict = active.some((item) => {
      const otherStart = minutes(item.time);
      const otherEnd = otherStart + (item.durationMinutes || 45);
      return start < otherEnd && otherStart < end;
    });
    if (hasConflict) {
      throw new ClinicError("slot_unavailable");
    }

    return await tx.appointment.update({
      where: { id },
      data: { date, time },
      include: { service: true, doctor: true },
    });
  });
}

export async function confirmAppointmentAttendance(
  id: string,
  caller?: { email: string; isStaff: boolean }
) {
  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) throw new ClinicError("appointment_not_found");
  if (caller && appointment.email.toLowerCase() !== caller.email.toLowerCase()) {
    if (caller.isStaff) {
      throw new ClinicForbiddenError();
    }
    throw new ClinicError("appointment_not_found");
  }

  if (appointment.status !== "confirmed") {
    throw new ClinicError("invalid_transition");
  }

  const remaining = hoursUntil(appointment.date, appointment.time);
  if (remaining <= 0) {
    throw new ClinicError("invalid_transition");
  }

  if (appointment.attendanceConfirmed) {
    throw new ClinicError("invalid_transition");
  }

  return await prisma.appointment.update({
    where: { id },
    data: { attendanceConfirmed: true, confirmedAt: new Date() },
    include: { service: true, doctor: true },
  });
}

export async function getAppointments(filter?: {
  email?: string;
  doctorId?: string;
  date?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
  take?: number;
}) {
  const dateFilter = filter?.date
    ? filter.date
    : filter?.fromDate || filter?.toDate
    ? {
        gte: filter?.fromDate,
        lte: filter?.toDate,
      }
    : undefined;

  const boundedTake = Math.min(Math.max(1, filter?.take ?? 200), 200);

  const rows = await prisma.appointment.findMany({
    where: {
      email: filter?.email ? filter.email.toLowerCase() : undefined,
      doctorId: filter?.doctorId,
      date: dateFilter,
      status: filter?.status,
    },
    include: { service: true, doctor: true },
    take: 200,
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });
  return boundedTake < 200 ? rows.slice(0, boundedTake) : rows;
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
  const existing = await prisma.treatmentPlan.findUnique({ where: { patientEmail } });
  if (!existing) {
    throw new ClinicError("plan_not_found");
  }
  if (existing.status === "approved") {
    throw new ClinicError("already_approved");
  }

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

export async function payPatientInvoice(invoiceId: string, paymentMethod: string, ownerEmail?: string) {
  const receiptNumber = `REC-${Date.now().toString().slice(-6)}`;
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.patientInvoice.findUnique({ where: { id: invoiceId } });
    if (!existing) {
      throw new ClinicError("invoice_not_found");
    }
    if (ownerEmail && existing.patientEmail.toLowerCase() !== ownerEmail.toLowerCase()) {
      throw new ClinicError("invoice_not_found");
    }
    if (existing.status === "paid") {
      throw new ClinicError("already_paid");
    }
    if (existing.status !== "balance_due") {
      throw new ClinicError("invalid_transition");
    }

    const r = await tx.patientInvoice.updateMany({
      where: {
        id: invoiceId,
        status: "balance_due",
        ...(ownerEmail ? { patientEmail: ownerEmail.toLowerCase() } : {}),
      },
      data: {
        paidAmountEgp: existing.totalFeeEgp,
        balanceEgp: 0,
        status: "paid",
        paymentMethod,
        receiptNumber,
        paidAt: new Date(),
      },
    });

    if (r.count === 0) {
      const latest = await tx.patientInvoice.findUnique({ where: { id: invoiceId } });
      if (latest?.status === "paid") {
        throw new ClinicError("already_paid");
      }
      throw new ClinicError("invalid_transition");
    }

    return await tx.patientInvoice.findUnique({
      where: { id: invoiceId },
      include: { doctor: true, items: true },
    });
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
