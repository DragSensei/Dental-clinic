import test from "node:test";
import assert from "node:assert/strict";

// Run against test database
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/dental_reservation_test?schema=public";

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
} = await import("../src/lib/clinic-db.ts");

const { default: prisma } = await import("../src/lib/prisma.ts");

test.beforeEach(async () => {
  await prisma.appointment.deleteMany({
    where: {
      OR: [
        { patientName: { contains: "Test" } },
        { email: { contains: "test" } },
      ],
    },
  });
});

test.after(async () => {
  await prisma.appointment.deleteMany({
    where: {
      OR: [
        { patientName: { contains: "Test" } },
        { email: { contains: "test" } },
      ],
    },
  });
  await prisma.$disconnect();
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
  const doctors = await getDoctors();
  const doc = doctors[0];
  const srv = doc.serviceIds[0];
  const dates = await getAvailableDates(srv, doc.id);
  let targetDate = dates[0];
  let slots = [];
  for (const candidateDate of dates) {
    const candidateSlots = await getAvailableSlots(srv, doc.id, candidateDate);
    if (candidateSlots.length > 0) {
      targetDate = candidateDate;
      slots = candidateSlots;
      break;
    }
  }
  assert.ok(slots.length > 0, "Expected at least 1 available slot");
  const slotTime = slots[0];

  const booking = await bookAppointment({
    serviceId: srv,
    doctorId: doc.id,
    date: targetDate,
    time: slotTime,
    patientName: "Test Patient",
    email: "test.patient@example.com",
    phone: "+20 10 9999 8888",
    reasonCategory: "new-exam",
  });

  assert.equal(booking.status, "confirmed");
  assert.equal(booking.date, targetDate);
  assert.equal(booking.time, slotTime);

  // Slot should now be unavailable
  const slotsAfter = await getAvailableSlots(srv, doc.id, targetDate);
  assert.ok(!slotsAfter.includes(slotTime));

  // Trying to book same slot must throw slot_unavailable
  await assert.rejects(
    async () => {
      await bookAppointment({
        serviceId: srv,
        doctorId: doc.id,
        date: targetDate,
        time: slotTime,
        patientName: "Conflict Patient",
        email: "conflict@example.com",
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
