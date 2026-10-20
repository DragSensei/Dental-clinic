# Demo data and backend replacement

## Current boundary
- `src/shared/data/mock/catalog.ts` owns fictional clinic, service, and clinician records and shared types. Existing landing imports use a compatibility re-export, not a second dataset.
- `src/shared/data/clinic-repository.ts` owns one in-memory snapshot, subscriptions, availability, booking, cancellation, rescheduling, catalog edits, and reset.
- `src/shared/data/use-clinic.ts` exposes this owner to React with a stable server snapshot. Next.js client links preserve the browser module between pages. Reload, a full document navigation, or demo reset clears the session.
- The admin routes show an open signup/login demo gate. Its account and access state live only in the mounted layout's memory and reset on refresh or sign-out. It is not real authentication or a security boundary; no API, server action, database, message sending, or payment is implemented.
- Patient information is limited to name/email/phone and held in memory. Do not enter real patient details. No contact data is written to localStorage, sessionStorage, cookies, or a server.
- Dashboard totals and patient lists derive from session appointments. They begin empty; make a demo booking to exercise the populated states. Landing statistics/testimonials are separately labeled fictional design fixtures, never dashboard operational statistics.
- Sample availability uses UTC calendar dates, excludes Friday, and illustrates durations and overlap handling. It is not clinic availability or approved production policy.

## Replace the simulation
1. Agree the real clinic service/provider catalog, timezone, durations, hours, appointment lifecycle, privacy/retention policy, and staff authorization. Existing mock type shapes are internal demo contracts, not a public production API.
2. Implement protected backend endpoints and server-side validation/ownership checks. Public availability must expose no patient contacts; admin list/detail/mutations require authenticated staff authorization on every endpoint.
3. Put conflict detection and idempotency inside the database transaction/uniqueness boundary. Client pending guards and this single-tab in-memory repository do not prevent cross-user conflicts.
4. Replace repository reads/mutations with API calls while preserving feature-facing operations where appropriate. Extend the hook to expose real loading/error/retry states and invalidate dependent availability/catalog queries after mutations. Do not silently fall back to fixtures on failed live requests.
5. Replace mock imports in server metadata/static existence checks with the selected authoritative service/provider loader. Retain shared page components and theme tokens.
6. Replace the simulation confirmation with authoritative reservation ID/status only after the server succeeds. Remove demo labels/fixtures deliberately, and add real data retention and notification handling only when specified.
7. Run repository behavior tests against the adapter plus authenticated API tests, simultaneous booking/reschedule tests, and end-to-end public/admin journeys. Review failure, empty, loading, expired availability, and refresh behavior before enabling production use.

## Deliberate limits
This simulation has no cross-tab synchronization, durable history, staff authentication, email delivery, or production cancellation policy. The signup/login UI does not establish identity or authorization. These are explicit integration requirements rather than capabilities implied by the demo. Theme and sidebar preferences may persist; patient/contact records and demo credentials must not.
