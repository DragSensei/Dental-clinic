import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";

process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/dental_reservation_test?schema=public";

const { GET: healthGET } = await import("../src/app/api/health/route.ts");
const { GET: clinicGET } = await import("../src/app/api/clinic/route.ts");
const { GET: availabilityGET } = await import("../src/app/api/availability/route.ts");
const { GET: appointmentsGET, POST: appointmentsPOST } = await import(
  "../src/app/api/appointments/route.ts"
);
const { PATCH: appointmentPATCH } = await import(
  "../src/app/api/appointments/[id]/route.ts"
);
const { POST: servicesPOST } = await import(
  "../src/app/api/admin/services/route.ts"
);
const { PATCH: servicePATCH } = await import(
  "../src/app/api/admin/services/[id]/route.ts"
);
const { PATCH: doctorPATCH } = await import(
  "../src/app/api/admin/doctors/[id]/route.ts"
);
const { GET: workingHoursGET, PUT: workingHoursPUT } = await import(
  "../src/app/api/admin/working-hours/route.ts"
);
const { GET: accountsGET, POST: accountsPOST } = await import(
  "../src/app/api/admin/accounts/route.ts"
);

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

test("API: /api/health returns healthy and database connected", async () => {
  const res = await healthGET();
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, "healthy");
  assert.equal(data.database, "connected");
  assert.ok(data.timestamp);
  assert.ok(data.serviceCount > 0);
});

test("API: /api/clinic returns services, doctors, and working hours catalog", async () => {
  const res = await clinicGET();
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.services));
  assert.ok(Array.isArray(data.doctors));
  assert.ok(Array.isArray(data.workingHours));
  assert.ok(data.services.length > 0);
  assert.ok(data.doctors.length > 0);
  assert.equal(data.workingHours.length, 7);
});

test("API: /api/availability returns dates and available slots", async () => {
  const clinicRes = await clinicGET();
  const { doctors } = await clinicRes.json();
  const doc = doctors[0];
  const srvId = doc.serviceIds[0];

  // Request dates
  const datesReq = new NextRequest(
    `http://localhost:3000/api/availability?serviceId=${srvId}&doctorId=${doc.id}`
  );
  const datesRes = await availabilityGET(datesReq);
  assert.equal(datesRes.status, 200);
  const datesData = await datesRes.json();
  assert.ok(Array.isArray(datesData.dates));
  assert.ok(datesData.dates.length > 0);

  // Request slots for a date with availability
  let targetDate = datesData.dates[0];
  let slotsData = { slots: [] };
  for (const candidateDate of datesData.dates) {
    const slotsReq = new NextRequest(
      `http://localhost:3000/api/availability?serviceId=${srvId}&doctorId=${doc.id}&date=${candidateDate}`
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
  assert.ok(Array.isArray(slotsData.slots));
  assert.ok(slotsData.slots.length > 0);

  // Bad request missing params
  const badReq = new NextRequest("http://localhost:3000/api/availability");
  const badRes = await availabilityGET(badReq);
  assert.equal(badRes.status, 400);
});

test("API: /api/appointments POST books appointment and PATCH cancels/reschedules", async () => {
  const clinicRes = await clinicGET();
  const { doctors } = await clinicRes.json();
  const doc = doctors[0];
  const srvId = doc.serviceIds[0];

  // Find an available date & slot
  const datesReq = new NextRequest(
    `http://localhost:3000/api/availability?serviceId=${srvId}&doctorId=${doc.id}`
  );
  const datesRes = await availabilityGET(datesReq);
  const { dates } = await datesRes.json();
  let targetDate = dates[0];
  let slots = [];
  for (const candidateDate of dates) {
    const slotsReq = new NextRequest(
      `http://localhost:3000/api/availability?serviceId=${srvId}&doctorId=${doc.id}&date=${candidateDate}`
    );
    const slotsRes = await availabilityGET(slotsReq);
    const data = await slotsRes.json();
    if (data.slots && data.slots.length >= 2) {
      targetDate = candidateDate;
      slots = data.slots;
      break;
    }
  }
  assert.ok(slots.length >= 2, "Expected at least 2 available slots for test");
  const slotTime1 = slots[0];
  const slotTime2 = slots[1];

  const uniqueEmail = `test.booking.${Date.now()}@example.com`;

  // 1. POST book appointment
  const bookReq = new NextRequest("http://localhost:3000/api/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      serviceId: srvId,
      doctorId: doc.id,
      date: targetDate,
      time: slotTime1,
      patientName: "Route Test Patient",
      email: uniqueEmail,
      phone: "+20 10 1234 5678",
      reasonCategory: "routine-checkup",
      note: "Integration test booking",
    }),
  });

  const bookRes = await appointmentsPOST(bookReq);
  assert.equal(bookRes.status, 201);
  const bookData = await bookRes.json();
  assert.ok(bookData.appointment);
  assert.equal(bookData.appointment.patientName, "Route Test Patient");
  assert.equal(bookData.appointment.time, slotTime1);
  assert.equal(bookData.appointment.status, "confirmed");
  const appointmentId = bookData.appointment.id;

  // 2. Collision test - booking same slot returns 400 slot_unavailable
  const conflictReq = new NextRequest("http://localhost:3000/api/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      serviceId: srvId,
      doctorId: doc.id,
      date: targetDate,
      time: slotTime1,
      patientName: "Conflicting Patient",
      email: "conflict@example.com",
      phone: "+20 10 0000 0000",
    }),
  });
  const conflictRes = await appointmentsPOST(conflictReq);
  assert.equal(conflictRes.status, 400);
  const conflictData = await conflictRes.json();
  assert.equal(conflictData.error, "slot_unavailable");

  // 3. GET /api/appointments by email
  const getReq = new NextRequest(
    `http://localhost:3000/api/appointments?email=${encodeURIComponent(uniqueEmail)}`
  );
  const getRes = await appointmentsGET(getReq);
  assert.equal(getRes.status, 200);
  const getData = await getRes.json();
  assert.ok(Array.isArray(getData.appointments));
  assert.equal(getData.appointments.length, 1);
  assert.equal(getData.appointments[0].id, appointmentId);

  // 4. PATCH reschedule appointment to slotTime2
  const rescheduleReq = new NextRequest(
    `http://localhost:3000/api/appointments/${appointmentId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "reschedule",
        date: targetDate,
        time: slotTime2,
      }),
    }
  );
  const rescheduleRes = await appointmentPATCH(rescheduleReq, {
    params: Promise.resolve({ id: appointmentId }),
  });
  assert.equal(rescheduleRes.status, 200);
  const rescheduleData = await rescheduleRes.json();
  assert.equal(rescheduleData.appointment.time, slotTime2);

  // 5. PATCH confirm attendance
  const attendReq = new NextRequest(
    `http://localhost:3000/api/appointments/${appointmentId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "confirm_attendance",
      }),
    }
  );
  const attendRes = await appointmentPATCH(attendReq, {
    params: Promise.resolve({ id: appointmentId }),
  });
  assert.equal(attendRes.status, 200);
  const attendData = await attendRes.json();
  assert.equal(attendData.appointment.attendanceConfirmed, true);

  // 6. PATCH cancel appointment (staff override)
  const cancelReq = new NextRequest(
    `http://localhost:3000/api/appointments/${appointmentId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "cancel",
        isStaff: true,
      }),
    }
  );
  const cancelRes = await appointmentPATCH(cancelReq, {
    params: Promise.resolve({ id: appointmentId }),
  });
  assert.equal(cancelRes.status, 200);
  const cancelData = await cancelRes.json();
  assert.equal(cancelData.appointment.status, "cancelled");
});

test("API: Admin services, doctors, working hours, and accounts handlers", async () => {
  // 1. Admin Working hours GET & PUT
  const hoursRes = await workingHoursGET();
  assert.equal(hoursRes.status, 200);
  const hoursData = await hoursRes.json();
  assert.equal(hoursData.workingHours.length, 7);

  const putHoursReq = new NextRequest(
    "http://localhost:3000/api/admin/working-hours",
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(hoursData.workingHours),
    }
  );
  const putHoursRes = await workingHoursPUT(putHoursReq);
  assert.equal(putHoursRes.status, 200);

  // 2. Admin Services POST & PATCH
  const uniqueServiceId = `service-test-${Date.now()}`;
  const createSrvReq = new NextRequest(
    "http://localhost:3000/api/admin/services",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: uniqueServiceId,
        title: "Test Composite Bonding",
        description: "Aesthetic tooth bonding for chipped teeth.",
        durationMinutes: 45,
        category: "Cosmetic Dentistry",
        image: "/services/bonding.jpg",
      }),
    }
  );
  const createSrvRes = await servicesPOST(createSrvReq);
  assert.equal(createSrvRes.status, 201);
  const createSrvData = await createSrvRes.json();
  assert.equal(createSrvData.service.id, uniqueServiceId);

  const updateSrvReq = new NextRequest(
    `http://localhost:3000/api/admin/services/${uniqueServiceId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Test Premium Composite Bonding",
        description: "High-grade aesthetic tooth bonding.",
        durationMinutes: 45,
      }),
    }
  );
  const updateSrvRes = await servicePATCH(updateSrvReq, {
    params: Promise.resolve({ id: uniqueServiceId }),
  });
  assert.equal(updateSrvRes.status, 200);
  const updateSrvData = await updateSrvRes.json();
  assert.equal(updateSrvData.service.title, "Test Premium Composite Bonding");

  // 3. Admin Doctors PATCH
  const clinicRes = await clinicGET();
  const { doctors } = await clinicRes.json();
  const doc = doctors[0];

  const updateDocReq = new NextRequest(
    `http://localhost:3000/api/admin/doctors/${doc.id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: doc.name,
        specialty: doc.specialty,
        bio: `${doc.bio} - Verified Senior Specialist`,
        serviceIds: doc.serviceIds,
      }),
    }
  );
  const updateDocRes = await doctorPATCH(updateDocReq, {
    params: Promise.resolve({ id: doc.id }),
  });
  assert.equal(updateDocRes.status, 200);
  const updateDocData = await updateDocRes.json();
  assert.ok(updateDocData.doctor.bio.includes("Verified Senior Specialist"));

  // 4. Admin Accounts GET & POST
  const getAccRes = await accountsGET();
  assert.equal(getAccRes.status, 200);
  const getAccData = await getAccRes.json();
  assert.ok(Array.isArray(getAccData.accounts));

  const uniqueAccEmail = `admin.${Date.now()}@example.com`;
  const createAccReq = new NextRequest(
    "http://localhost:3000/api/admin/accounts",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Clinic Manager Test",
        email: uniqueAccEmail,
        phone: "+20 10 5555 4444",
        role: "admin",
      }),
    }
  );
  const createAccRes = await accountsPOST(createAccReq);
  assert.equal(createAccRes.status, 201);
  const createAccData = await createAccRes.json();
  assert.equal(createAccData.account.email, uniqueAccEmail);
});
