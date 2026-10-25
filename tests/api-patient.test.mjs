import test from "node:test";
import assert from "node:assert/strict";

// Run against test database
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/dental_reservation_test?schema=public";

const { GET: getIntake, PUT: putIntake } = await import(
  "../src/app/api/patient/intake/route.ts"
);
const { GET: getTreatmentPlan, POST: postTreatmentPlan } = await import(
  "../src/app/api/patient/treatment-plan/route.ts"
);
const { GET: getCare } = await import(
  "../src/app/api/patient/care/route.ts"
);
const { GET: getBilling, POST: postBilling } = await import(
  "../src/app/api/patient/billing/route.ts"
);
const { POST: postCalendar } = await import(
  "../src/app/api/google/calendar/route.ts"
);

test("api: /api/patient/intake GET and PUT for mariam.a@example.com", async () => {
  const email = "mariam.a@example.com";

  // 1. GET intake
  const getReq = new Request(`http://localhost:3000/api/patient/intake?email=${encodeURIComponent(email)}`);
  const getRes = await getIntake(getReq);
  assert.equal(getRes.status, 200);
  const getData = await getRes.json();
  assert.ok(getData.intakeForm);
  assert.equal(getData.intakeForm.patientEmail, email);

  // 2. PUT intake update
  const putReq = new Request("http://localhost:3000/api/patient/intake", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      phone: "+20 10 9876 5432",
      emergencyContact: "+20 10 1111 2222 (Brother)",
      noChangesVerified: true,
      insuranceEnabled: true,
      insuranceProvider: "MetLife Egypt",
      insuranceMemberId: "MET-987654",
      conditions: ["Penicillin allergy", "Mild asthma"],
      allergies: ["Penicillin", "Latex"],
      medications: "Ventolin inhaler as needed",
      consentSigned: true,
      signatureDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      signedByName: "Mariam Ahmed",
    }),
  });
  const putRes = await putIntake(putReq);
  assert.equal(putRes.status, 200);
  const putData = await putRes.json();
  assert.ok(putData.intakeForm);
  assert.equal(putData.intakeForm.patientEmail, email);
  assert.equal(putData.intakeForm.insuranceProvider, "MetLife Egypt");
  assert.equal(putData.intakeForm.signedByName, "Mariam Ahmed");
  assert.equal(putData.intakeForm.consentSigned, true);

  // 3. Validation: missing email returns 400
  const badReq = new Request("http://localhost:3000/api/patient/intake");
  const badRes = await getIntake(badReq);
  assert.equal(badRes.status, 400);
});

test("api: /api/patient/treatment-plan GET and POST approve", async () => {
  const email = "mariam.a@example.com";

  // 1. GET treatment plan
  const getReq = new Request(`http://localhost:3000/api/patient/treatment-plan?email=${encodeURIComponent(email)}`);
  const getRes = await getTreatmentPlan(getReq);
  assert.equal(getRes.status, 200);
  const getData = await getRes.json();
  assert.ok(getData.treatmentPlan);
  assert.equal(getData.treatmentPlan.patientEmail, email);
  assert.equal(getData.treatmentPlan.teeth.length, 32);
  assert.ok(getData.treatmentPlan.phases.length > 0);

  // 2. POST approve
  const postReq = new Request("http://localhost:3000/api/patient/treatment-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      action: "approve",
      signatureDataUrl: "data:image/png;base64,sampleApprovedSignatureData",
      signedByName: "Mariam Ahmed",
    }),
  });
  const postRes = await postTreatmentPlan(postReq);
  assert.equal(postRes.status, 200);
  const postData = await postRes.json();
  assert.ok(postData.treatmentPlan);
  assert.equal(postData.treatmentPlan.status, "approved");
  assert.equal(postData.treatmentPlan.signedByName, "Mariam Ahmed");
  assert.equal(postData.treatmentPlan.signatureDataUrl, "data:image/png;base64,sampleApprovedSignatureData");

  // 3. Validation: invalid action returns 400
  const invalidActionReq = new Request("http://localhost:3000/api/patient/treatment-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      action: "unknown_action",
    }),
  });
  const invalidActionRes = await postTreatmentPlan(invalidActionReq);
  assert.equal(invalidActionRes.status, 400);
});

test("api: /api/patient/care GET for mariam.a@example.com", async () => {
  const email = "mariam.a@example.com";

  const getReq = new Request(`http://localhost:3000/api/patient/care?email=${encodeURIComponent(email)}`);
  const getRes = await getCare(getReq);
  assert.equal(getRes.status, 200);
  const getData = await getRes.json();
  assert.ok(Array.isArray(getData.careSummaries));
  assert.ok(getData.careSummaries.length > 0);
  assert.equal(getData.careSummaries[0].patientEmail, email);
  assert.ok(getData.careSummaries[0].prescriptions.length > 0);

  // Missing email returns 400
  const badReq = new Request("http://localhost:3000/api/patient/care");
  const badRes = await getCare(badReq);
  assert.equal(badRes.status, 400);
});

test("api: /api/patient/billing GET and POST pay", async () => {
  const email = "mariam.a@example.com";

  // 1. GET invoices
  const getReq = new Request(`http://localhost:3000/api/patient/billing?email=${encodeURIComponent(email)}`);
  const getRes = await getBilling(getReq);
  assert.equal(getRes.status, 200);
  const getData = await getRes.json();
  assert.ok(Array.isArray(getData.invoices));
  assert.ok(getData.invoices.length > 0);
  const invoice = getData.invoices[0];
  assert.equal(invoice.patientEmail, email);

  // 2. POST pay
  const payReq = new Request("http://localhost:3000/api/patient/billing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      invoiceId: invoice.id,
      paymentMethod: "fawry",
    }),
  });
  const payRes = await postBilling(payReq);
  assert.equal(payRes.status, 200);
  const payData = await payRes.json();
  assert.ok(payData.invoice);
  assert.equal(payData.invoice.id, invoice.id);
  assert.equal(payData.invoice.status, "paid");
  assert.equal(payData.invoice.paymentMethod, "fawry");
  assert.equal(payData.invoice.balanceEgp, 0);
  assert.ok(payData.invoice.receiptNumber);

  // 3. Validation: missing invoiceId returns 400
  const badReq = new Request("http://localhost:3000/api/patient/billing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const badRes = await postBilling(badReq);
  assert.equal(badRes.status, 400);
});

test("api: /api/google/calendar POST creates calendar template link", async () => {
  const payload = {
    appointmentId: "apt-mariam-test-1",
    title: "Root Canal Treatment - Phase 1",
    description: "Upper right molar endodontic treatment with Dr. Sarah",
    startDateTime: "2026-11-05T10:00:00.000Z",
    durationMinutes: 60,
    patientEmail: "mariam.a@example.com",
    doctorName: "Dr. Sarah Mostafa",
  };

  const postReq = new Request("http://localhost:3000/api/google/calendar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const postRes = await postCalendar(postReq);
  assert.equal(postRes.status, 200);
  const postData = await postRes.json();
  assert.equal(postData.success, true);
  assert.ok(typeof postData.url === "string");
  assert.ok(postData.url.startsWith("https://calendar.google.com/calendar/render?action=TEMPLATE"));
  assert.ok(postData.url.includes("Root%20Canal"));
  assert.ok(postData.hasOwnProperty("eventId"));
});
