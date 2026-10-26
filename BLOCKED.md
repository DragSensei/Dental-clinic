# BLOCKED.md

## Phase 0 — Baseline & Preflight
- Branch: `fix/backend-authz-remediation`
- `git status --short`: clean (prior to creating `BLOCKED.md`)
- Baseline TypeScript check (`npx tsc --noEmit`): exit 0 (0 errors)
- Prior Tier-2 evidence superseded; human re-review required.
- `.env` `DATABASE_URL`: `postgresql://postgres:postgres@localhost:5432/dental_reservation_db?schema=public`
- `.env.test` `TEST_DATABASE_URL`: `postgresql://postgres:postgres@localhost:5432/dental_reservation_test?schema=public` (ends in `_test`)

## In-Memory Rate Limiting Notice
- An in-memory limiter does not share state across server instances; it is acceptable for this single-node demo and must be replaced before multi-instance deployment.

## Deviations
- **Phase 1 transitional stub for `requireUser`:** Completely removed in Phase 2. All API routes have been transitioned to `requireRole` and `requireSession` from `@/lib/authz`.

## Phase 4 — Seed Real Credentials
- `prisma/seed.ts` updated with production guard, non-destructive re-runs, and `hashPassword` credential seeding.
- Verified: running seed twice against `TEST_DATABASE_URL` succeeded with 8/8 credential accounts seeded and 0 duplicates created.
- Verified: Better Auth login works with seeded credentials.

## Phase 5 — Input Validation and DTO Mappers
- Created `src/lib/clinic-schemas.ts` defining shared primitives (`isoDateSchema`, `hhmmSchema`, `emailSchema`, `nameSchema`, `phoneSchema`, `noteSchema`, `signatureDataUrlSchema`, `stringArraySchema`, `paymentMethodSchema`) and route request schemas.
- Created `src/lib/clinic-mappers.ts` implementing DTO transformations (`toServiceDTO`, `fromServiceInput`, `toDoctorDTO`, `toIntakeDTO`, `fromIntakeInput`, `toTreatmentPlanDTO`, `toCareSummaryDTO`, `toInvoiceDTO`, `toAppointmentDTO`, `toAccountDTO`) eliminating raw Prisma leakages and converting `null` to `undefined`.
- Wired all API routes under `src/app/api` to validate request payloads with `Schema.parse(...)` before touching domain/database and return sanitized DTO responses.
- Verified: `tests/unit/clinic-schemas-mappers.test.mjs` (6/6 pass), `npx tsc --noEmit` (exit 0), `npm run lint` (0 errors).

## Phase 6 — Booking Integrity, Concurrency, and State Transitions
- Replaced `Math.round` cancellation logic with DST-safe `clinicInstant` and exact `hoursUntil` (23.5h strictly rejected for <24h cancellation window).
- Replaced client copy of `canCancelAppointment` in `src/data/clinic-repository.ts` with `hoursUntil`.
- Implemented PostgreSQL advisory xact lock `SELECT pg_advisory_xact_lock(hashtext(${doctorId} || ':' || ${date}))` for `bookAppointment` and `rescheduleAppointment` (sorted lock acquisition on reschedule to prevent deadlocks).
- Enforced existing appointment's stored `durationMinutes` in overlap calculations.
- Enforced strict state transitions: `cancel` requires `confirmed` and future date (patient requires >=24h window); repeating a cancel throws 409 `invalid_transition`; `reschedule` requires `confirmed` and future date (patient requires >=24h window); `confirm_attendance` is owner-only, future, not already confirmed.
- Converted `payPatientInvoice` to conditional `updateMany` using strict allowlist `status: "balance_due"` (preventing invalid transitions from cancelled, refunded, or voided invoices to paid), with 409 `already_paid`, 409 `invalid_transition` on non-payable statuses, and 404 `invoice_not_found`. Verified by tests in `tests/integration/clinic-db.test.mjs` and `tests/integration/security-matrix.test.mjs`.
- Updated `approveTreatmentPlan` with 404 on missing plan and 409 `already_approved`.
- Verified: `tests/unit/booking-integrity.test.mjs` (pass), `git grep "Math.round" src/lib/clinic-db.ts` (0 matches), `npx tsc --noEmit` (exit 0), `npm run lint` (0 errors).

## Phase 7 — Frontend Repository Wiring
- Added unified `api<T>` helper throwing typed `ClinicError` on non-2xx responses.
- Implemented pessimistic mutations across all operations: await server, update snapshot with returned DTO, publish. Completely deleted all `try { ... } catch {}` swallow blocks.
- Removed client-side ID generation for accounts and doctors (uses server UUIDs from response; only service IDs retain client fallback).
- Removed `isStaff: true` from client cancellation payload.
- Module load auto-hydration restricted to public `/api/clinic`. Appointments and patient workflows hydrate only after session resolution via layout shells.
- Removed fake demo appointment injection in `ensurePatientDemoAppointment` and booking network failure fallbacks.
- Replaced hardcoded Friday closed check with hydrated clinic working hours.
- Verified: `git grep "catch {}" src/data/clinic-repository.ts` (0 matches), `git grep "Date.now()}" src/data/clinic-repository.ts` (only service id), `npx tsc --noEmit` (exit 0), `npm run lint` (0 errors).

## Phase 8 — Tests That Prove Security, and Leave the DB Clean
- Migrated and consolidated integration test suite under `tests/integration/`:
  - `tests/integration/_setup.mjs`: asserts `TEST_DATABASE_URL` ends with `_test`, sets `DATABASE_URL = TEST_DATABASE_URL` before Prisma import, generates run-specific `RUN_ID`, provides `createUserWithSession(role)`, `req(url, opts)`, and `cleanup()` deleting run fixtures child-first without touching seeded rows.
  - `tests/integration/security-matrix.test.mjs`: full 16-point security test matrix covering anonymous 401s, patient 403s on admin routes, doctor permissions, cross-patient isolation (read/write/pay 404s), appointment cancellation ownership, client `isStaff` tampering ignored, staff inside-24h cancel, duplicate cancel 409, slot validation (leap dates, past dates, closed days), booking concurrency advisory lock (5x concurrent -> 1x 201, 4x 409; 90-min overlap), reschedule conflicts/own slot, concurrent invoice payments (single receipt), malformed JSON/unknown references/duplicate accounts, 500 error sanitization, DTO mappers, and DST boundary time handling.
  - `tests/integration/clinic-db.test.mjs`: database domain tests utilizing `_setup.mjs` fixtures.
  - `tests/integration/api-admin-booking.test.mjs`: admin catalog and booking endpoint tests using authenticated session headers.
  - `tests/integration/api-patient.test.mjs`: patient workflow endpoints using authenticated patient sessions.
  - `tests/integration/rate-limit.test.mjs`: in-memory booking rate limiting and Better Auth sign-in rate limiting.
- Updated `package.json` with `"test"` glob covering all unit and integration tests and `"test:integration"`.
- Verified OS test-db-guard: database-backed integration tests detected and passed.
- Verified: `npm test` passed twice consecutively (67/67 tests pass) with zero row count drift across all 18 database tables.
- Verified: `npx tsc --noEmit` passed with 0 errors; `npm run lint` passed with 0 errors.

## Phase 9 — Smoke, State, Gates & Final Sign-Off
- Production build (`npm run build`): completed with 0 errors across 65 app routes.
- Manual runtime smoke tests on test DB (`localhost:3000`):
  - Admin login -> `/admin/overview` loads with 0 redirect loops (network idle confirmed).
  - Mariam login -> `/patient/overview` loads (200), accessing `/admin/overview` returns 404 with standard not-found page.
  - Admin accessing `/patient/overview` returns 404 with standard not-found page.
  - Logged out visitor: `/admin`, `/admin/overview`, `/admin/accounts`, `/patient/forms` return 404; `/admin/login` returns 200; `/api/appointments` returns 401.
  - Logged out `/admin/overview` 404 HTML body exactly matches `/does-not-exist` 404 body (stripped of dynamic script hashes).
  - `/admin/login?google_email=...` query bypass sets 0 cookies and does not sign anyone in.
- Visual Audit Verification (`visual-audit.mjs`):
  - `http://localhost:3000/admin/login` (multi-viewport): PASS (100% compliant touch targets >=44px, zero horizontal spill).
  - `http://localhost:3000/admin/login --single-screen`: PASS.
  - `http://localhost:3000/admin/overview --role=admin --expect=Overview --require-shell=sidebar`: PASS across 375px, 768px, 1440px viewports (100% touch targets, zero horizontal spill, sidebar shell verified).
  - `http://localhost:3000/patient/overview --role=patient --expect="Welcome back, Mariam Ahmed" --require-shell=navbar`: PASS across 375px, 768px, 1440px viewports (100% touch targets, zero horizontal spill, navbar shell verified).
  - `http://localhost:3000/patient/forms --role=patient --expect="Digital Medical Intake Form"`: PASS across 375px, 768px, 1440px viewports (100% touch targets, zero horizontal spill).
  - `http://localhost:3000/ --require-shell=navbar,footer`: PASS across 375px, 768px, 1440px viewports (navbar and footer shells verified).
- Rate Limiting Adjustments:
  - Better Auth rate limiter configured with `window: 60`, `max: 10`, and `customRules: { "/get-session": false }` so repeated page hydration does not exhaust auth quotas while strictly protecting sign-in/sign-up.
  - In-memory IP rate limiter on `POST /api/appointments`: 10 requests / 10 minutes per IP.
- Scale Gate:
  - Run on `src/lib/clinic-db.ts`: reports `REVIEW_REQUIRED` (`UNVERIFIED_QUERY_BOUND` on line 579, `REPEATED_DATABASE_READ_REVIEW`, `CONCURRENCY_REVIEW`).
    - `UNVERIFIED_QUERY_BOUND` (line 579): `getAppointments` enforces dynamic bounding capped at 200 via `const boundedTake = Math.min(Math.max(1, filter?.take ?? 200), 200)`. Because `scale-gate.mjs` statically inspects literal integer bounds, dynamic expressions trigger `REVIEW_REQUIRED`. The query bound behaviors (default 200 bound, dynamic custom bound, and 200-row upper ceiling clamp) are verified by integration test in `tests/integration/clinic-db.test.mjs` (lines 159-174).
    - `CONCURRENCY_REVIEW`: Advisory transaction locking (`pg_advisory_xact_lock`) and concurrency conflict prevention verified by `tests/integration/security-matrix.test.mjs` (lines 588-667).
    - `REPEATED_DATABASE_READ_REVIEW`: Verified loop query patterns bounded by doctor/date filters.
- Surfaces Awaiting Human Sign-Off (Rule 0 Compliance):
  - `.git/tier2-evidence.json` and `.verification/security-review.json` are superseded and intentionally left unsigned for human review.
  - Database schema baseline migrations: currently `db push` only; flagged for baseline migration via `_shared-skills/db-guardian.md`.
  - Cascade delete policy on `User` clinical and billing relations requires human business decision.

## Blocker Log
(None currently)
