import test from "node:test";
import assert from "node:assert/strict";
import {
  isoDateSchema,
  hhmmSchema,
  signatureDataUrlSchema,
  createServiceSchema,
} from "../../src/lib/clinic-schemas.ts";
import {
  toServiceDTO,
  fromServiceInput,
  toDoctorDTO,
  toIntakeDTO,
  fromIntakeInput,
  toAppointmentDTO,
  toInvoiceDTO,
} from "../../src/lib/clinic-mappers.ts";

test("isoDateSchema validates calendar dates and rejects invalid leap dates", () => {
  assert.equal(isoDateSchema.parse("2026-02-28"), "2026-02-28");
  assert.throws(() => isoDateSchema.parse("2026-02-30"), /Invalid calendar date/);
  assert.throws(() => isoDateSchema.parse("not-a-date"));
  assert.throws(() => isoDateSchema.parse("2026-13-01"));
});

test("hhmmSchema validates 24h time format", () => {
  assert.equal(hhmmSchema.parse("09:30"), "09:30");
  assert.equal(hhmmSchema.parse("23:59"), "23:59");
  assert.throws(() => hhmmSchema.parse("24:00"));
  assert.throws(() => hhmmSchema.parse("9:30"));
  assert.throws(() => hhmmSchema.parse("abc"));
});

test("signatureDataUrlSchema validates png base64 and 300,000 char cap", () => {
  const valid = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  assert.equal(signatureDataUrlSchema.parse(valid), valid);
  assert.throws(() => signatureDataUrlSchema.parse("data:image/jpeg;base64,..."));
  assert.throws(() => signatureDataUrlSchema.parse("data:image/png;base64," + "a".repeat(300_001)));
});

test("Service DTO mappers round-trip extendedDetails correctly", () => {
  const row = {
    id: "s-1",
    title: "Exam",
    description: "Dental Exam",
    durationMinutes: 45,
    category: "General",
    image: "/img.png",
    overview: "Overview text",
    procedure: "Procedure text",
    benefits: "Benefits text",
    aftercare: "Aftercare text",
  };

  const dto = toServiceDTO(row);
  assert.deepEqual(dto.extendedDetails, {
    overview: "Overview text",
    procedure: "Procedure text",
    benefits: "Benefits text",
    aftercare: "Aftercare text",
  });

  const flattened = fromServiceInput(dto);
  assert.equal(flattened.overview, "Overview text");
  assert.equal(flattened.procedure, "Procedure text");
  assert.equal(flattened.benefits, "Benefits text");
  assert.equal(flattened.aftercare, "Aftercare text");
});

test("Intake Form DTO mappers map insuranceScaffold to/from flat columns", () => {
  const row = {
    patientEmail: "test@example.com",
    phone: "+201012345678",
    emergencyContact: "Emergency Name",
    noChangesVerified: true,
    insuranceEnabled: false,
    insuranceProvider: "AXA Egypt",
    insuranceMemberId: "AXA-12345",
    conditions: ["Hypertension"],
    allergies: ["Penicillin"],
    medications: "None",
    consentSigned: true,
    signatureDataUrl: "data:image/png;base64,...",
    signedByName: "Test User",
    updatedAt: new Date("2026-03-01T10:00:00.000Z"),
  };

  const dto = toIntakeDTO(row);
  assert.equal(dto.insuranceScaffold.providerPlaceholder, "AXA Egypt");
  assert.equal(dto.insuranceScaffold.memberIdPlaceholder, "AXA-12345");
  assert.equal(dto.insuranceScaffold.enabled, false);

  const flatInput = fromIntakeInput(dto);
  assert.equal(flatInput.insuranceProvider, "AXA Egypt");
  assert.equal(flatInput.insuranceMemberId, "AXA-12345");
  assert.equal(flatInput.insuranceEnabled, false);
});

test("DTO mappers convert null to undefined for optional fields", () => {
  const apptRow = {
    id: "a-1",
    serviceId: "s-1",
    doctorId: "d-1",
    date: "2026-10-30",
    time: "10:00",
    patientName: "Patient Name",
    email: "p@example.com",
    phone: "+201000000000",
    status: "confirmed",
    note: null,
    attendanceConfirmed: null,
    calendarSynced: null,
    googleEventId: null,
    reasonCategory: null,
  };
  const apptDto = toAppointmentDTO(apptRow);
  assert.equal(apptDto.note, undefined);
  assert.equal(apptDto.googleEventId, undefined);
  assert.equal(apptDto.reasonCategory, undefined);
  assert.equal(apptDto.attendanceConfirmed, false);

  const invRow = {
    id: "inv-1",
    patientEmail: "p@example.com",
    issuedDate: "2026-10-25",
    doctorId: "d-1",
    totalFeeEgp: 1000,
    paidAmountEgp: 0,
    balanceEgp: 1000,
    status: "balance_due",
    nextInstallmentDate: null,
    paymentMethod: null,
    receiptNumber: null,
    paidAt: null,
    items: [{ id: "item-1", procedure: "Consult", tooth: null, feeEgp: 1000 }],
  };
  const invDto = toInvoiceDTO(invRow);
  assert.equal(invDto.nextInstallmentDate, undefined);
  assert.equal(invDto.paymentMethod, undefined);
  assert.equal(invDto.receiptNumber, undefined);
  assert.equal(invDto.paidAt, undefined);
  assert.equal(invDto.items[0].tooth, undefined);
});

test("Service DTO mappers round-trip bilingual fields and defaultLocale", () => {
  const row = {
    id: "s-bilingual",
    title: "Whitening",
    titleAr: "تبييض الأسنان",
    description: "Safe whitening",
    descriptionAr: "تبييض آمن للأسنان",
    defaultLocale: "bilingual",
    durationMinutes: 45,
    category: "Cosmetic Dentistry",
    image: "/img.png",
    overview: "EN overview",
    procedure: "EN procedure",
    benefits: "EN benefits",
    aftercare: "EN aftercare",
    overviewAr: "نظرة عامة",
    procedureAr: "الإجراء",
    benefitsAr: "الفوائد",
    aftercareAr: "العناية اللاحقة",
  };

  const dto = toServiceDTO(row);
  assert.equal(dto.titleAr, "تبييض الأسنان");
  assert.equal(dto.descriptionAr, "تبييض آمن للأسنان");
  assert.equal(dto.defaultLocale, "bilingual");
  assert.deepEqual(dto.extendedDetailsAr, {
    overview: "نظرة عامة",
    procedure: "الإجراء",
    benefits: "الفوائد",
    aftercare: "العناية اللاحقة",
  });

  const flattened = fromServiceInput(dto);
  assert.equal(flattened.titleAr, "تبييض الأسنان");
  assert.equal(flattened.defaultLocale, "bilingual");
  assert.equal(flattened.overviewAr, "نظرة عامة");
  assert.equal(flattened.aftercareAr, "العناية اللاحقة");

  const arabicOnly = createServiceSchema.parse({
    titleAr: "خدمة عربية فقط",
    descriptionAr: "وصف عربي فقط",
    defaultLocale: "ar",
    durationMinutes: 30,
    image: "/img.png",
  });
  assert.equal(arabicOnly.defaultLocale, "ar");
  assert.equal(arabicOnly.titleAr, "خدمة عربية فقط");
});

test("toDoctorDTO maps workingHours and strips null startTime/endTime overrides", () => {
  const dto = toDoctorDTO({
    id: "doctor-3",
    name: "Dr. Nour Samir",
    specialty: "Orthodontics",
    bio: "Bio",
    services: [{ serviceId: "service-3" }],
    workingHours: [
      { dayOfWeek: 0, isOff: false, startTime: "09:00", endTime: "14:30" },
      { dayOfWeek: 2, isOff: true, startTime: null, endTime: null },
    ],
  });
  assert.deepEqual(dto.serviceIds, ["service-3"]);
  assert.deepEqual(dto.workingHours, [
    { dayOfWeek: 0, isOff: false, startTime: "09:00", endTime: "14:30" },
    { dayOfWeek: 2, isOff: true },
  ]);
});
