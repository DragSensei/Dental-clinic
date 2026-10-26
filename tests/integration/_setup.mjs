import assert from "node:assert/strict";
import crypto from "node:crypto";

const testDbUrl = process.env.TEST_DATABASE_URL;
assert(
  testDbUrl,
  "TEST_DATABASE_URL environment variable must be defined"
);
const parsedUrl = new URL(testDbUrl);
assert(
  parsedUrl.pathname.endsWith("_test"),
  `TEST_DATABASE_URL database name must end with _test, got: ${parsedUrl.pathname}`
);
console.log(`[test-db-guard] Verified TEST_DATABASE_URL ends with _test: ${parsedUrl.pathname}`);

process.env.DATABASE_URL = testDbUrl;

const { default: prisma } = await import("../../src/lib/prisma.ts");
const { auth } = await import("../../src/lib/auth.ts");

export const RUN_ID = `itest-${crypto.randomUUID().slice(0, 8)}`;
export const TEST_PASSWORD = "TestPassword2026!";

export { prisma, auth };

/**
 * Creates a real user via Better Auth, sets role in database,
 * and signs in returning the cookie string for request headers.
 */
export async function createUserWithSession(role, suffix = "") {
  const uniqueTag = suffix ? `-${suffix}` : `-${crypto.randomUUID().slice(0, 4)}`;
  const email = `${RUN_ID}-${role}${uniqueTag}@test.local`.toLowerCase();
  const name = `${RUN_ID} ${role} user`;

  // 1. Sign up through Better Auth API
  await auth.api.signUpEmail({
    body: {
      email,
      password: TEST_PASSWORD,
      name,
    },
  });

  // 2. Set the designated role and emailVerified
  await prisma.user.update({
    where: { email },
    data: { role, emailVerified: true },
  });

  // 3. Sign in to obtain session cookie
  const res = await auth.api.signInEmail({
    body: {
      email,
      password: TEST_PASSWORD,
    },
    asResponse: true,
  });

  let cookieHeader = "";
  if (typeof res.headers.getSetCookie === "function") {
    cookieHeader = res.headers
      .getSetCookie()
      .map((c) => c.split(";")[0].trim())
      .join("; ");
  } else {
    const raw = res.headers.get("set-cookie") || "";
    cookieHeader = raw.split(";")[0].trim();
  }

  return {
    email,
    name,
    role,
    cookie: cookieHeader,
  };
}

/**
 * Helper to build a standard Request with headers and body for route handlers.
 */
export function req(url, options = {}) {
  const { method = "GET", body, cookie, headers = {} } = options;
  const reqHeaders = new Headers(headers);

  if (cookie) {
    reqHeaders.set("cookie", cookie);
  }
  if (body !== undefined && !reqHeaders.has("content-type")) {
    reqHeaders.set("content-type", "application/json");
  }

  const init = {
    method,
    headers: reqHeaders,
  };

  if (body !== undefined) {
    init.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  const fullUrl = url.startsWith("http") ? url : `http://localhost:3000${url}`;
  return new Request(fullUrl, init);
}

/**
 * Cleanup helper: deletes all fixtures created with this run's RUN_ID,
 * children first, without touching seeded rows.
 */
export async function cleanup() {
  try {
    // 1. Invoice line items
    await prisma.invoiceLineItem.deleteMany({
      where: {
        invoice: {
          patientEmail: { contains: RUN_ID },
        },
      },
    });

    // 2. Patient invoices
    await prisma.patientInvoice.deleteMany({
      where: {
        OR: [
          { patientEmail: { contains: RUN_ID } },
          { id: { contains: RUN_ID } },
        ],
      },
    });

    // 3. Prescription items
    await prisma.prescriptionItem.deleteMany({
      where: {
        careSummary: {
          patientEmail: { contains: RUN_ID },
        },
      },
    });

    // 4. Visit care summaries
    await prisma.visitCareSummary.deleteMany({
      where: {
        OR: [
          { patientEmail: { contains: RUN_ID } },
          { id: { contains: RUN_ID } },
        ],
      },
    });

    // 5. Tooth records
    await prisma.toothRecord.deleteMany({
      where: {
        treatmentPlan: {
          patientEmail: { contains: RUN_ID },
        },
      },
    });

    // 6. Treatment phases
    await prisma.treatmentPhase.deleteMany({
      where: {
        OR: [
          { treatmentPlan: { patientEmail: { contains: RUN_ID } } },
          { title: { contains: RUN_ID } },
        ],
      },
    });

    // 7. Treatment plans
    await prisma.treatmentPlan.deleteMany({
      where: {
        OR: [
          { patientEmail: { contains: RUN_ID } },
          { id: { contains: RUN_ID } },
        ],
      },
    });

    // 8. Patient intake forms
    await prisma.patientIntakeForm.deleteMany({
      where: {
        patientEmail: { contains: RUN_ID },
      },
    });

    // 9. Appointments
    await prisma.appointment.deleteMany({
      where: {
        OR: [
          { email: { contains: RUN_ID } },
          { patientName: { contains: RUN_ID } },
          { id: { contains: RUN_ID } },
        ],
      },
    });

    // 10. Doctor service junctions
    await prisma.doctorService.deleteMany({
      where: {
        OR: [
          { doctor: { name: { contains: RUN_ID } } },
          { service: { title: { contains: RUN_ID } } },
        ],
      },
    });

    // 11. Doctor working hours
    await prisma.doctorWorkingHours.deleteMany({
      where: {
        doctor: { name: { contains: RUN_ID } },
      },
    });

    // 12. Doctors
    await prisma.doctor.deleteMany({
      where: {
        OR: [
          { name: { contains: RUN_ID } },
          { id: { contains: RUN_ID } },
          { user: { email: { contains: RUN_ID } } },
        ],
      },
    });

    // 13. Services
    await prisma.service.deleteMany({
      where: {
        OR: [
          { title: { contains: RUN_ID } },
          { id: { contains: RUN_ID } },
        ],
      },
    });

    // 14. Sessions
    await prisma.session.deleteMany({
      where: {
        user: { email: { contains: RUN_ID } },
      },
    });

    // 15. Accounts
    await prisma.account.deleteMany({
      where: {
        user: { email: { contains: RUN_ID } },
      },
    });

    // 16. Users
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: { contains: RUN_ID } },
          { name: { contains: RUN_ID } },
        ],
      },
    });
  } catch (err) {
    console.error("Integration setup cleanup error:", err);
  }
}
