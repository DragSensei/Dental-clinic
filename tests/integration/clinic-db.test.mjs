import test from "node:test";
import assert from "node:assert/strict";

import { RUN_ID, prisma, cleanup } from "./_setup.mjs";

const {
  checkDatabaseHealth,
  getServices,
  getDoctors,
  getClinicWorkingHours,
  getAvailableDates,
  getAvailableSlots,
  bookAppointment,
  canCancelAppointment,
  getPatientIntakeForm,
  getTreatmentPlan,
  getVisitCareSummaries,
  getPatientInvoices,
  getAppointments,
  payPatientInvoice,
  ClinicError,
} = await import("../../src/lib/clinic-db.ts");

test.after(async () => {
  await cleanup();
});

test("clinic-db: health check reports connected and healthy", async () => {
  const health = await checkDatabaseHealth();
  assert.equal(health.status, "healthy");
  assert.equal(health.database, "connected");
  assert.ok(health.serviceCount > 0);
});

test("clinic-db: loads services, doctors, and working hours", async () => {
  const services = await getServices();
  const doctors = await getDoctors();
  const hours = await getClinicWorkingHours();

  assert.ok(services.length >= 10);
  assert.ok(doctors.length >= 4);
  assert.equal(hours.length, 7);
  // Friday is closed
  const friday = hours.find((h) => h.dayOfWeek === 5);
  assert.equal(friday?.isClosed, true);
});

test("clinic-db: getAvailableDates excludes closed days and provides valid dates", async () => {
  const doctors = await getDoctors();
  const doc1 = doctors[0];
  const srv1 = doc1.serviceIds[0];

  const dates = await getAvailableDates(srv1, doc1.id);
  assert.ok(dates.length > 0);
  for (const date of dates) {
    const d = new Date(date);
    // Friday (5) should never be in dates
    assert.notEqual(d.getUTCDay(), 5);
  }
});

test("clinic-db: booking appointment and conflict prevention", async () => {
  const docService = await prisma.doctorService.findFirst({
    where: { service: { durationMinutes: 45 } },
    include: { doctor: true, service: true },
  });
  assert.ok(docService, "Doc service found");
  const doc = docService.doctor;
  const srv = docService.service;

  const dates = await getAvailableDates(srv.id, doc.id);
  let targetDate = dates[0];
  let slots = [];
  for (const candidateDate of dates) {
    const candidateSlots = await getAvailableSlots(srv.id, doc.id, candidateDate);
    if (candidateSlots.length > 0) {
      targetDate = candidateDate;
      slots = candidateSlots;
      break;
    }
  }
  assert.ok(slots.length > 0, "Expected at least 1 available slot");
  const slotTime = slots[0];

  const booking = await bookAppointment({
    serviceId: srv.id,
    doctorId: doc.id,
    date: targetDate,
    time: slotTime,
    patientName: `${RUN_ID} DB Test Patient`,
    email: `${RUN_ID}-dbtest@example.com`,
    phone: "+20 10 9999 8888",
    reasonCategory: "new-exam",
  });

  assert.equal(booking.status, "confirmed");
  assert.equal(booking.date, targetDate);
  assert.equal(booking.time, slotTime);

  // Slot should now be unavailable
  const slotsAfter = await getAvailableSlots(srv.id, doc.id, targetDate);
  assert.ok(!slotsAfter.includes(slotTime));

  // Trying to book same slot must throw slot_unavailable
  await assert.rejects(
    async () => {
      await bookAppointment({
        serviceId: srv.id,
        doctorId: doc.id,
        date: targetDate,
        time: slotTime,
        patientName: `${RUN_ID} Conflict Patient`,
        email: `${RUN_ID}-conflict@example.com`,
        phone: "+20 10 1111 2222",
      });
    },
    (err) => err.code === "slot_unavailable"
  );
});

test("clinic-db: canCancelAppointment calculates 24h window correctly", () => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 3);
  const dateStr = futureDate.toISOString().slice(0, 10);
  const check = canCancelAppointment(dateStr, "10:00");
  assert.equal(check.allowed, true);
  assert.ok(check.hoursRemaining >= 24);

  const pastDate = new Date();
  pastDate.setHours(pastDate.getHours() + 2); // only 2 hours away
  const datePastStr = pastDate.toISOString().slice(0, 10);
  const timePastStr = `${String(pastDate.getHours()).padStart(2, "0")}:00`;
  const checkPast = canCancelAppointment(datePastStr, timePastStr);
  assert.equal(checkPast.allowed, false);
});

test("clinic-db: retrieves Mariam's seeded patient workflows", async () => {
  const email = "mariam.a@example.com";
  const intake = await getPatientIntakeForm(email);
  assert.ok(intake);
  assert.equal(intake.patientEmail, email);
  assert.ok(intake.conditions.length > 0);

  const plan = await getTreatmentPlan(email);
  assert.ok(plan);
  assert.equal(plan.patientEmail, email);
  assert.ok(plan.teeth.length === 32);
  assert.ok(plan.phases.length > 0);

  const care = await getVisitCareSummaries(email);
  assert.ok(care.length > 0);
  assert.ok(care[0].prescriptions.length > 0);

  const invoices = await getPatientInvoices(email);
  assert.ok(invoices.length > 0);
  assert.ok(invoices[0].items.length > 0);
});

test("clinic-db: getAppointments enforces bounded scan (default 200, dynamic custom, capped at 200)", async () => {
  // 1. Default bound
  const defaultAppts = await getAppointments();
  assert.ok(Array.isArray(defaultAppts));
  assert.ok(defaultAppts.length <= 200, "Default take must not exceed 200");

  // 2. Custom dynamic bound below 200
  const singleAppt = await getAppointments({ take: 1 });
  assert.ok(Array.isArray(singleAppt));
  assert.ok(singleAppt.length <= 1, "take: 1 must return at most 1 item");

  // 3. Dynamic bound above 200 is clamped to 200 max ceiling
  const clampedAppts = await getAppointments({ take: 500 });
  assert.ok(Array.isArray(clampedAppts));
  assert.ok(clampedAppts.length <= 200, "Excessive take (500) must be clamped to 200");
});

test("clinic-db: payPatientInvoice allows only balance_due status; rejects non-payable statuses with invalid_transition", async () => {
  const doc = await prisma.doctor.findFirst();

  const patient = await prisma.user.create({
    data: {
      email: `${RUN_ID}-patient@example.com`,
      name: `${RUN_ID} Test Patient`,
      role: "patient",
    },
  });

  // Create an invoice with non-payable status: cancelled
  const cancelledInv = await prisma.patientInvoice.create({
    data: {
      id: `${RUN_ID}-inv-cancelled`,
      patientEmail: patient.email,
      doctorId: doc.id,
      issuedDate: "2026-11-01",
      totalFeeEgp: 1500,
      balanceEgp: 1500,
      status: "cancelled",
    },
  });

  // Attempting to pay cancelled invoice must throw invalid_transition
  await assert.rejects(
    async () => {
      await payPatientInvoice(cancelledInv.id, "card");
    },
    (err) => err instanceof ClinicError && err.code === "invalid_transition"
  );

  // Status must remain unchanged (not transitioned to paid)
  const afterCheck = await prisma.patientInvoice.findUnique({ where: { id: cancelledInv.id } });
  assert.equal(afterCheck?.status, "cancelled");
  assert.equal(afterCheck?.paidAmountEgp, 0);
});
