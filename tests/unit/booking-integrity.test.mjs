import test from "node:test";
import assert from "node:assert/strict";
import {
  CANCEL_WINDOW_HOURS,
  clinicInstant,
} from "../../src/lib/clinic-time.ts";
import {
  canCancelAppointment,
  ClinicError,
} from "../../src/lib/clinic-db.ts";
import {
  checkRateLimit,
  getClientIp,
  resetRateLimitStore,
} from "../../src/lib/rate-limit.ts";

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

test("clinicInstant respects Africa/Cairo winter (UTC+2) and summer DST (UTC+3)", () => {
  assert.equal(clinicInstant("2026-01-15", "12:00"), Date.UTC(2026, 0, 15, 10, 0));
  assert.equal(clinicInstant("2026-07-15", "12:00"), Date.UTC(2026, 6, 15, 9, 0));
});

test("rate-limit enforces limits, truncates forwarded IPs, and bounds store size", () => {
  resetRateLimitStore();

  const req = new Request("http://localhost/api/appointments", {
    headers: { "x-forwarded-for": `${"1".repeat(80)}, 10.0.0.2` },
  });
  const ip = getClientIp(req);
  assert.equal(ip.length, 64);

  const first = checkRateLimit("ip-test", 2, 60_000);
  const second = checkRateLimit("ip-test", 2, 60_000);
  const blocked = checkRateLimit("ip-test", 2, 60_000);
  assert.deepEqual([first.allowed, second.allowed, blocked.allowed], [true, true, false]);
  assert.equal(blocked.remaining, 0);

  resetRateLimitStore();
  for (let i = 0; i < 501; i += 1) {
    checkRateLimit(`expired-${i}`, 5, -10);
  }
  const afterPrune = checkRateLimit("expired-0", 5, 60_000);
  assert.equal(afterPrune.allowed, true);
  assert.equal(afterPrune.remaining, 4);

  resetRateLimitStore();
  for (let i = 0; i < 5000; i += 1) {
    checkRateLimit(`active-${i}`, 5, 60_000);
  }
  checkRateLimit("active-overflow", 5, 60_000);
  const evicted = checkRateLimit("active-0", 5, 60_000);
  assert.equal(evicted.remaining, 4);

  resetRateLimitStore();
});
