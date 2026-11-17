-- DropForeignKey
ALTER TABLE "patient_intake_form" DROP CONSTRAINT "patient_intake_form_patientEmail_fkey";

-- DropForeignKey
ALTER TABLE "patient_invoice" DROP CONSTRAINT "patient_invoice_patientEmail_fkey";

-- DropForeignKey
ALTER TABLE "treatment_plan" DROP CONSTRAINT "treatment_plan_patientEmail_fkey";

-- DropForeignKey
ALTER TABLE "visit_care_summary" DROP CONSTRAINT "visit_care_summary_patientEmail_fkey";

-- CreateTable
CREATE TABLE "rate_limit" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "lastRequest" BIGINT NOT NULL,

    CONSTRAINT "rate_limit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_rate_limit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "resetAt" BIGINT NOT NULL,

    CONSTRAINT "api_rate_limit_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "rate_limit_key_key" ON "rate_limit"("key");

-- CreateIndex
CREATE INDEX "api_rate_limit_resetAt_idx" ON "api_rate_limit"("resetAt");

-- AddForeignKey
ALTER TABLE "patient_intake_form" ADD CONSTRAINT "patient_intake_form_patientEmail_fkey" FOREIGN KEY ("patientEmail") REFERENCES "user"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_plan" ADD CONSTRAINT "treatment_plan_patientEmail_fkey" FOREIGN KEY ("patientEmail") REFERENCES "user"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_care_summary" ADD CONSTRAINT "visit_care_summary_patientEmail_fkey" FOREIGN KEY ("patientEmail") REFERENCES "user"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_invoice" ADD CONSTRAINT "patient_invoice_patientEmail_fkey" FOREIGN KEY ("patientEmail") REFERENCES "user"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
