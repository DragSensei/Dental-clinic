# Data model status

No database schema or persistence provider has been selected.

## Demo access state
- A temporary demo account contains email/password in the mounted admin layout's React state only. It is cleared by refresh or leaving the admin layout; it is not an application identity or production credential model.
- No migration, API, cookie, localStorage, or sessionStorage record is used for demo access.

## Internal simulation types (2026-10-20)
- `Service`: id, title, description, durationMinutes.
- `Doctor`: id, name, specialty, bio, eligible serviceIds.
- `Appointment`: id, serviceId, doctorId, date (UTC YYYY-MM-DD), time (HH:mm UTC), patientName, email, phone, status (`confirmed` or `cancelled`).
- These are demo-only types owned by `src/shared/data/mock/catalog.ts`, not an approved production schema/API. Name/email/phone and appointments are memory-only; public admin screens have no authentication or real data source.
- The repository validates eligible providers, dates/slots, integer durations, overlaps, contact completeness, and simulated mutations. No database migration applies. Backend replacement is documented in `MOCK_DATA.md`.

## Agreed data boundary
- Patient booking may collect patient name and contact details.
- No other patient details or payment data are in scope.

## Pending before schema work
- Appointment statuses and lifecycle.
- Appointment duration and service catalog.
- Clinic hours, staff availability, timezone, and conflict policy.
- Staff roles and authorization rules.
- Persistence provider and retention requirements.
