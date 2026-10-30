import { z } from "zod";

// ==========================================
// 1. Shared Primitives
// ==========================================

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, expected YYYY-MM-DD")
  .refine((val) => {
    const d = new Date(`${val}T00:00:00.000Z`);
    return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === val;
  }, "Invalid calendar date");

export const hhmmSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid time format, expected HH:MM");

export const emailSchema = z.string().trim().toLowerCase().email().max(254);

export const nameSchema = z.string().trim().min(1).max(120);

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[+0-9 ()-]{6,24}$/, "Invalid phone number format");

export const noteSchema = z.string().max(1000).optional();

export const signatureDataUrlSchema = z
  .string()
  .max(300_000, "Signature data URL exceeds 300,000 characters")
  .refine(
    (val) => val.startsWith("data:image/png;base64,"),
    "Signature must be a base64 png data URL"
  );

export const stringArraySchema = z.array(z.string().trim().max(200)).max(50);

export const paymentMethodSchema = z.enum([
  "card",
  "cash",
  "fawry",
  "insurance",
  "apple_pay",
  "google_pay",
  "mobile_wallet",
]);

// ==========================================
// 2. Request Schemas
// ==========================================

export const createAccountSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: z.string().min(8).optional(),
  phone: phoneSchema.optional(),
  role: z.enum(["admin", "doctor", "patient"]),
  specialty: z.string().trim().max(120).optional(),
  bio: z.string().max(2000).optional(),
  serviceIds: stringArraySchema.optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const updateDoctorSchema = z.object({
  name: nameSchema.optional(),
  specialty: z.string().trim().max(120).optional(),
  bio: z.string().max(2000).optional(),
  serviceIds: stringArraySchema.optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const createServiceSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(1000),
  durationMinutes: z.number().int().min(15).max(180).default(45),
  category: z.string().trim().max(100).default("Preventive Care"),
  image: z.string().trim().min(1).max(1000),
  extendedDetails: z
    .object({
      overview: z.string().max(2000).optional(),
      procedure: z.string().max(2000).optional(),
      benefits: z.string().max(2000).optional(),
      aftercare: z.string().max(2000).optional(),
    })
    .optional(),
  overview: z.string().max(2000).optional(),
  procedure: z.string().max(2000).optional(),
  benefits: z.string().max(2000).optional(),
  aftercare: z.string().max(2000).optional(),
});

export const updateServiceSchema = createServiceSchema.partial();

export const workingHourItemSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    isClosed: z.boolean(),
    startTime: hhmmSchema,
    endTime: hhmmSchema,
    slotIntervalMinutes: z.number().int().min(5).max(120).optional(),
  })
  .refine(
    (data) => {
      if (data.isClosed) return true;
      return data.startTime < data.endTime;
    },
    {
      message: "startTime must be before endTime",
      path: ["endTime"],
    }
  );

export const workingHoursBodySchema = z.union([
  z.array(workingHourItemSchema),
  z
    .object({
      workingHours: z.array(workingHourItemSchema),
    })
    .transform((val) => val.workingHours),
]);

export const getAppointmentsQuerySchema = z.object({
  email: emailSchema.optional(),
  doctorId: z.string().max(100).optional(),
  date: isoDateSchema.optional(),
  from: isoDateSchema.optional(),
  to: isoDateSchema.optional(),
  status: z.enum(["confirmed", "cancelled"]).optional(),
});

export const bookAppointmentSchema = z.object({
  serviceId: z.string().min(1).max(100),
  doctorId: z.string().min(1).max(100),
  date: isoDateSchema,
  time: hhmmSchema,
  patientName: nameSchema,
  email: emailSchema.optional(),
  phone: phoneSchema,
  note: noteSchema,
  reasonCategory: z.enum(["new-exam", "emergency", "cleaning", "follow-up"]).optional(),
});

export const patchAppointmentSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("cancel"),
  }),
  z.object({
    action: z.literal("reschedule"),
    date: isoDateSchema,
    time: hhmmSchema,
  }),
  z.object({
    action: z.literal("confirm_attendance"),
  }),
]);

export const patientIntakeInputSchema = z.object({
  phone: phoneSchema,
  emergencyContact: z.string().trim().min(1).max(120),
  noChangesVerified: z.boolean().default(false),
  insuranceScaffold: z
    .object({
      enabled: z.boolean().default(false),
      providerPlaceholder: z.string().max(120).optional(),
      memberIdPlaceholder: z.string().max(120).optional(),
      provider: z.string().max(120).optional(),
      memberId: z.string().max(120).optional(),
    })
    .optional(),
  insuranceEnabled: z.boolean().optional(),
  insuranceProvider: z.string().max(120).optional(),
  insuranceMemberId: z.string().max(120).optional(),
  conditions: stringArraySchema.optional().default([]),
  allergies: stringArraySchema.optional().default([]),
  medications: z.string().max(1000).optional().default(""),
  consentSigned: z.boolean().default(false),
  signatureDataUrl: signatureDataUrlSchema.optional(),
  signedByName: nameSchema.optional(),
});

export const approveTreatmentPlanSchema = z.object({
  action: z.literal("approve"),
  signatureDataUrl: signatureDataUrlSchema,
  signedByName: nameSchema,
});

export const payInvoiceSchema = z.object({
  invoiceId: z.string().min(1).max(100),
  paymentMethod: paymentMethodSchema.default("card"),
});

export const calendarSyncSchema = z.object({
  appointmentId: z.string().max(100).optional(),
  title: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  date: isoDateSchema.optional(),
  time: hhmmSchema.optional(),
  durationMinutes: z.number().int().min(5).max(360).optional(),
  doctorName: z.string().max(120).optional(),
  location: z.string().max(300).optional(),
  startDateTime: z.string().optional(),
});

export const availabilityQuerySchema = z.object({
  serviceId: z.string().min(1).max(100),
  doctorId: z.string().min(1).max(100),
  date: isoDateSchema.optional(),
});
