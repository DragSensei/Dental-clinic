import test from "node:test";
import assert from "node:assert/strict";

import { RUN_ID, prisma, createUserWithSession, req, cleanup } from "./_setup.mjs";

const { GET: getIntake, PUT: putIntake } = await import(
  "../../src/app/api/patient/intake/route.ts"
);
const { GET: getTreatmentPlan, POST: postTreatmentPlan } = await import(
  "../../src/app/api/patient/treatment-plan/route.ts"
);
const { GET: getCare } = await import(
  "../../src/app/api/patient/care/route.ts"
);
const { GET: getBilling, POST: postBilling } = await import(
  "../../src/app/api/patient/billing/route.ts"
);
const { POST: postCalendar } = await import(
  "../../src/app/api/google/calendar/route.ts"
);

test.after(async () => {
  await cleanup();
});

test("api: /api/patient/intake GET and PUT with authenticated patient", async () => {
  const patient = await createUserWithSession("patient", "patient-intake");

  // 1. PUT intake update
  const putReq = req("/api/patient/intake", {
    method: "PUT",
    cookie: patient.cookie,
    body: {
      email: patient.email,
      phone: "+20 10 9876 5432",
      emergencyContact: "+20 10 1111 2222 (Brother)",
      noChangesVerified: true,
      insuranceScaffold: {
        enabled: true,
        provider: "MetLife Egypt",
        memberId: "MET-987654",
      },
      conditions: ["Penicillin allergy", "Mild asthma"],
      allergies: ["Penicillin", "Latex"],
      medications: "Ventolin inhaler as needed",
      consentSigned: true,
      signatureDataUrl:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      signedByName: "Patient Name",
    },
  });
  const putRes = await putIntake(putReq);
  assert.equal(putRes.status, 200);
  const putData = await putRes.json();
  assert.ok(putData.intakeForm);
  assert.equal(putData.intakeForm.patientEmail, patient.email);
  assert.equal(putData.intakeForm.insuranceScaffold.provider, "MetLife Egypt");
  assert.equal(putData.intakeForm.consentSigned, true);

  // 2. GET intake
  const getReq = req("/api/patient/intake", { cookie: patient.cookie });
  const getRes = await getIntake(getReq);
  assert.equal(getRes.status, 200);
  const getData = await getRes.json();
  assert.ok(getData.intakeForm);
  assert.equal(getData.intakeForm.patientEmail, patient.email);
});

test("api: /api/patient/treatment-plan GET and POST approve", async () => {
  const patient = await createUserWithSession("patient", "patient-plan");
  const doc = await prisma.doctor.findFirst();

  const plan = await prisma.treatmentPlan.create({
    data: {
      patientEmail: patient.email,
      doctorId: doc.id,
      status: "proposed",
      teeth: {
        create: [
          {
            toothNumber: 16,
            label: "Upper Right First Molar",
            status: "urgent",
            condition: "Deep caries",
            proposedTreatment: "Root canal therapy",
          },
        ],
      },
    },
  });

  // 1. GET
  const getReq = req("/api/patient/treatment-plan", { cookie: patient.cookie });
  const getRes = await getTreatmentPlan(getReq);
  assert.equal(getRes.status, 200);
  const getData = await getRes.json();
  assert.ok(getData.treatmentPlan);
  assert.equal(getData.treatmentPlan.id, plan.id);
  assert.equal(getData.treatmentPlan.teeth.length, 1);

  // 2. POST approve
  const postReq = req("/api/patient/treatment-plan", {
    method: "POST",
    cookie: patient.cookie,
    body: {
      planId: plan.id,
      action: "approve",
      signatureDataUrl:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      signedByName: "Patient Name",
    },
  });
  const postRes = await postTreatmentPlan(postReq);
  assert.equal(postRes.status, 200);
  const postData = await postRes.json();
  assert.equal(postData.treatmentPlan.status, "approved");
});

test("api: /api/patient/care GET", async () => {
  const patient = await createUserWithSession("patient", "patient-care");
  const doc = await prisma.doctor.findFirst();
  const srv = await prisma.service.findFirst();

  await prisma.visitCareSummary.create({
    data: {
      patientEmail: patient.email,
      visitDate: "2026-10-20",
      doctorId: doc.id,
      serviceId: srv.id,
      whatWasDone: "Initial exam and scaling",
      postOpInstructions: ["Rinse with salt water"],
      prescriptions: {
        create: [
          {
            medication: "Amoxicillin 500mg",
            dosage: "1 capsule",
            frequency: "Every 8 hours",
            durationDays: 5,
            instructions: "Take with food",
          },
        ],
      },
    },
  });

  const getReq = req("/api/patient/care", { cookie: patient.cookie });
  const getRes = await getCare(getReq);
  assert.equal(getRes.status, 200);
  const data = await getRes.json();
  assert.ok(Array.isArray(data.careSummaries));
  assert.equal(data.careSummaries.length, 1);
  assert.equal(data.careSummaries[0].prescriptions.length, 1);
});

test("api: /api/patient/billing GET and POST pay", async () => {
  const patient = await createUserWithSession("patient", "patient-billing");
  const doc = await prisma.doctor.findFirst();

  const inv = await prisma.patientInvoice.create({
    data: {
      id: `${RUN_ID}-inv-pay`,
      patientEmail: patient.email,
      doctorId: doc.id,
      issuedDate: "2026-10-25",
      totalFeeEgp: 1800,
      balanceEgp: 1800,
      status: "balance_due",
      items: {
        create: [
          { procedure: "Direct Composite Restoration", feeEgp: 1800 },
        ],
      },
    },
  });

  // 1. GET
  const getReq = req("/api/patient/billing", { cookie: patient.cookie });
  const getRes = await getBilling(getReq);
  assert.equal(getRes.status, 200);
  const getData = await getRes.json();
  assert.ok(Array.isArray(getData.invoices));
  assert.equal(getData.invoices.length, 1);

  // 2. POST pay
  const payReq = req("/api/patient/billing", {
    method: "POST",
    cookie: patient.cookie,
    body: {
      invoiceId: inv.id,
      paymentMethod: "apple_pay",
    },
  });
  const payRes = await postBilling(payReq);
  assert.equal(payRes.status, 200);
  const payData = await payRes.json();
  assert.equal(payData.invoice.status, "paid");
  assert.ok(payData.invoice.receiptNumber);
});

test("api: /api/google/calendar POST creates calendar template link for authenticated user", async () => {
  const patient = await createUserWithSession("patient", "patient-cal");
  const postReq = req("/api/google/calendar", {
    method: "POST",
    cookie: patient.cookie,
    body: {
      title: "Dental Appointment",
      description: "Regular checkup",
      date: "2026-11-15",
      time: "10:30",
      durationMinutes: 45,
      doctorName: "Dr. Karim Hany",
      location: "BlueHaven Dental Clinic",
    },
  });
  const postRes = await postCalendar(postReq);
  assert.equal(postRes.status, 200);
  const postData = await postRes.json();
  assert.equal(postData.success, true);
  assert.ok(postData.templateUrl || postData.url);
});
