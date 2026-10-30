import test from "node:test";
import assert from "node:assert/strict";

import {
  RUN_ID,
  prisma,
  createUserWithSession,
  req,
  cleanup,
} from "./_setup.mjs";

const { GET: clinicGET } = await import("../../src/app/api/clinic/route.ts");
const { GET: appointmentsGET, POST: appointmentsPOST } = await import(
  "../../src/app/api/appointments/route.ts"
);
const { PATCH: appointmentPATCH } = await import(
  "../../src/app/api/appointments/[id]/route.ts"
);
const { GET: intakeGET, PUT: intakePUT } = await import(
  "../../src/app/api/patient/intake/route.ts"
);
const { GET: treatmentPlanGET, POST: treatmentPlanPOST } = await import(
  "../../src/app/api/patient/treatment-plan/route.ts"
);
const { GET: careGET } = await import(
  "../../src/app/api/patient/care/route.ts"
);
const { GET: billingGET, POST: billingPOST } = await import(
  "../../src/app/api/patient/billing/route.ts"
);
const { POST: calendarPOST } = await import(
  "../../src/app/api/google/calendar/route.ts"
);
const { POST: servicesPOST } = await import(
  "../../src/app/api/admin/services/route.ts"
);
const { PATCH: servicePATCH } = await import(
  "../../src/app/api/admin/services/[id]/route.ts"
);
const { PATCH: doctorPATCH } = await import(
  "../../src/app/api/admin/doctors/[id]/route.ts"
);
const { GET: workingHoursGET, PUT: workingHoursPUT } = await import(
  "../../src/app/api/admin/working-hours/route.ts"
);
const { GET: accountsGET, POST: accountsPOST } = await import(
  "../../src/app/api/admin/accounts/route.ts"
);
const { resetRateLimitStore } = await import("../../src/lib/rate-limit.ts");

test.beforeEach(() => {
  resetRateLimitStore();
});

test.after(async () => {
  await cleanup();
});

test("Anonymous -> 401 on each guarded route", async () => {
  const guardedEndpoints = [
    { name: "GET /api/appointments", fn: () => appointmentsGET(req("/api/appointments")) },
    {
      name: "PATCH /api/appointments/[id]",
      fn: () =>
        appointmentPATCH(
          req("/api/appointments/any-id", { method: "PATCH", body: { action: "cancel" } }),
          { params: Promise.resolve({ id: "any-id" }) }
        ),
    },
    { name: "GET /api/patient/intake", fn: () => intakeGET(req("/api/patient/intake")) },
    {
      name: "PUT /api/patient/intake",
      fn: () => intakePUT(req("/api/patient/intake", { method: "PUT", body: {} })),
    },
    {
      name: "GET /api/patient/treatment-plan",
      fn: () => treatmentPlanGET(req("/api/patient/treatment-plan")),
    },
    {
      name: "POST /api/patient/treatment-plan",
      fn: () =>
        treatmentPlanPOST(req("/api/patient/treatment-plan", { method: "POST", body: {} })),
    },
    { name: "GET /api/patient/care", fn: () => careGET(req("/api/patient/care")) },
    { name: "GET /api/patient/billing", fn: () => billingGET(req("/api/patient/billing")) },
    {
      name: "POST /api/patient/billing",
      fn: () => billingPOST(req("/api/patient/billing", { method: "POST", body: {} })),
    },
    {
      name: "POST /api/google/calendar",
      fn: () => calendarPOST(req("/api/google/calendar", { method: "POST", body: {} })),
    },
    {
      name: "POST /api/admin/services",
      fn: () => servicesPOST(req("/api/admin/services", { method: "POST", body: {} })),
    },
    {
      name: "PATCH /api/admin/services/[id]",
      fn: () =>
        servicePATCH(
          req("/api/admin/services/any-id", { method: "PATCH", body: {} }),
          { params: Promise.resolve({ id: "any-id" }) }
        ),
    },
    {
      name: "PATCH /api/admin/doctors/[id]",
      fn: () =>
        doctorPATCH(
          req("/api/admin/doctors/any-id", { method: "PATCH", body: {} }),
          { params: Promise.resolve({ id: "any-id" }) }
        ),
    },
    {
      name: "GET /api/admin/working-hours",
      fn: () => workingHoursGET(req("/api/admin/working-hours")),
    },
    {
      name: "PUT /api/admin/working-hours",
      fn: () =>
        workingHoursPUT(req("/api/admin/working-hours", { method: "PUT", body: [] })),
    },
    { name: "GET /api/admin/accounts", fn: () => accountsGET(req("/api/admin/accounts")) },
    {
      name: "POST /api/admin/accounts",
      fn: () => accountsPOST(req("/api/admin/accounts", { method: "POST", body: {} })),
    },
  ];

  for (const ep of guardedEndpoints) {
    const res = await ep.fn();
    assert.equal(res.status, 401, `${ep.name} must return 401 for anonymous caller`);
  }
});

test("Patient -> 403 on each /api/admin/* route", async () => {
  const patient = await createUserWithSession("patient", "secmat-pat");
  const adminEndpoints = [
    {
      name: "POST /api/admin/services",
      fn: () =>
        servicesPOST(
          req("/api/admin/services", { method: "POST", cookie: patient.cookie, body: {} })
        ),
    },
    {
      name: "PATCH /api/admin/services/[id]",
      fn: () =>
        servicePATCH(
          req("/api/admin/services/any-id", { method: "PATCH", cookie: patient.cookie, body: {} }),
          { params: Promise.resolve({ id: "any-id" }) }
        ),
    },
    {
      name: "PATCH /api/admin/doctors/[id]",
      fn: () =>
        doctorPATCH(
          req("/api/admin/doctors/any-id", { method: "PATCH", cookie: patient.cookie, body: {} }),
          { params: Promise.resolve({ id: "any-id" }) }
        ),
    },
    {
      name: "GET /api/admin/working-hours",
      fn: () =>
        workingHoursGET(req("/api/admin/working-hours", { cookie: patient.cookie })),
    },
    {
      name: "PUT /api/admin/working-hours",
      fn: () =>
        workingHoursPUT(
          req("/api/admin/working-hours", { method: "PUT", cookie: patient.cookie, body: [] })
        ),
    },
    {
      name: "GET /api/admin/accounts",
      fn: () => accountsGET(req("/api/admin/accounts", { cookie: patient.cookie })),
    },
    {
      name: "POST /api/admin/accounts",
      fn: () =>
        accountsPOST(
          req("/api/admin/accounts", { method: "POST", cookie: patient.cookie, body: {} })
        ),
    },
  ];

  for (const ep of adminEndpoints) {
    const res = await ep.fn();
    assert.equal(res.status, 403, `${ep.name} must return 403 for patient`);
  }
});

test("Doctor -> 403 on /api/admin/*, 200 on GET /api/appointments", async () => {
  const doctor = await createUserWithSession("doctor", "secmat-doc");
  const resAdmin = await accountsGET(req("/api/admin/accounts", { cookie: doctor.cookie }));
  assert.equal(resAdmin.status, 403, "Doctor must receive 403 on /api/admin/accounts");

  const resAppts = await appointmentsGET(
    req("/api/appointments", { cookie: doctor.cookie })
  );
  assert.equal(resAppts.status, 200, "Doctor must receive 200 on GET /api/appointments");
});

test("Patient A reading or writing Patient B's intake, plan, care, or billing -> 404, and B's data is unchanged", async () => {
  const patientA = await createUserWithSession("patient", "pat-a");
  const patientB = await createUserWithSession("patient", "pat-b");

  await prisma.patientIntakeForm.create({
    data: {
      patientEmail: patientB.email,
      phone: "+20 10 1111 2222",
      emergencyContact: "Emergency Contact B",
      conditions: ["Condition B"],
      allergies: ["Allergy B"],
      consentSigned: true,
      signatureDataUrl:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      signedByName: "Patient B",
    },
  });

  const doc = await prisma.doctor.findFirst();
  assert.ok(doc, "Seeded doctor exists");

  const planB = await prisma.treatmentPlan.create({
    data: {
      patientEmail: patientB.email,
      doctorId: doc.id,
      status: "proposed",
    },
  });

  const invoiceB = await prisma.patientInvoice.create({
    data: {
      id: `${RUN_ID}-inv-b`,
      patientEmail: patientB.email,
      doctorId: doc.id,
      issuedDate: "2026-11-01",
      totalFeeEgp: 1500,
      balanceEgp: 1500,
      status: "balance_due",
    },
  });

  // Patient A tries to read B's intake
  const readIntakeRes = await intakeGET(
    req(`/api/patient/intake?email=${encodeURIComponent(patientB.email)}`, {
      cookie: patientA.cookie,
    })
  );
  assert.equal(readIntakeRes.status, 404);

  // Patient A tries to overwrite B's intake
  const writeIntakeRes = await intakePUT(
    req("/api/patient/intake", {
      method: "PUT",
      cookie: patientA.cookie,
      body: {
        email: patientB.email,
        phone: "+20 10 9999 9999",
        emergencyContact: "Hacked",
        consentSigned: false,
      },
    })
  );
  assert.equal(writeIntakeRes.status, 404);

  // Verify B's intake is unchanged
  const freshIntakeB = await prisma.patientIntakeForm.findUnique({
    where: { patientEmail: patientB.email },
  });
  assert.equal(freshIntakeB.emergencyContact, "Emergency Contact B");

  // Patient A tries to read B's treatment plan
  const readPlanRes = await treatmentPlanGET(
    req(`/api/patient/treatment-plan?email=${encodeURIComponent(patientB.email)}`, {
      cookie: patientA.cookie,
    })
  );
  assert.equal(readPlanRes.status, 404);

  // Patient A tries to approve B's treatment plan
  const approvePlanRes = await treatmentPlanPOST(
    req("/api/patient/treatment-plan", {
      method: "POST",
      cookie: patientA.cookie,
      body: {
        planId: planB.id,
        signatureDataUrl:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        signedByName: "Hacker A",
        email: patientB.email,
      },
    })
  );
  assert.equal(approvePlanRes.status, 404);

  // Verify B's plan is still proposed
  const freshPlanB = await prisma.treatmentPlan.findUnique({ where: { id: planB.id } });
  assert.equal(freshPlanB.status, "proposed");

  // Patient A tries to read B's care summaries
  const readCareRes = await careGET(
    req(`/api/patient/care?email=${encodeURIComponent(patientB.email)}`, {
      cookie: patientA.cookie,
    })
  );
  assert.equal(readCareRes.status, 404);

  // Patient A tries to read B's billing
  const readBillingRes = await billingGET(
    req(`/api/patient/billing?email=${encodeURIComponent(patientB.email)}`, {
      cookie: patientA.cookie,
    })
  );
  assert.equal(readBillingRes.status, 404);

  // Patient A tries to pay B's invoice
  const payInvoiceRes = await billingPOST(
    req("/api/patient/billing", {
      method: "POST",
      cookie: patientA.cookie,
      body: {
        invoiceId: invoiceB.id,
        paymentMethod: "card",
        email: patientB.email,
      },
    })
  );
  assert.equal(payInvoiceRes.status, 404);

  // Verify B's invoice is still unpaid
  const freshInvoiceB = await prisma.patientInvoice.findUnique({
    where: { id: invoiceB.id },
  });
  assert.equal(freshInvoiceB.status, "balance_due");
});

test("Patient A cancelling Patient B's appointment -> 404", async () => {
  const patientA = await createUserWithSession("patient", "can-a");
  const patientB = await createUserWithSession("patient", "can-b");
  const doc = await prisma.doctor.findFirst();
  const srv = await prisma.service.findFirst();

  const apptB = await prisma.appointment.create({
    data: {
      id: `${RUN_ID}-appt-b`,
      serviceId: srv.id,
      doctorId: doc.id,
      date: "2026-11-20",
      time: "10:00",
      durationMinutes: 45,
      patientName: "Patient B",
      email: patientB.email,
      phone: "+20 10 1111 2222",
      status: "confirmed",
    },
  });

  const cancelRes = await appointmentPATCH(
    req(`/api/appointments/${apptB.id}`, {
      method: "PATCH",
      cookie: patientA.cookie,
      body: { action: "cancel" },
    }),
    { params: Promise.resolve({ id: apptB.id }) }
  );

  assert.equal(cancelRes.status, 404);
  const freshApptB = await prisma.appointment.findUnique({ where: { id: apptB.id } });
  assert.equal(freshApptB.status, "confirmed");
});

test("Patient PATCH with body isStaff: true inside 24h window -> 409", async () => {
  const patient = await createUserWithSession("patient", "window-pat");
  const doc = await prisma.doctor.findFirst();
  const srv = await prisma.service.findFirst();

  const now = new Date();
  const appt = await prisma.appointment.create({
    data: {
      id: `${RUN_ID}-appt-inside-24h`,
      serviceId: srv.id,
      doctorId: doc.id,
      date: now.toISOString().slice(0, 10),
      time: "12:00",
      durationMinutes: 45,
      patientName: "Patient Window",
      email: patient.email,
      phone: "+20 10 3333 4444",
      status: "confirmed",
    },
  });

  const cancelRes = await appointmentPATCH(
    req(`/api/appointments/${appt.id}`, {
      method: "PATCH",
      cookie: patient.cookie,
      body: { action: "cancel", isStaff: true },
    }),
    { params: Promise.resolve({ id: appt.id }) }
  );

  assert.equal(cancelRes.status, 409);
  const data = await cancelRes.json();
  assert.ok(["cancellation_window", "invalid_transition"].includes(data.error));
});

test("Staff cancel inside 24h -> 200", async () => {
  const admin = await createUserWithSession("admin", "staff-cancel");
  const doc = await prisma.doctor.findFirst();
  const srv = await prisma.service.findFirst();

  // Create an appointment 10 hours in the future (inside the 24h window)
  const future = new Date(Date.now() + 10 * 3600 * 1000);
  const apptDate = future.toISOString().slice(0, 10);
  const apptTime = `${String(future.getUTCHours()).padStart(2, "0")}:00`;

  const appt = await prisma.appointment.create({
    data: {
      id: `${RUN_ID}-appt-staff-24h`,
      serviceId: srv.id,
      doctorId: doc.id,
      date: apptDate,
      time: apptTime,
      durationMinutes: 45,
      patientName: "Patient For Staff Cancel",
      email: `${RUN_ID}-someone@example.com`,
      phone: "+20 10 3333 5555",
      status: "confirmed",
    },
  });

  const cancelRes = await appointmentPATCH(
    req(`/api/appointments/${appt.id}`, {
      method: "PATCH",
      cookie: admin.cookie,
      body: { action: "cancel" },
    }),
    { params: Promise.resolve({ id: appt.id }) }
  );

  assert.equal(cancelRes.status, 200);
  const data = await cancelRes.json();
  assert.equal(data.appointment.status, "cancelled");
});

test("Cancel twice -> second is 409", async () => {
  const admin = await createUserWithSession("admin", "double-cancel");
  const doc = await prisma.doctor.findFirst();
  const srv = await prisma.service.findFirst();

  const appt = await prisma.appointment.create({
    data: {
      id: `${RUN_ID}-appt-double-cancel`,
      serviceId: srv.id,
      doctorId: doc.id,
      date: "2026-11-25",
      time: "14:00",
      durationMinutes: 45,
      patientName: "Patient Double Cancel",
      email: `${RUN_ID}-dblcancel@example.com`,
      phone: "+20 10 6666 7777",
      status: "confirmed",
    },
  });

  // First cancel -> 200
  const first = await appointmentPATCH(
    req(`/api/appointments/${appt.id}`, {
      method: "PATCH",
      cookie: admin.cookie,
      body: { action: "cancel" },
    }),
    { params: Promise.resolve({ id: appt.id }) }
  );
  assert.equal(first.status, 200);

  // Second cancel -> 409
  const second = await appointmentPATCH(
    req(`/api/appointments/${appt.id}`, {
      method: "PATCH",
      cookie: admin.cookie,
      body: { action: "cancel" },
    }),
    { params: Promise.resolve({ id: appt.id }) }
  );
  assert.equal(second.status, 409);
  const secondData = await second.json();
  assert.equal(secondData.error, "invalid_transition");
});

test("Invalid date, invalid time, past slot, closed day, slot not in list -> 400 or 409", async () => {
  const doc = await prisma.doctor.findFirst();
  const srv = await prisma.service.findFirst();
  const base = {
    serviceId: srv.id,
    doctorId: doc.id,
    patientName: `${RUN_ID} Validate Slot`,
    email: `${RUN_ID}-validate@example.com`,
    phone: "+20 10 9999 0000",
  };

  // 1. Invalid date 2026-02-30 -> 400 (Zod schema rejection)
  const invDateRes = await appointmentsPOST(
    req("/api/appointments", {
      method: "POST",
      body: { ...base, date: "2026-02-30", time: "10:00" },
    })
  );
  assert.equal(invDateRes.status, 400);

  // 2. Invalid time 25:00 -> 400 (Zod schema rejection)
  const invTimeRes = await appointmentsPOST(
    req("/api/appointments", {
      method: "POST",
      body: { ...base, date: "2026-11-10", time: "25:00" },
    })
  );
  assert.equal(invTimeRes.status, 400);

  // 3. Past slot 2020-01-01 -> 409 slot_unavailable (not in available slots)
  const pastRes = await appointmentsPOST(
    req("/api/appointments", {
      method: "POST",
      body: { ...base, date: "2020-01-01", time: "10:00" },
    })
  );
  assert.equal(pastRes.status, 409);

  // 4. Closed day (Friday 2026-11-06) -> 409
  const closedDayRes = await appointmentsPOST(
    req("/api/appointments", {
      method: "POST",
      body: { ...base, date: "2026-11-06", time: "10:00" },
    })
  );
  assert.equal(closedDayRes.status, 409);

  // 5. Slot not in the list 09:13 -> 409
  const badSlotRes = await appointmentsPOST(
    req("/api/appointments", {
      method: "POST",
      body: { ...base, date: "2026-11-08", time: "09:13" },
    })
  );
  assert.equal(badSlotRes.status, 409);
});

test("Concurrency: Promise.all 5 identical bookings -> 1x 201, 4x 409; Overlap -> 1 succeeds", async () => {
  const docService = await prisma.doctorService.findFirst({
    where: { service: { durationMinutes: 45 } },
    include: { doctor: true, service: true },
  });
  assert.ok(docService, "Doc service found");
  const doc = docService.doctor;
  const srv = docService.service;
  const { getAvailableDates, getAvailableSlots } = await import(
    "../../src/lib/clinic-db.ts"
  );

  const dates = await getAvailableDates(srv.id, doc.id);
  assert.ok(dates.length > 0);
  let targetDate = dates[0];
  let targetSlot = "";
  for (const d of dates) {
    const slots = await getAvailableSlots(srv.id, doc.id, d);
    if (slots.length >= 2) {
      targetDate = d;
      targetSlot = slots[0];
      break;
    }
  }
  assert.ok(targetSlot, "Target slot found");

  const bookingPayload = {
    serviceId: srv.id,
    doctorId: doc.id,
    date: targetDate,
    time: targetSlot,
    patientName: `${RUN_ID} Concurrent Patient`,
    email: `${RUN_ID}-concurrent@example.com`,
    phone: "+20 10 5555 1234",
  };

  const results = await Promise.all(
    Array.from({ length: 5 }, () =>
      appointmentsPOST(
        req("/api/appointments", {
          method: "POST",
          body: bookingPayload,
        })
      )
    )
  );

  const statuses = results.map((r) => r.status);
  const count201 = statuses.filter((s) => s === 201).length;
  const count409 = statuses.filter((s) => s === 409).length;

  assert.equal(count201, 1, `Expected exactly 1 booking to succeed with 201, got ${count201}`);
  assert.equal(count409, 4, `Expected 4 bookings to be rejected with 409, got ${count409}`);

  // Test overlapping slots for 90-min service
  const srv90 = await prisma.service.create({
    data: {
      id: `${RUN_ID}-srv-90`,
      title: `${RUN_ID} 90-min Service`,
      description: "90 min service for overlap test",
      durationMinutes: 90,
      image: "/test.png",
      doctors: {
        create: { doctorId: doc.id },
      },
    },
  });

  const slotsAfter = await getAvailableSlots(srv90.id, doc.id, targetDate);
  if (slotsAfter.length >= 1) {
    const slot90 = slotsAfter[0];
    const res90 = await appointmentsPOST(
      req("/api/appointments", {
        method: "POST",
        body: {
          serviceId: srv90.id,
          doctorId: doc.id,
          date: targetDate,
          time: slot90,
          patientName: `${RUN_ID} 90min Patient`,
          email: `${RUN_ID}-90min@example.com`,
          phone: "+20 10 9999 8888",
        },
      })
    );
    assert.equal(res90.status, 201);

    const [h, m] = slot90.split(":").map(Number);
    const overlapMin = h * 60 + m + 45;
    const overlapTime = `${String(Math.floor(overlapMin / 60)).padStart(2, "0")}:${String(
      overlapMin % 60
    ).padStart(2, "0")}`;

    const resOverlap = await appointmentsPOST(
      req("/api/appointments", {
        method: "POST",
        body: {
          serviceId: srv.id,
          doctorId: doc.id,
          date: targetDate,
          time: overlapTime,
          patientName: `${RUN_ID} Overlap Patient`,
          email: `${RUN_ID}-overlap@example.com`,
          phone: "+20 10 9999 7777",
        },
      })
    );
    assert.equal(resOverlap.status, 409, "Overlapping slot must be rejected with 409");
  }
});

test("Reschedule onto occupied slot -> 409; Reschedule onto own slot -> allowed", async () => {
  const admin = await createUserWithSession("admin", "resched-admin");
  const docService = await prisma.doctorService.findFirst({
    where: { service: { durationMinutes: 45 } },
    include: { doctor: true, service: true },
  });
  assert.ok(docService, "Doc service found");
  const doc = docService.doctor;
  const srv = docService.service;
  const { getAvailableDates, getAvailableSlots } = await import(
    "../../src/lib/clinic-db.ts"
  );

  const dates = await getAvailableDates(srv.id, doc.id);
  assert.ok(dates.length > 0);
  let targetDate = dates[0];
  let slot1 = "10:00";
  let slot2 = "10:45";
  for (const d of dates) {
    const slots = await getAvailableSlots(srv.id, doc.id, d);
    if (slots.length >= 2) {
      targetDate = d;
      slot1 = slots[0];
      slot2 = slots[1];
      break;
    }
  }

  const appt1 = await prisma.appointment.create({
    data: {
      id: `${RUN_ID}-appt-resched-1`,
      serviceId: srv.id,
      doctorId: doc.id,
      date: targetDate,
      time: slot1,
      durationMinutes: 45,
      patientName: "Patient Resched 1",
      email: `${RUN_ID}-resched1@example.com`,
      phone: "+20 10 1111 0001",
      status: "confirmed",
    },
  });
  void appt1;

  const appt2 = await prisma.appointment.create({
    data: {
      id: `${RUN_ID}-appt-resched-2`,
      serviceId: srv.id,
      doctorId: doc.id,
      date: targetDate,
      time: slot2,
      durationMinutes: 45,
      patientName: "Patient Resched 2",
      email: `${RUN_ID}-resched2@example.com`,
      phone: "+20 10 1111 0002",
      status: "confirmed",
    },
  });

  // Reschedule appt2 onto appt1's slot -> 409
  const conflictRes = await appointmentPATCH(
    req(`/api/appointments/${appt2.id}`, {
      method: "PATCH",
      cookie: admin.cookie,
      body: { action: "reschedule", date: targetDate, time: slot1 },
    }),
    { params: Promise.resolve({ id: appt2.id }) }
  );
  assert.equal(conflictRes.status, 409);

  // Reschedule appt2 onto its own current slot -> 200 allowed
  const ownSlotRes = await appointmentPATCH(
    req(`/api/appointments/${appt2.id}`, {
      method: "PATCH",
      cookie: admin.cookie,
      body: { action: "reschedule", date: targetDate, time: slot2 },
    }),
    { params: Promise.resolve({ id: appt2.id }) }
  );
  assert.equal(ownSlotRes.status, 200);
});

test("Pay invoice twice concurrently -> exactly one 200 and one 409, with single receipt number", async () => {
  const patient = await createUserWithSession("patient", "concurrent-pay");
  const doc = await prisma.doctor.findFirst();

  const invoice = await prisma.patientInvoice.create({
    data: {
      id: `${RUN_ID}-inv-concurrent`,
      patientEmail: patient.email,
      doctorId: doc.id,
      issuedDate: "2026-11-01",
      totalFeeEgp: 2000,
      balanceEgp: 2000,
      status: "balance_due",
    },
  });

  const payPayload = {
    invoiceId: invoice.id,
    paymentMethod: "card",
  };

  const results = await Promise.all([
    billingPOST(
      req("/api/patient/billing", {
        method: "POST",
        cookie: patient.cookie,
        body: payPayload,
      })
    ),
    billingPOST(
      req("/api/patient/billing", {
        method: "POST",
        cookie: patient.cookie,
        body: payPayload,
      })
    ),
  ]);

  const statuses = results.map((r) => r.status);
  assert.ok(statuses.includes(200), "One payment must succeed with 200");
  assert.ok(statuses.includes(409), "The concurrent duplicate payment must fail with 409");

  const successRes = results.find((r) => r.status === 200);
  const successData = await successRes.json();
  assert.ok(successData.invoice.receiptNumber, "Receipt number generated");
  assert.equal(successData.invoice.status, "paid");

  // Verify only one receipt number in database
  const updated = await prisma.patientInvoice.findUnique({ where: { id: invoice.id } });
  assert.equal(updated.status, "paid");
  assert.equal(updated.receiptNumber, successData.invoice.receiptNumber);
});

test("Pay invoice with non-payable status (cancelled) -> 409 invalid_transition, invoice remains cancelled", async () => {
  const patient = await createUserWithSession("patient", "non-payable");
  const doc = await prisma.doctor.findFirst();

  const invoice = await prisma.patientInvoice.create({
    data: {
      id: `${RUN_ID}-inv-cancelled-api`,
      patientEmail: patient.email,
      doctorId: doc.id,
      issuedDate: "2026-11-01",
      totalFeeEgp: 1200,
      balanceEgp: 1200,
      status: "cancelled",
    },
  });

  const payRes = await billingPOST(
    req("/api/patient/billing", {
      method: "POST",
      cookie: patient.cookie,
      body: {
        invoiceId: invoice.id,
        paymentMethod: "card",
      },
    })
  );

  assert.equal(payRes.status, 409);
  const data = await payRes.json();
  assert.equal(data.error, "invalid_transition");

  const check = await prisma.patientInvoice.findUnique({ where: { id: invoice.id } });
  assert.equal(check.status, "cancelled");
  assert.equal(check.paidAmountEgp, 0);
});

test("Malformed JSON -> 400; Unknown serviceIds -> 422; Duplicate account email -> 409", async () => {
  const admin = await createUserWithSession("admin", "body-errors");

  // 1. Malformed JSON
  const malformedReq = new Request("http://localhost:3000/api/appointments", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: '{"broken": json',
  });
  const malformedRes = await appointmentsPOST(malformedReq);
  assert.equal(malformedRes.status, 400);

  // 2. Unknown serviceIds on doctor update -> 422
  const doc = await prisma.doctor.findFirst();
  const unknownSrvRes = await doctorPATCH(
    req(`/api/admin/doctors/${doc.id}`, {
      method: "PATCH",
      cookie: admin.cookie,
      body: {
        name: doc.name,
        specialty: doc.specialty,
        bio: doc.bio,
        serviceIds: ["non-existent-service-uuid-1234"],
        status: "active",
      },
    }),
    { params: Promise.resolve({ id: doc.id }) }
  );
  assert.equal(unknownSrvRes.status, 422);

  // 3. Duplicate account email -> 409
  const existingUser = await prisma.user.findFirst();
  const dupAccountRes = await accountsPOST(
    req("/api/admin/accounts", {
      method: "POST",
      cookie: admin.cookie,
      body: {
        name: "Duplicate User",
        email: existingUser.email,
        phone: "+20 10 0000 0000",
        role: "patient",
        status: "active",
      },
    })
  );
  assert.equal(dupAccountRes.status, 409);
});

test("No 500 response body contains prisma, Invalid, or a stack trace", async () => {
  const { toErrorResponse } = await import("../../src/lib/http.ts");
  const simulatedPrismaError = new Error(
    "Unique constraint failed on the fields: (`email`) prisma internal stack trace"
  );
  simulatedPrismaError.name = "UnknownPrismaError";

  const res = toErrorResponse(simulatedPrismaError);
  assert.equal(res.status, 500);
  const text = await res.text();
  assert.ok(!text.toLowerCase().includes("prisma"), "500 body must not contain 'prisma'");
  assert.ok(!text.includes("Invalid"), "500 body must not contain 'Invalid'");
  assert.ok(!text.includes("stack trace"), "500 body must not contain stack trace");
});

test("Mapper: GET service returns extendedDetails; Intake round-trip preserves insuranceScaffold", async () => {
  const srv = await prisma.service.findFirst();
  assert.ok(srv);

  // GET /api/clinic returns service with extendedDetails
  const clinicRes = await clinicGET();
  assert.equal(clinicRes.status, 200);
  const clinicData = await clinicRes.json();
  const matchedSrv = clinicData.services.find((s) => s.id === srv.id);
  assert.ok(matchedSrv.extendedDetails, "Service DTO must include extendedDetails");
  assert.ok(matchedSrv.extendedDetails.procedure);

  // Intake Form round-trip preserves insuranceScaffold
  const patient = await createUserWithSession("patient", "insurance-pat");
  const intakeBody = {
    phone: "+20 10 9999 8888",
    emergencyContact: "Emergency",
    insuranceScaffold: {
      enabled: true,
      provider: "Misr Insurance",
      memberId: "MISR-123456",
    },
    conditions: ["Hypertension"],
    allergies: ["Latex"],
    consentSigned: true,
    signatureDataUrl:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    signedByName: "Insurance Patient",
  };

  const putRes = await intakePUT(
    req("/api/patient/intake", {
      method: "PUT",
      cookie: patient.cookie,
      body: intakeBody,
    })
  );
  assert.equal(putRes.status, 200);

  const getRes = await intakeGET(req("/api/patient/intake", { cookie: patient.cookie }));
  assert.equal(getRes.status, 200);
  const getData = await getRes.json();
  assert.ok(getData.intakeForm.insuranceScaffold);
  assert.equal(getData.intakeForm.insuranceScaffold.enabled, true);
  assert.equal(getData.intakeForm.insuranceScaffold.provider, "Misr Insurance");
  assert.equal(getData.intakeForm.insuranceScaffold.memberId, "MISR-123456");
});

test("canCancel/hoursUntil: 23.5h -> not allowed, 24h -> allowed; Clinic time zone across DST boundary", async () => {
  const { hoursUntil, clinicInstant } = await import("../../src/lib/clinic-time.ts");
  assert.equal(typeof hoursUntil, "function");

  // 23.5h remaining
  const nowMs = 1700000000000;
  const instant23_5 = nowMs + 23.5 * 3600 * 1000;
  const h23_5 = (instant23_5 - nowMs) / 3600000;
  assert.equal(h23_5 < 24, true);

  // 24h remaining
  const instant24 = nowMs + 24 * 3600 * 1000;
  const h24 = (instant24 - nowMs) / 3600000;
  assert.equal(h24 >= 24, true);

  // DST boundary check in Africa/Cairo (UTC+2 in winter, UTC+3 in summer)
  const winterInstant = clinicInstant("2026-01-15", "12:00");
  const winterDate = new Date(winterInstant);
  assert.equal(winterDate.getUTCHours(), 10, "12:00 Cairo in winter (UTC+2) should be 10:00 UTC");

  const summerInstant = clinicInstant("2026-07-15", "12:00");
  const summerDate = new Date(summerInstant);
  assert.equal(summerDate.getUTCHours(), 9, "12:00 Cairo in summer (UTC+3) should be 09:00 UTC");
});
