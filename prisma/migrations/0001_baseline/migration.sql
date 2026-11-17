-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'patient',
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "banReason" TEXT,
    "banExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "impersonatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleAr" TEXT,
    "description" TEXT NOT NULL,
    "descriptionAr" TEXT,
    "defaultLocale" TEXT NOT NULL DEFAULT 'bilingual',
    "durationMinutes" INTEGER NOT NULL DEFAULT 45,
    "category" TEXT NOT NULL DEFAULT 'Preventive Care',
    "image" TEXT NOT NULL,
    "overview" TEXT,
    "overviewAr" TEXT,
    "procedure" TEXT,
    "procedureAr" TEXT,
    "benefits" TEXT,
    "benefitsAr" TEXT,
    "aftercare" TEXT,
    "aftercareAr" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_service" (
    "doctorId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "doctor_service_pkey" PRIMARY KEY ("doctorId","serviceId")
);

-- CreateTable
CREATE TABLE "clinic_working_hours" (
    "id" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "startTime" TEXT NOT NULL DEFAULT '09:00',
    "endTime" TEXT NOT NULL DEFAULT '16:45',
    "slotIntervalMinutes" INTEGER NOT NULL DEFAULT 45,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_working_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_working_hours" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "isOff" BOOLEAN NOT NULL DEFAULT false,
    "startTime" TEXT,
    "endTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_working_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointment" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 45,
    "patientName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "note" TEXT,
    "attendanceConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmedAt" TIMESTAMP(3),
    "calendarSynced" BOOLEAN NOT NULL DEFAULT false,
    "googleEventId" TEXT,
    "reasonCategory" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_intake_form" (
    "id" TEXT NOT NULL,
    "patientEmail" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "emergencyContact" TEXT NOT NULL,
    "noChangesVerified" BOOLEAN NOT NULL DEFAULT false,
    "insuranceEnabled" BOOLEAN NOT NULL DEFAULT false,
    "insuranceProvider" TEXT,
    "insuranceMemberId" TEXT,
    "conditions" TEXT[],
    "allergies" TEXT[],
    "medications" TEXT,
    "consentSigned" BOOLEAN NOT NULL DEFAULT false,
    "signatureDataUrl" TEXT,
    "signedByName" TEXT,
    "signedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_intake_form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treatment_plan" (
    "id" TEXT NOT NULL,
    "patientEmail" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "signatureDataUrl" TEXT,
    "signedByName" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treatment_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tooth_record" (
    "id" TEXT NOT NULL,
    "treatmentPlanId" TEXT NOT NULL,
    "toothNumber" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "proposedTreatment" TEXT NOT NULL,
    "phaseOrder" INTEGER,
    "xrayNote" TEXT,

    CONSTRAINT "tooth_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treatment_phase" (
    "id" TEXT NOT NULL,
    "treatmentPlanId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "priority" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "toothNumber" INTEGER,
    "serviceId" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 45,
    "totalFeeEgp" INTEGER NOT NULL,
    "insuranceScaffoldNote" TEXT,
    "outOfPocketEgp" INTEGER NOT NULL,
    "scheduledAppointmentId" TEXT,

    CONSTRAINT "treatment_phase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_care_summary" (
    "id" TEXT NOT NULL,
    "patientEmail" TEXT NOT NULL,
    "visitDate" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "whatWasDone" TEXT NOT NULL,
    "postOpInstructions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visit_care_summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescription_item" (
    "id" TEXT NOT NULL,
    "visitCareSummaryId" TEXT NOT NULL,
    "medication" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "instructions" TEXT NOT NULL,

    CONSTRAINT "prescription_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_invoice" (
    "id" TEXT NOT NULL,
    "patientEmail" TEXT NOT NULL,
    "issuedDate" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "totalFeeEgp" INTEGER NOT NULL,
    "paidAmountEgp" INTEGER NOT NULL DEFAULT 0,
    "balanceEgp" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'balance_due',
    "nextInstallmentDate" TEXT,
    "paymentMethod" TEXT,
    "receiptNumber" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_line_item" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "procedure" TEXT NOT NULL,
    "tooth" TEXT,
    "feeEgp" INTEGER NOT NULL,

    CONSTRAINT "invoice_line_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_userId_key" ON "doctor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "clinic_working_hours_dayOfWeek_key" ON "clinic_working_hours"("dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_working_hours_doctorId_dayOfWeek_key" ON "doctor_working_hours"("doctorId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "appointment_doctorId_date_status_idx" ON "appointment"("doctorId", "date", "status");

-- CreateIndex
CREATE INDEX "appointment_email_idx" ON "appointment"("email");

-- CreateIndex
CREATE UNIQUE INDEX "patient_intake_form_patientEmail_key" ON "patient_intake_form"("patientEmail");

-- CreateIndex
CREATE UNIQUE INDEX "treatment_plan_patientEmail_key" ON "treatment_plan"("patientEmail");

-- CreateIndex
CREATE UNIQUE INDEX "tooth_record_treatmentPlanId_toothNumber_key" ON "tooth_record"("treatmentPlanId", "toothNumber");

-- CreateIndex
CREATE INDEX "visit_care_summary_patientEmail_idx" ON "visit_care_summary"("patientEmail");

-- CreateIndex
CREATE INDEX "patient_invoice_patientEmail_idx" ON "patient_invoice"("patientEmail");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor" ADD CONSTRAINT "doctor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_service" ADD CONSTRAINT "doctor_service_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_service" ADD CONSTRAINT "doctor_service_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_working_hours" ADD CONSTRAINT "doctor_working_hours_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_intake_form" ADD CONSTRAINT "patient_intake_form_patientEmail_fkey" FOREIGN KEY ("patientEmail") REFERENCES "user"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_plan" ADD CONSTRAINT "treatment_plan_patientEmail_fkey" FOREIGN KEY ("patientEmail") REFERENCES "user"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_plan" ADD CONSTRAINT "treatment_plan_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tooth_record" ADD CONSTRAINT "tooth_record_treatmentPlanId_fkey" FOREIGN KEY ("treatmentPlanId") REFERENCES "treatment_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_phase" ADD CONSTRAINT "treatment_phase_treatmentPlanId_fkey" FOREIGN KEY ("treatmentPlanId") REFERENCES "treatment_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_phase" ADD CONSTRAINT "treatment_phase_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_phase" ADD CONSTRAINT "treatment_phase_scheduledAppointmentId_fkey" FOREIGN KEY ("scheduledAppointmentId") REFERENCES "appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_care_summary" ADD CONSTRAINT "visit_care_summary_patientEmail_fkey" FOREIGN KEY ("patientEmail") REFERENCES "user"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_care_summary" ADD CONSTRAINT "visit_care_summary_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_care_summary" ADD CONSTRAINT "visit_care_summary_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_item" ADD CONSTRAINT "prescription_item_visitCareSummaryId_fkey" FOREIGN KEY ("visitCareSummaryId") REFERENCES "visit_care_summary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_invoice" ADD CONSTRAINT "patient_invoice_patientEmail_fkey" FOREIGN KEY ("patientEmail") REFERENCES "user"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_invoice" ADD CONSTRAINT "patient_invoice_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line_item" ADD CONSTRAINT "invoice_line_item_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "patient_invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

