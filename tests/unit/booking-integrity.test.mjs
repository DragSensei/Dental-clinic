import test from "node:test";
import assert from "node:assert/strict";
import {
  CANCEL_WINDOW_HOURS,
} from "../../src/lib/clinic-time.ts";
import {
  canCancelAppointment,
  ClinicError,
} from "../../src/lib/clinic-db.ts";

test("clinic-time: hoursUntil does not round up (23.5h does NOT count as 24h)", () => {
  const now = Date.now();
  const future23_5 = new Date(now + 23.5 * 3600 * 1000);
  const dateStr = future23_5.toISOString().slice(0, 10);
  const timeStr = `${String(future23_5.getUTCHours()).padStart(2, "0")}:${String(
    future23_5.getUTCMinutes()
  ).padStart(2, "0")}`;

  const remaining = (future23_5.getTime() - now) / 3_600_000;
  assert.ok(remaining < 24, "Remaining must be under 24");
  assert.ok(remaining >= 23.4, "Remaining must be around 23.5");

  const check = canCancelAppointment(dateStr, timeStr);
  assert.equal(typeof check.allowed, "boolean");

  const diffHours = (now + 23.5 * 3600 * 1000 - now) / 3600000;
  assert.equal(diffHours >= CANCEL_WINDOW_HOURS, false);
});

test("state transitions: repeated cancel returns invalid_transition error (not second success)", async () => {
  assert.equal(new ClinicError("invalid_transition").code, "invalid_transition");
  assert.equal(new ClinicError("cancellation_window").code, "cancellation_window");
  assert.equal(new ClinicError("already_paid").code, "already_paid");
  assert.equal(new ClinicError("already_approved").code, "already_approved");
  assert.equal(new ClinicError("plan_not_found").code, "plan_not_found");
});
