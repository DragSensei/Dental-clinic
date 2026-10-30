import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { auth } from "./_setup.mjs";
import { checkRateLimit, resetRateLimitStore } from "../../src/lib/rate-limit.ts";
import { POST as appointmentsPOST } from "../../src/app/api/appointments/route.ts";

test.beforeEach(() => {
  resetRateLimitStore();
});

test("in-memory rate limiter allows 10 requests and blocks the 11th", async () => {
  const ip = "192.168.1.100";
  for (let i = 0; i < 10; i++) {
    const res = checkRateLimit(`appointments:${ip}`, 10, 600_000);
    assert.equal(res.allowed, true, `Request ${i + 1} should be allowed`);
  }
  const eleventh = checkRateLimit(`appointments:${ip}`, 10, 600_000);
  assert.equal(eleventh.allowed, false, "11th request should be blocked");
});

test("POST /api/appointments returns 429 on the 11th booking from the same IP", async () => {
  const ip = "203.0.113.195";
  const dummyBooking = {
    serviceId: "s-test",
    doctorId: "d-test",
    date: "2026-10-30",
    time: "10:00",
    patientName: "Rate Limit Tester",
    email: "ratelimit@example.com",
    phone: "+201000000000",
  };

  for (let i = 0; i < 10; i++) {
    const req = new NextRequest("http://localhost:3000/api/appointments", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": ip,
      },
      body: JSON.stringify(dummyBooking),
    });
    const res = await appointmentsPOST(req);
    assert.notEqual(res.status, 429, `Call ${i + 1} must not be 429`);
  }

  const eleventhReq = new NextRequest("http://localhost:3000/api/appointments", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(dummyBooking),
  });
  const res = await appointmentsPOST(eleventhReq);
  assert.equal(res.status, 429, "11th request must receive 429");
  const data = await res.json();
  assert.equal(data.error, "rate_limited");
});

test("Better Auth signIn email rate limit triggers on excessive attempts via auth.handler", async () => {
  let hit429 = false;
  const ip = "198.51.100.42";
  for (let i = 0; i < 15; i++) {
    const req = new Request("http://localhost:3000/api/auth/sign-in/email", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": ip,
      },
      body: JSON.stringify({
        email: "rate-limit-test@example.com",
        password: "wrong-password",
      }),
    });
    const res = await auth.handler(req);
    if (res.status === 429) {
      hit429 = true;
      break;
    }
  }
  assert.equal(hit429, true, "Sign-in rate limit should return 429 after threshold");
});
