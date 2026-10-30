import test from "node:test";
import assert from "node:assert/strict";

let idCounter = 1;
const bookedSlots = new Set();

const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, init = {}) => {
  const method = init.method || "GET";
  const body = init.body ? JSON.parse(init.body) : {};

  if (url === "/api/appointments" && method === "POST") {
    const slotKey = `${body.doctorId}:${body.date}:${body.time}`;
    if (bookedSlots.has(slotKey)) {
      return {
        ok: false,
        status: 409,
        json: async () => ({ error: "slot_unavailable" }),
      };
    }
    bookedSlots.add(slotKey);
    return {
      ok: true,
      status: 201,
      json: async () => ({
        appointment: {
          id: `app-${idCounter++}`,
          ...body,
          status: "confirmed",
          createdAt: new Date().toISOString(),
        },
      }),
    };
  }

  if (url.startsWith("/api/appointments/") && method === "PATCH") {
    const id = url.split("/").pop();
    const app = repository.getSnapshot().appointments.find((a) => a.id === id);
    if (body.action === "cancel") {
      if (app) {
        bookedSlots.delete(`${app.doctorId}:${app.date}:${app.time}`);
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          appointment: { ...(app || {}), status: "cancelled" },
        }),
      };
    }
    if (body.action === "reschedule") {
      if (app) {
        bookedSlots.delete(`${app.doctorId}:${app.date}:${app.time}`);
        bookedSlots.add(`${app.doctorId}:${body.date}:${body.time}`);
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          appointment: { ...(app || {}), date: body.date, time: body.time },
        }),
      };
    }
  }

  if (url.startsWith("/api/admin/services") && (method === "PATCH" || method === "PUT")) {
    return {
      ok: true,
      status: 200,
      json: async () => ({ service: body }),
    };
  }

  if (url.startsWith("/api/admin/doctors") && method === "PATCH") {
    return {
      ok: true,
      status: 200,
      json: async () => ({ doctor: body }),
    };
  }

  return {
    ok: true,
    status: 200,
    json: async () => ({}),
  };
};

test.beforeEach(() => {
  bookedSlots.clear();
});

test.after(() => {
  globalThis.fetch = originalFetch;
});

const repository = await import("./clinic-repository.ts");
const { services, doctors } = await import("./mock/catalog.ts");

test("availability is generated from today and excludes Friday", () => {
  const dates = repository.getAvailableDates(services[0].id, doctors[0].id);
  assert.ok(dates.length > 0);
  assert.ok(dates.every((date) => new Date(`${date}T00:00:00Z`).getUTCDay() !== 5));
  assert.ok(dates[0] > new Date().toISOString().slice(0, 10));
  assert.deepEqual(repository.getAvailableDates("missing", doctors[0].id), []);
  assert.deepEqual(repository.getAvailableDates(services[2].id, doctors[0].id), []);
  for (const service of services) assert.ok(doctors.some((doctor) => doctor.serviceIds.includes(service.id)), `${service.id} should have an eligible clinician`);
});

test("booking rejects an ineligible clinician for the selected service", async () => {
  repository.resetDemo();
  await assert.rejects(repository.bookAppointment({
    serviceId: services[2].id,
    doctorId: doctors[0].id,
    date: repository.getAvailableDates(services[0].id, doctors[0].id)[0],
    time: "09:00",
    patientName: "Demo Patient",
    email: "demo@example.test",
    phone: "5550100",
  }), { code: "service_clinician_mismatch" });
});

test("same-slot concurrent submissions are conflict guarded and duplicate pending submits are idempotent", async () => {
  repository.resetDemo();
  const service = services[0];
  const doctor = doctors[0];
  const date = repository.getAvailableDates(service.id, doctor.id)[0];
  const time = repository.getAvailableSlots(service.id, doctor.id, date)[0];
  const input = { serviceId: service.id, doctorId: doctor.id, date, time, patientName: "Demo Patient", email: "demo@example.test", phone: "5550100" };
  const first = repository.bookAppointment(input);
  const duplicate = repository.bookAppointment(input);
  assert.strictEqual(first, duplicate);
  const appointment = await first;
  assert.equal(repository.getSnapshot().appointments.length, 1);
  await assert.rejects(repository.bookAppointment({ ...input, email: "other@example.test" }), { code: "slot_unavailable" });
  assert.equal(repository.getSnapshot().appointments.length, 1);
  assert.equal(appointment.status, "confirmed");
});

test("competing distinct submissions for one slot allow only one booking", async () => {
  repository.resetDemo();
  const service = services[4];
  const doctor = doctors[0];
  const date = repository.getAvailableDates(service.id, doctor.id)[0];
  const time = repository.getAvailableSlots(service.id, doctor.id, date)[0];
  const base = { serviceId: service.id, doctorId: doctor.id, date, time, phone: "5550100" };
  const results = await Promise.allSettled([
    repository.bookAppointment({ ...base, patientName: "Patient One", email: "one@example.test" }),
    repository.bookAppointment({ ...base, patientName: "Patient Two", email: "two@example.test" }),
  ]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(results.filter((result) => result.status === "rejected").length, 1);
  assert.equal(repository.getSnapshot().appointments.length, 1);
});

test("reschedule rejects conflicts without exposing a transient removal", async () => {
  repository.resetDemo();
  const service = services[4];
  const doctor = doctors[0];
  const [date] = repository.getAvailableDates(service.id, doctor.id);
  const [firstTime, secondTime] = repository.getAvailableSlots(service.id, doctor.id, date);
  const shortService = services[0];
  const base = { doctorId: doctor.id, date, patientName: "Demo Patient", phone: "5550100" };
  const first = await repository.bookAppointment({ ...base, serviceId: shortService.id, time: secondTime, email: "demo@example.test" });
  await repository.bookAppointment({ ...base, serviceId: service.id, time: firstTime, patientName: "Another Patient", email: "other@example.test" });
  const before = repository.getSnapshot().appointments;
  await assert.rejects(repository.rescheduleAppointment(first.id, date, firstTime), { code: "time_unavailable" });
  assert.deepEqual(repository.getSnapshot().appointments, before);
});

test("service durations prevent cross-service overlap and conflicting catalog edits", async () => {
  repository.resetDemo();
  const doctor = doctors[0];
  const firstService = services[0];
  const secondService = services[4];
  const date = repository.getAvailableDates(firstService.id, doctor.id)[0];
  const firstTime = repository.getAvailableSlots(firstService.id, doctor.id, date)[0];
  const laterTime = repository.getAvailableSlots(firstService.id, doctor.id, date)[1];
  await repository.bookAppointment({ serviceId: firstService.id, doctorId: doctor.id, date, time: firstTime, patientName: "Patient One", email: "one@example.test", phone: "5550100" });
  await assert.rejects(repository.bookAppointment({ serviceId: secondService.id, doctorId: doctor.id, date, time: firstTime, patientName: "Patient Two", email: "two@example.test", phone: "5550101" }), { code: "slot_unavailable" });
  await repository.bookAppointment({ serviceId: secondService.id, doctorId: doctor.id, date, time: laterTime, patientName: "Patient Two", email: "two@example.test", phone: "5550101" });
  await assert.rejects(repository.updateService({ ...firstService, durationMinutes: 60 }), { code: "duration_overlap" });
  await assert.rejects(repository.updateService({ ...firstService, durationMinutes: 30.5 }), { code: "invalid_service" });
  await assert.rejects(repository.updateDoctor({ ...doctor, serviceIds: doctor.serviceIds.filter((id) => id !== firstService.id) }), { code: "doctor_service_blocked" });
});

test("cancelled appointments free their time and invalid contact data is rejected", async () => {
  repository.resetDemo();
  const service = services[0];
  const doctor = doctors[0];
  const date = repository.getAvailableDates(service.id, doctor.id)[0];
  const time = repository.getAvailableSlots(service.id, doctor.id, date)[0];
  const input = { serviceId: service.id, doctorId: doctor.id, date, time, patientName: "Patient", email: "bad-email", phone: "5550100" };
  await assert.rejects(repository.bookAppointment(input), { code: "invalid_contact" });
  const appointment = await repository.bookAppointment({ ...input, email: "patient@example.test" });
  await repository.cancelAppointment(appointment.id);
  assert.ok(repository.getAvailableSlots(service.id, doctor.id, date).includes(time));
});

test("successful rescheduling is atomic, and reset restores the shared catalog baseline", async () => {
  repository.resetDemo();
  const service = services[0];
  const doctor = doctors[0];
  const date = repository.getAvailableDates(service.id, doctor.id)[0];
  const [originalTime, nextTime] = repository.getAvailableSlots(service.id, doctor.id, date);
  const appointment = await repository.bookAppointment({ serviceId: service.id, doctorId: doctor.id, date, time: originalTime, patientName: "Demo Patient", email: "demo@example.test", phone: "5550100" });
  const moved = await repository.rescheduleAppointment(appointment.id, date, nextTime);
  assert.equal(moved.time, nextTime);
  assert.ok(repository.getAvailableSlots(service.id, doctor.id, date).includes(originalTime));
  await repository.updateService({ ...service, title: "Temporary demo title" });
  repository.resetDemo();
  assert.equal(repository.getSnapshot().services[0].title, service.title);
  assert.equal(repository.getSnapshot().appointments.length, 0);
});
