import test from "node:test";
import assert from "node:assert/strict";

import { RUN_ID, prisma, createUserWithSession, req, cleanup } from "./_setup.mjs";

const { resetRateLimitStore } = await import("../../src/lib/rate-limit.ts");
const { GET: healthGET } = await import("../../src/app/api/health/route.ts");
const { GET: clinicGET } = await import("../../src/app/api/clinic/route.ts");
const { GET: availabilityGET } = await import("../../src/app/api/availability/route.ts");
const { POST: appointmentsPOST } = await import(
  "../../src/app/api/appointments/route.ts"
);
const { PATCH: appointmentPATCH } = await import(
  "../../src/app/api/appointments/[id]/route.ts"
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

test.beforeEach(() => {
  resetRateLimitStore();
});

test.after(async () => {
  await cleanup();
});

test("API: /api/health returns healthy status and timestamp", async () => {
  const res = await healthGET();
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, "healthy");
  assert.ok(data.timestamp);
});

test("API: /api/clinic returns services, doctors, and workingHours", async () => {
  const res = await clinicGET();
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.services));
  assert.ok(Array.isArray(data.doctors));
  assert.ok(Array.isArray(data.workingHours));
  assert.ok(data.services.length > 0);
  assert.ok(data.doctors.length > 0);
});

test("API: /api/availability returns valid dates and slots", async () => {
  const clinicRes = await clinicGET();
  const { doctors } = await clinicRes.json();
  const doc = doctors[0];
  const srvId = doc.serviceIds[0];

  // Request dates
  const datesReq = req(`/api/availability?serviceId=${srvId}&doctorId=${doc.id}`);
  const datesRes = await availabilityGET(datesReq);
  assert.equal(datesRes.status, 200);
  const datesData = await datesRes.json();
  assert.ok(Array.isArray(datesData.dates));
  assert.ok(datesData.dates.length > 0);

  // Request slots for a date with availability
  let targetDate = datesData.dates[0];
  let slotsData = { slots: [] };
  for (const candidateDate of datesData.dates) {
    const slotsReq = req(
      `/api/availability?serviceId=${srvId}&doctorId=${doc.id}&date=${candidateDate}`
    );
    const slotsRes = await availabilityGET(slotsReq);
    assert.equal(slotsRes.status, 200);
    const data = await slotsRes.json();
    if (data.slots && data.slots.length > 0) {
      targetDate = candidateDate;
      slotsData = data;
      break;
    }
  }
  assert.ok(targetDate);
  assert.ok(Array.isArray(slotsData.slots));
  assert.ok(slotsData.slots.length > 0);

  // Bad request missing params
  const badReq = req("/api/availability");
  const badRes = await availabilityGET(badReq);
  assert.equal(badRes.status, 400);
});

test("API: /api/appointments POST books appointment and PATCH cancels/reschedules", async () => {
  const patient = await createUserWithSession("patient", "booking-pat");
  const admin = await createUserWithSession("admin", "booking-adm");

  const docService = await prisma.doctorService.findFirst({
    where: { service: { durationMinutes: 45 } },
    include: { doctor: true, service: true },
  });
  assert.ok(docService);
  const doc = docService.doctor;
  const srv = docService.service;

  const { getAvailableDates, getAvailableSlots } = await import(
    "../../src/lib/clinic-db.ts"
  );
  const dates = await getAvailableDates(srv.id, doc.id);
  assert.ok(dates.length > 0);

  let availableDate = dates[0];
  let availableTime = "10:30";
  for (const d of dates) {
    const slots = await getAvailableSlots(srv.id, doc.id, d);
    if (slots.length > 1) {
      availableDate = d;
      availableTime = slots[0];
      break;
    }
  }

  // 1. Create Appointment
  const postReq = req("/api/appointments", {
    method: "POST",
    body: {
      serviceId: srv.id,
      doctorId: doc.id,
      date: availableDate,
      time: availableTime,
      patientName: `${RUN_ID} Patient API`,
      email: patient.email,
      phone: "+20 10 9999 8888",
      note: "API Integration Booking Note",
    },
  });

  const postRes = await appointmentsPOST(postReq);
  assert.equal(postRes.status, 201);
  const { appointment } = await postRes.json();
  assert.ok(appointment.id);
  assert.equal(appointment.patientName, `${RUN_ID} Patient API`);
  assert.equal(appointment.status, "confirmed");

  // 2. Conflict Test (double booking same slot -> 409)
  const conflictReq = req("/api/appointments", {
    method: "POST",
    body: {
      serviceId: srv.id,
      doctorId: doc.id,
      date: availableDate,
      time: availableTime,
      patientName: `${RUN_ID} Overlap`,
      email: `${RUN_ID}-overlap@example.com`,
      phone: "+20 10 1111 2222",
    },
  });
  const conflictRes = await appointmentsPOST(conflictReq);
  assert.equal(conflictRes.status, 409);

  // 3. Patch Confirm Attendance (by appointment owner)
  const confirmReq = req(`/api/appointments/${appointment.id}`, {
    method: "PATCH",
    cookie: patient.cookie,
    body: { action: "confirm_attendance" },
  });
  const confirmRes = await appointmentPATCH(confirmReq, {
    params: Promise.resolve({ id: appointment.id }),
  });
  assert.equal(confirmRes.status, 200);
  const confirmData = await confirmRes.json();
  assert.equal(confirmData.appointment.attendanceConfirmed, true);

  // 4. Cancel Appointment (by staff admin)
  const cancelReq = req(`/api/appointments/${appointment.id}`, {
    method: "PATCH",
    cookie: admin.cookie,
    body: { action: "cancel" },
  });
  const cancelRes = await appointmentPATCH(cancelReq, {
    params: Promise.resolve({ id: appointment.id }),
  });
  assert.equal(cancelRes.status, 200);
  const cancelData = await cancelRes.json();
  assert.equal(cancelData.appointment.status, "cancelled");
});

test("API: /api/admin/services CRUD", async () => {
  const admin = await createUserWithSession("admin", "srv-admin");
  const customId = `${RUN_ID}-service-${Date.now()}`;

  const createReq = req("/api/admin/services", {
    method: "POST",
    cookie: admin.cookie,
    body: {
      id: customId,
      title: `${RUN_ID} Scaling & Polishing`,
      description: "Thorough ultrasonic scaling and prophylactic polishing",
      durationMinutes: 45,
      category: "Preventive Care",
      image: "/services/cleaning.png",
      extendedDetails: {
        overview: "Deep periodontal prophylaxis",
        procedure: "Ultrasonic tartar removal",
        benefits: "Prevents gingivitis",
        aftercare: "Avoid staining drinks for 2h",
      },
    },
  });

  const createRes = await servicesPOST(createReq);
  assert.equal(createRes.status, 201);
  const { service } = await createRes.json();
  assert.ok(service.id);
  assert.equal(service.title, `${RUN_ID} Scaling & Polishing`);

  // Update
  const updateReq = req(`/api/admin/services/${service.id}`, {
    method: "PATCH",
    cookie: admin.cookie,
    body: {
      title: `${RUN_ID} Scaling Updated`,
      description: "Updated description text here",
      durationMinutes: 60,
    },
  });
  const updateRes = await servicePATCH(updateReq, {
    params: Promise.resolve({ id: service.id }),
  });
  assert.equal(updateRes.status, 200);
  const updateData = await updateRes.json();
  assert.equal(updateData.service.title, `${RUN_ID} Scaling Updated`);
  assert.equal(updateData.service.durationMinutes, 60);
});

test("API: /api/admin/doctors/[id] updates assigned services and details", async () => {
  const admin = await createUserWithSession("admin", "doc-admin");
  const clinicRes = await clinicGET();
  const { doctors, services } = await clinicRes.json();
  const doc = doctors[0];
  const allServiceIds = services.slice(0, 3).map((s) => s.id);

  const patchReq = req(`/api/admin/doctors/${doc.id}`, {
    method: "PATCH",
    cookie: admin.cookie,
    body: {
      name: doc.name,
      specialty: doc.specialty,
      bio: "Updated bio during automated API integration testing",
      serviceIds: allServiceIds,
      status: "active",
    },
  });
  const patchRes = await doctorPATCH(patchReq, {
    params: Promise.resolve({ id: doc.id }),
  });
  assert.equal(patchRes.status, 200);
  const data = await patchRes.json();
  assert.equal(data.doctor.bio, "Updated bio during automated API integration testing");
});

test("API: /api/admin/working-hours GET and PUT", async () => {
  const admin = await createUserWithSession("admin", "hours-admin");

  const getReq = req("/api/admin/working-hours", { cookie: admin.cookie });
  const getRes = await workingHoursGET(getReq);
  assert.equal(getRes.status, 200);
  const { workingHours } = await getRes.json();
  assert.ok(Array.isArray(workingHours));
  assert.equal(workingHours.length, 7);

  // Update working hours
  const putReq = req("/api/admin/working-hours", {
    method: "PUT",
    cookie: admin.cookie,
    body: [
      {
        dayOfWeek: 0,
        isClosed: false,
        startTime: "09:00",
        endTime: "17:00",
        slotIntervalMinutes: 45,
      },
    ],
  });
  const putRes = await workingHoursPUT(putReq);
  assert.equal(putRes.status, 200);
  const putData = await putRes.json();
  assert.ok(Array.isArray(putData.workingHours));
});

test("API: /api/admin/accounts creates user and queries list", async () => {
  const admin = await createUserWithSession("admin", "acc-admin");

  const listReq = req("/api/admin/accounts", { cookie: admin.cookie });
  const listRes = await accountsGET(listReq);
  assert.equal(listRes.status, 200);
  const { accounts } = await listRes.json();
  assert.ok(Array.isArray(accounts));

  // Create new staff doctor account
  const testEmail = `${RUN_ID}-test.doc@bluehaven.example`;
  const createReq = req("/api/admin/accounts", {
    method: "POST",
    cookie: admin.cookie,
    body: {
      name: `${RUN_ID} Dr. Test Associate`,
      email: testEmail,
      phone: "+20 12 3456 7890",
      role: "doctor",
      status: "active",
      specialty: "Orthodontics",
      bio: "Automated test clinician",
      serviceIds: [],
    },
  });
  const createRes = await accountsPOST(createReq);
  assert.equal(createRes.status, 201);
  const { account } = await createRes.json();
  assert.equal(account.email, testEmail);
  assert.equal(account.role, "doctor");

  // Verify created in DB
  const dbUser = await prisma.user.findUnique({
    where: { email: testEmail },
    include: { doctorProfile: true },
  });
  assert.ok(dbUser);
  assert.equal(dbUser.role, "doctor");
  assert.ok(dbUser.doctorProfile);
});
