import type {
  Service,
  ServiceLanguageMode,
  Doctor,
  PatientIntakeForm,
  TreatmentPlan,
  ToothRecord,
  TreatmentPhase,
  VisitCareSummary,
  PrescriptionItem,
  PatientInvoice,
  InvoiceLineItem,
  Appointment,
  Account,
} from "@/data/mock/catalog";

// ==========================================
// 1. Service Mappers
// ==========================================

function toLanguageMode(value?: string | null): ServiceLanguageMode {
  if (value === "en" || value === "ar" || value === "bilingual") return value;
  return "bilingual";
}

function cleanOptionalText(value?: string | null): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function toServiceDTO(row: {
  id: string;
  title: string;
  titleAr?: string | null;
  description: string;
  descriptionAr?: string | null;
  defaultLocale?: string | null;
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
}): Service {
  const hasExtended = Boolean(
    row.overview || row.procedure || row.benefits || row.aftercare
  );
  const hasExtendedAr = Boolean(
    row.overviewAr || row.procedureAr || row.benefitsAr || row.aftercareAr
  );
  return {
    id: row.id,
    title: row.title,
    ...(row.titleAr ? { titleAr: row.titleAr } : {}),
    description: row.description,
    ...(row.descriptionAr ? { descriptionAr: row.descriptionAr } : {}),
    defaultLocale: toLanguageMode(row.defaultLocale),
    durationMinutes: row.durationMinutes,
    category: row.category,
    image: row.image,
    extendedDetails: hasExtended
      ? {
          overview: row.overview ?? "",
          procedure: row.procedure ?? "",
          benefits: row.benefits ?? "",
          aftercare: row.aftercare ?? "",
        }
      : undefined,
    ...(hasExtendedAr
      ? {
          extendedDetailsAr: {
            overview: row.overviewAr ?? "",
            procedure: row.procedureAr ?? "",
            benefits: row.benefitsAr ?? "",
            aftercare: row.aftercareAr ?? "",
          },
        }
      : {}),
  };
}

export function fromServiceInput(body: {
  title?: string;
  titleAr?: string | null;
  description?: string;
  descriptionAr?: string | null;
  defaultLocale?: ServiceLanguageMode;
  durationMinutes?: number;
  category?: string;
  image?: string;
  extendedDetails?: {
    overview?: string | null;
    procedure?: string | null;
    benefits?: string | null;
    aftercare?: string | null;
  } | null;
  extendedDetailsAr?: {
    overview?: string | null;
    procedure?: string | null;
    benefits?: string | null;
    aftercare?: string | null;
  } | null;
  overview?: string | null;
  overviewAr?: string | null;
  procedure?: string | null;
  procedureAr?: string | null;
  benefits?: string | null;
  benefitsAr?: string | null;
  aftercare?: string | null;
  aftercareAr?: string | null;
}) {
  const overview =
    body.extendedDetails !== undefined
      ? cleanOptionalText(body.extendedDetails?.overview ?? null)
      : cleanOptionalText(body.overview);
  const procedure =
    body.extendedDetails !== undefined
      ? cleanOptionalText(body.extendedDetails?.procedure ?? null)
      : cleanOptionalText(body.procedure);
  const benefits =
    body.extendedDetails !== undefined
      ? cleanOptionalText(body.extendedDetails?.benefits ?? null)
      : cleanOptionalText(body.benefits);
  const aftercare =
    body.extendedDetails !== undefined
      ? cleanOptionalText(body.extendedDetails?.aftercare ?? null)
      : cleanOptionalText(body.aftercare);

  const overviewAr =
    body.extendedDetailsAr !== undefined
      ? cleanOptionalText(body.extendedDetailsAr?.overview ?? null)
      : cleanOptionalText(body.overviewAr);
  const procedureAr =
    body.extendedDetailsAr !== undefined
      ? cleanOptionalText(body.extendedDetailsAr?.procedure ?? null)
      : cleanOptionalText(body.procedureAr);
  const benefitsAr =
    body.extendedDetailsAr !== undefined
      ? cleanOptionalText(body.extendedDetailsAr?.benefits ?? null)
      : cleanOptionalText(body.benefitsAr);
  const aftercareAr =
    body.extendedDetailsAr !== undefined
      ? cleanOptionalText(body.extendedDetailsAr?.aftercare ?? null)
      : cleanOptionalText(body.aftercareAr);

  return {
    ...(body.title !== undefined ? { title: body.title } : {}),
    ...(body.titleAr !== undefined ? { titleAr: cleanOptionalText(body.titleAr) } : {}),
    ...(body.description !== undefined ? { description: body.description } : {}),
    ...(body.descriptionAr !== undefined
      ? { descriptionAr: cleanOptionalText(body.descriptionAr) }
      : {}),
    ...(body.defaultLocale !== undefined ? { defaultLocale: body.defaultLocale } : {}),
    ...(body.durationMinutes !== undefined ? { durationMinutes: body.durationMinutes } : {}),
    ...(body.category !== undefined ? { category: body.category } : {}),
    ...(body.image !== undefined ? { image: body.image } : {}),
    ...(overview !== undefined ? { overview } : {}),
    ...(procedure !== undefined ? { procedure } : {}),
    ...(benefits !== undefined ? { benefits } : {}),
    ...(aftercare !== undefined ? { aftercare } : {}),
    ...(overviewAr !== undefined ? { overviewAr } : {}),
    ...(procedureAr !== undefined ? { procedureAr } : {}),
    ...(benefitsAr !== undefined ? { benefitsAr } : {}),
    ...(aftercareAr !== undefined ? { aftercareAr } : {}),
  };
}

// ==========================================
// 2. Doctor Mappers
// ==========================================

export function toDoctorDTO(row: {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  image?: string | null;
  credentials?: string | null;
  experienceBadge?: string | null;
  experienceSummary?: string | null;
  languages?: string | null;
  comfortFocus?: string | null;
  services?: Array<{ serviceId: string }> | null;
  serviceIds?: string[] | null;
  workingHours?: Array<{
    dayOfWeek: number;
    isOff: boolean;
    startTime?: string | null;
    endTime?: string | null;
  }> | null;
}): Doctor {
  const image = cleanOptionalText(row.image);
  const credentials = cleanOptionalText(row.credentials);
  const experienceBadge = cleanOptionalText(row.experienceBadge);
  const experienceSummary = cleanOptionalText(row.experienceSummary);
  const languages = cleanOptionalText(row.languages);
  const comfortFocus = cleanOptionalText(row.comfortFocus);

  return {
    id: row.id,
    name: row.name,
    specialty: row.specialty,
    bio: row.bio,
    ...(image ? { image } : {}),
    ...(credentials ? { credentials } : {}),
    ...(experienceBadge ? { experienceBadge } : {}),
    ...(experienceSummary ? { experienceSummary } : {}),
    ...(languages ? { languages } : {}),
    ...(comfortFocus ? { comfortFocus } : {}),
    serviceIds:
      row.serviceIds ?? (row.services ? row.services.map((s) => s.serviceId) : []),
    ...(row.workingHours
      ? {
          workingHours: row.workingHours.map((h) => ({
            dayOfWeek: h.dayOfWeek,
            isOff: Boolean(h.isOff),
            ...(h.startTime ? { startTime: h.startTime } : {}),
            ...(h.endTime ? { endTime: h.endTime } : {}),
          })),
        }
      : {}),
  };
}

// ==========================================
// 3. Intake Form Mappers
// ==========================================

export function toIntakeDTO(row: {
  patientEmail: string;
  phone: string;
  emergencyContact: string;
  noChangesVerified: boolean;
  insuranceEnabled: boolean;
  insuranceProvider?: string | null;
  insuranceMemberId?: string | null;
  conditions: string[];
  allergies: string[];
  medications?: string | null;
  consentSigned: boolean;
  signatureDataUrl?: string | null;
  signedByName?: string | null;
  updatedAt?: Date | string | null;
}): PatientIntakeForm {
  return {
    patientEmail: row.patientEmail,
    phone: row.phone,
    emergencyContact: row.emergencyContact,
    noChangesVerified: row.noChangesVerified,
    insuranceScaffold: {
      enabled: Boolean(row.insuranceEnabled),
      providerPlaceholder: row.insuranceProvider ?? "MetLife / Bupa / AXA Egypt",
      memberIdPlaceholder: row.insuranceMemberId ?? "EGY-99214-D",
      provider: row.insuranceProvider ?? undefined,
      memberId: row.insuranceMemberId ?? undefined,
    },
    conditions: row.conditions ?? [],
    allergies: row.allergies ?? [],
    medications: row.medications ?? "",
    consentSigned: row.consentSigned,
    signatureDataUrl: row.signatureDataUrl ?? undefined,
    signedByName: row.signedByName ?? undefined,
    updatedAt:
      row.updatedAt instanceof Date
        ? row.updatedAt.toISOString()
        : typeof row.updatedAt === "string"
        ? row.updatedAt
        : undefined,
  };
}

export function fromIntakeInput(body: {
  phone: string;
  emergencyContact: string;
  noChangesVerified?: boolean;
  insuranceScaffold?: {
    enabled?: boolean;
    providerPlaceholder?: string;
    memberIdPlaceholder?: string;
    provider?: string;
    memberId?: string;
  };
  insuranceEnabled?: boolean;
  insuranceProvider?: string;
  insuranceMemberId?: string;
  conditions?: string[];
  allergies?: string[];
  medications?: string;
  consentSigned?: boolean;
  signatureDataUrl?: string;
  signedByName?: string;
}) {
  return {
    phone: body.phone,
    emergencyContact: body.emergencyContact,
    noChangesVerified: body.noChangesVerified ?? false,
    insuranceEnabled:
      body.insuranceScaffold?.enabled ?? body.insuranceEnabled ?? false,
    insuranceProvider:
      body.insuranceScaffold?.provider ??
      body.insuranceScaffold?.providerPlaceholder ??
      body.insuranceProvider ??
      undefined,
    insuranceMemberId:
      body.insuranceScaffold?.memberId ??
      body.insuranceScaffold?.memberIdPlaceholder ??
      body.insuranceMemberId ??
      undefined,
    conditions: body.conditions ?? [],
    allergies: body.allergies ?? [],
    medications: body.medications ?? "",
    consentSigned: body.consentSigned ?? false,
    signatureDataUrl: body.signatureDataUrl ?? undefined,
    signedByName: body.signedByName ?? undefined,
  };
}

// ==========================================
// 4. Treatment Plan Mappers
// ==========================================

export function toTreatmentPlanDTO(row: {
  id: string;
  patientEmail: string;
  doctorId: string;
  createdAt: Date | string;
  status: string;
  signatureDataUrl?: string | null;
  signedByName?: string | null;
  approvedAt?: Date | string | null;
  teeth?: Array<{
    toothNumber: number;
    label: string;
    status: string;
    condition: string;
    proposedTreatment: string;
    phaseOrder?: number | null;
    xrayNote?: string | null;
  }> | null;
  phases?: Array<{
    id: string;
    order: number;
    priority: string;
    title: string;
    description: string;
    toothNumber?: number | null;
    serviceId: string;
    durationMinutes: number;
    totalFeeEgp: number;
    insuranceScaffoldNote?: string | null;
    outOfPocketEgp: number;
    scheduledAppointmentId?: string | null;
  }> | null;
}): TreatmentPlan {
  return {
    id: row.id,
    patientEmail: row.patientEmail,
    doctorId: row.doctorId,
    createdAt:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : String(row.createdAt),
    status: row.status as "proposed" | "approved",
    signatureDataUrl: row.signatureDataUrl ?? undefined,
    signedByName: row.signedByName ?? undefined,
    approvedAt:
      row.approvedAt instanceof Date
        ? row.approvedAt.toISOString()
        : typeof row.approvedAt === "string"
        ? row.approvedAt
        : undefined,
    teeth: (row.teeth ?? []).map(
      (t): ToothRecord => ({
        toothNumber: t.toothNumber,
        label: t.label,
        status: t.status as ToothRecord["status"],
        condition: t.condition,
        proposedTreatment: t.proposedTreatment,
        phaseOrder: (t.phaseOrder as 1 | 2 | 3) ?? undefined,
        xrayNote: t.xrayNote ?? undefined,
      })
    ),
    phases: (row.phases ?? []).map(
      (ph): TreatmentPhase => ({
        id: ph.id,
        order: ph.order as 1 | 2 | 3,
        priority: ph.priority as "urgent" | "restorative" | "elective",
        title: ph.title,
        description: ph.description,
        toothNumber: ph.toothNumber ?? undefined,
        serviceId: ph.serviceId,
        durationMinutes: ph.durationMinutes,
        totalFeeEgp: ph.totalFeeEgp,
        insuranceScaffoldNote: ph.insuranceScaffoldNote ?? "",
        outOfPocketEgp: ph.outOfPocketEgp,
        scheduledAppointmentId: ph.scheduledAppointmentId ?? undefined,
      })
    ),
  };
}

// ==========================================
// 5. Care Summary Mappers
// ==========================================

export function toCareSummaryDTO(row: {
  id: string;
  patientEmail: string;
  visitDate: string;
  doctorId: string;
  serviceId: string;
  whatWasDone: string;
  postOpInstructions: string[];
  prescriptions?: Array<{
    id: string;
    medication: string;
    dosage: string;
    frequency: string;
    durationDays: number;
    instructions: string;
  }> | null;
}): VisitCareSummary {
  return {
    id: row.id,
    patientEmail: row.patientEmail,
    visitDate: row.visitDate,
    doctorId: row.doctorId,
    serviceId: row.serviceId,
    whatWasDone: row.whatWasDone,
    postOpInstructions: row.postOpInstructions ?? [],
    prescriptions: (row.prescriptions ?? []).map(
      (p): PrescriptionItem => ({
        id: p.id,
        medication: p.medication,
        dosage: p.dosage,
        frequency: p.frequency,
        durationDays: p.durationDays,
        instructions: p.instructions,
      })
    ),
  };
}

// ==========================================
// 6. Invoice Mappers
// ==========================================

export function toInvoiceDTO(row: {
  id: string;
  patientEmail: string;
  issuedDate: string;
  doctorId: string;
  totalFeeEgp: number;
  paidAmountEgp: number;
  balanceEgp: number;
  status: string;
  nextInstallmentDate?: string | null;
  paymentMethod?: string | null;
  receiptNumber?: string | null;
  paidAt?: Date | string | null;
  items?: Array<{
    id: string;
    procedure: string;
    tooth?: string | null;
    feeEgp: number;
  }> | null;
}): PatientInvoice {
  return {
    id: row.id,
    patientEmail: row.patientEmail,
    issuedDate: row.issuedDate,
    doctorId: row.doctorId,
    totalFeeEgp: row.totalFeeEgp,
    paidAmountEgp: row.paidAmountEgp,
    balanceEgp: row.balanceEgp,
    status: row.status as "balance_due" | "paid",
    nextInstallmentDate: row.nextInstallmentDate ?? undefined,
    paymentMethod: (row.paymentMethod as PatientInvoice["paymentMethod"]) ?? undefined,
    receiptNumber: row.receiptNumber ?? undefined,
    paidAt:
      row.paidAt instanceof Date
        ? row.paidAt.toISOString()
        : typeof row.paidAt === "string"
        ? row.paidAt
        : undefined,
    items: (row.items ?? []).map(
      (it): InvoiceLineItem => ({
        id: it.id,
        procedure: it.procedure,
        tooth: it.tooth ?? undefined,
        feeEgp: it.feeEgp,
      })
    ),
  };
}

// ==========================================
// 7. Appointment Mappers
// ==========================================

export function toAppointmentDTO(row: {
  id: string;
  serviceId: string;
  doctorId: string;
  date: string;
  time: string;
  patientName: string;
  email: string;
  phone: string;
  status: string;
  note?: string | null;
  attendanceConfirmed?: boolean | null;
  calendarSynced?: boolean | null;
  googleEventId?: string | null;
  reasonCategory?: string | null;
}): Appointment {
  return {
    id: row.id,
    serviceId: row.serviceId,
    doctorId: row.doctorId,
    date: row.date,
    time: row.time,
    patientName: row.patientName,
    email: row.email,
    phone: row.phone,
    status: row.status as "confirmed" | "cancelled",
    note: row.note ?? undefined,
    attendanceConfirmed: row.attendanceConfirmed ?? false,
    calendarSynced: row.calendarSynced ?? false,
    googleEventId: row.googleEventId ?? undefined,
    reasonCategory: (row.reasonCategory as Appointment["reasonCategory"]) ?? undefined,
  };
}

// ==========================================
// 8. Account Mappers
// ==========================================

export function toAccountDTO(user: {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  status: string;
  createdAt: Date | string;
  doctorProfile?: {
    specialty?: string | null;
    bio?: string | null;
    image?: string | null;
    credentials?: string | null;
    experienceBadge?: string | null;
    experienceSummary?: string | null;
    languages?: string | null;
    comfortFocus?: string | null;
    services?: Array<{ serviceId: string }> | null;
  } | null;
}): Account {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    role: user.role as Account["role"],
    status: user.status as Account["status"],
    specialty: user.doctorProfile?.specialty ?? undefined,
    bio: user.doctorProfile?.bio ?? undefined,
    ...(user.doctorProfile?.image ? { image: user.doctorProfile.image } : {}),
    ...(user.doctorProfile?.credentials ? { credentials: user.doctorProfile.credentials } : {}),
    ...(user.doctorProfile?.experienceBadge
      ? { experienceBadge: user.doctorProfile.experienceBadge }
      : {}),
    ...(user.doctorProfile?.experienceSummary
      ? { experienceSummary: user.doctorProfile.experienceSummary }
      : {}),
    ...(user.doctorProfile?.languages ? { languages: user.doctorProfile.languages } : {}),
    ...(user.doctorProfile?.comfortFocus ? { comfortFocus: user.doctorProfile.comfortFocus } : {}),
    serviceIds: user.doctorProfile?.services
      ? user.doctorProfile.services.map((s) => s.serviceId)
      : undefined,
    createdAt:
      user.createdAt instanceof Date
        ? user.createdAt.toISOString().slice(0, 10)
        : String(user.createdAt).slice(0, 10),
  };
}
