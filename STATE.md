# Project state

## Backend Authorization, Data Integrity & Security Remediation (10-Phase Plan) — 2026-10-25
- Implemented complete 10-phase remediation plan (`fix/backend-authz-remediation` branch) resolving auth bypasses, race conditions, and mock fallbacks:
  - **Auth Model & Server Authorization Core (`src/lib/authz.ts`, `src/lib/auth.ts`)**:
    - Better Auth configured with `admin({ defaultRole: "patient", adminRoles: ["admin"] })` and `nextCookies()`.
    - Server-side guards: `requireSession(request)` (validates session against database, rejects banned accounts, defaults role to `"patient"`) and `requireRole(request, roles)` (enforces strict role matching: `"admin"`, `"doctor"`, `"patient"`).
    - Session-backed ownership checks: `assertPatientOwner(authed, resourceOwnerEmail)` ensures patients can access only their own clinical records, intake forms, treatment plans, visit care summaries, and billing invoices.
    - Zero `requireUser` / `isAuthenticated` theater: removed fake Google OAuth auto-login callback, legacy bypass routes, and insecure `src/server/user.ts`.
  - **Server-Side Edge Proxy Gate (`src/proxy.ts`)**:
    - Centralized edge proxy intercepts unauthenticated and wrong-role access before routing or executing page bundles.
    - Strict 404 invariant: unauthorized access to `/admin`, `/admin/*`, `/patient`, `/patient/*` rewrites directly to `/__not-found` 404 (rendering the standard not-found page with body identical to `/does-not-exist`), preventing path enumeration.
    - Explicit redirect: only `/admin/login` or `/login` with an active session redirects to that role's dashboard.
  - **Approved Product Decisions (D1–D8)**:
    | # | Decision | Policy Enforced |
    |---|---|---|
    | D1 | Who may book? | Public guest booking remains open. Name, email, and phone are stored solely on the appointment record. |
    | D2 | Roles | `admin` has full access. `doctor` has staff access to appointments (all clinicians' schedules) and read-only access to patient records, but cannot access `/api/admin/*`. `patient` accesses only their own records. |
    | D3 | Patient cancel/reschedule | Permitted strictly at least 24 hours prior to the slot in clinic local time. Staff are exempt from the 24-hour limit. |
    | D4 | Clinic time zone | `Africa/Cairo` (UTC+2 / UTC+3 DST aware). All slot calculations use wall-clock clinic time. |
    | D5 | Unauthorized route access | HTTP 404 with standard not-found response (never a redirect) for unauthenticated or wrong-role visits. |
    | D6 | Invoice payment | Demo payment action: marks invoice paid idempotently with a single receipt number; strictly restricted to invoice owner. |
    | D7 | Public sign-up | Creates accounts with `role: "patient"`. Staff (`admin`, `doctor`) accounts can only be created by an authenticated `admin`. |
    | D8 | Demo quick-login | Rendered only when `NEXT_PUBLIC_DEMO_MODE=true`. Signs in through server-side Better Auth (`/api/dev/demo-login`) with seeded credentials. Zero offline password bypass. |
  - **Booking Concurrency, Integrity & State Transitions (`src/lib/clinic-db.ts`)**:
    - PostgreSQL transactional advisory locks (`pg_advisory_xact_lock(hashtext(...))`) on doctor-day slots serialize concurrent bookings and prevent double-booking race conditions.
    - Slot validation: verifies date (valid calendar day within 21-day window, non-Friday), time format, working hours bounds, and historical slot restrictions.
    - Overlap calculation: evaluates slot ranges using stored appointment `durationMinutes` rather than current catalog duration.
    - Cancellation window math: computes exact fractional hours without `Math.round` rounding up.
    - Status transitions: strict validation blocks double cancellations or attendance confirmation on cancelled visits.
    - Invoice payment idempotency: conditional update (`where: { id, status: "balance_due" }`) ensures exactly one successful payment per invoice under concurrent attempts.
  - **Input Validation & DTO Protection (`src/lib/clinic-schemas.ts`, `src/lib/clinic-mappers.ts`)**:
    - Zod schemas validate bodies and query parameters on all endpoints; malformed inputs return 400, missing foreign entities return 422, duplicates return 409.
    - DTO mappers sanitize database entities, strip internal IDs/passwords/hashes, normalize nulls, and guarantee persistence of service `extendedDetails` and intake `insuranceScaffold`.
  - **Rate Limiting (`src/lib/rate-limit.ts`)**:
    - In-memory IP rate limiter on `POST /api/appointments` (10 bookings / 10 minutes per IP).
    - Better Auth rate limiter configured on auth actions with `/get-session` exemption.
  - **Frontend Repository Cleanup (`src/data/clinic-repository.ts`, `src/data/use-session.ts`)**:
    - `useSession` rebuilt on `authClient.useSession()` with zero `sessionStorage` fallback or role defaults.
    - Centralized `api<T>` client helper throws typed `ClinicError` with HTTP status and server error codes.
    - Removed all silent `try {} catch {}` swallow blocks and fake `demo-patient-upcoming-*` booking injections.
    - Layout-driven hydration (`AdminLayoutShell`, `PatientLayoutShell`) fetches protected data only after verified session arrival.
  - **Testing & Verification Matrix**:
    - Integration test suite in `tests/integration/` (`security-matrix.test.mjs`, `api-admin-booking.test.mjs`, `api-patient.test.mjs`, `clinic-db.test.mjs`, `rate-limit.test.mjs`).
    - Guarded with `tests/integration/_setup.mjs` verifying `TEST_DATABASE_URL` ends in `_test`, zero drift on seeded rows, and dynamic `RUN_ID` isolation.
    - 64/64 automated tests pass cleanly across unit, dictionary, and integration matrices.
    - 6/6 visual audits passed across mobile (375px), tablet (768px), and desktop (1440px) with 100% compliant touch targets and zero horizontal overflow.
  - **Correction of Prior Commit Sign-off Claim**:
    - Commit `01d8b04` previously claimed "Tier-2 machine signoff (30/30 PASS)". That claim was invalid: the implementation contained synthetic reviewer signatures, client-side session storage bypasses (`updateSession` role spoofing), unauthenticated API endpoints, unhashed demo credentials, missing concurrency locks, and client-only 404 gating. All of these have been remediated in this branch.

## Backend Architecture & Next.js Template Integration (Prisma 7, PostgreSQL, Better Auth, REST Endpoints, Live Wiring) — 2026-10-25
- Integrated backend stack from `https://github.com/synapsys-tech/nextjs-template`:
  - **Prisma 7 ORM & PostgreSQL**: Configured with `@prisma/adapter-pg` driver adapter, `prisma.config.ts`, and singleton in `src/lib/prisma.ts`. Schema defined with full relations for Better Auth (`User`, `Session`, `Account`, `Verification`), Clinic Catalog (`Service`, `Doctor`, `DoctorService`), Working Hours (`ClinicWorkingHours`, `DoctorWorkingHours`), `Appointment` (with attendance confirmation, 24h cancellation, and Google Calendar sync markers), and Patient Workflows (`PatientIntakeForm`, `TreatmentPlan`, `ToothRecord`, `TreatmentPhase`, `VisitCareSummary`, `PrescriptionItem`, `PatientInvoice`, `InvoiceLineItem`).
  - **Local PostgreSQL 18 Provisioning**: Initialized and synchronized databases `dental_reservation_db` (primary) and `dental_reservation_test` (isolated integration target) on `localhost:5432`.
  - **Database Seeding (`prisma/seed.ts`)**: Populated clinic working hours, 12 clinical dental treatments, 4 clinician profiles, demo accounts (`admin@bluehaven.example`, doctors, `mariam.a@example.com`), Mariam's digital intake form, FDI 32-tooth plan, care summaries, and invoices.
  - **Better Auth v1.6+ & React Email**: Configured in `src/lib/auth.ts` and `src/lib/auth-client.ts` with `admin()` and `nextCookies()` plugins, optional Resend email verification (`src/components/emails/verify-email.tsx`, `reset-password.tsx`), Google OAuth provider support, and route proxy protection in `src/proxy.ts`. Ported Server Actions in `src/server/user.ts` (`forgotPassword`, `resetPassword`, `isAuthenticated`).
  - **Zero-Raw-Query Database Service Layer (`src/lib/clinic-db.ts`)**: Typed domain helpers for transactional appointment booking with overlap prevention, 24-hour hold-button cancellation policy (`canCancelAppointment`), attendance confirmations, intake form upsert, 32-tooth plan digital signature approval, and invoice checkout. Bounded query design with explicit `take` limits on all scans and batch queries preventing N+1 scans per OS scale sentinels.
  - **REST API Route Handlers**:
    - Better Auth & Health: `src/app/api/auth/[...all]/route.ts`, `src/app/api/health/route.ts`.
    - Clinic & Appointments: `src/app/api/clinic/route.ts`, `src/app/api/availability/route.ts`, `src/app/api/appointments/route.ts`, `src/app/api/appointments/[id]/route.ts`.
    - Admin Catalog & Operations: `src/app/api/admin/services/route.ts`, `src/app/api/admin/services/[id]/route.ts`, `src/app/api/admin/doctors/[id]/route.ts`, `src/app/api/admin/working-hours/route.ts`, `src/app/api/admin/accounts/route.ts`.
    - Patient Portal & Sync: `src/app/api/patient/intake/route.ts`, `src/app/api/patient/treatment-plan/route.ts`, `src/app/api/patient/care/route.ts`, `src/app/api/patient/billing/route.ts`, `src/app/api/google/calendar/route.ts`.
  - **Frontend Repository & Auth Wiring**:
    - Wired `src/data/clinic-repository.ts` with `hydrateClinicData()` and `hydratePatientData(email)`. All repository mutations (`bookAppointment`, `cancelAppointment`, `confirmAppointmentAttendance`, `rescheduleAppointment`, `createService`, `updateService`, `updateDoctor`, `createAccount`, `savePatientIntakeForm`, `approveTreatmentPlan`, `payPatientInvoice`) persist via REST endpoints while maintaining optimistic snapshot updates and backward compatibility with in-memory testing.
    - Wired Better Auth client (`authClient.signIn.email`, `authClient.signUp.email`, `authClient.signOut()`) into `src/features/admin/admin-demo-gate.tsx` and `src/features/admin/admin-layout-shell.tsx`.
  - **Parallel Subagent Execution & Root Review**:
    - Dispatched 2 `flash` subagents (Worker 1: Admin & Booking API; Worker 2: Patient Portal API & Sync).
    - Root personally reviewed every line of code diff, adjusted route handlers, fixed type assertions, and resolved lint issues.
  - **Verification & Signoff**:
    - Commit `01d8b04` claimed Tier-2 machine signoff (30/30 PASS) which was subsequently found invalid (synthetic reviews, in-memory auth bypasses, mock data fallbacks, missing concurrency locks). Fully remediated in branch `fix/backend-authz-remediation`.
    - `npm test`: 30/30 tests passing (14 legacy repository & i18n, 6 database domain tests, 5 admin & booking integration tests, 5 patient portal integration tests).
    - `npx tsc --noEmit`: 0 errors.
    - `npm run lint`: 0 errors.
    - `node _os/_shared-skills/scripts/token-lint.mjs`: Passed with 0 violations.
    - `node _os/_shared-skills/scripts/lint-ui-architecture.mjs`: All 4 boundary gates passed.
    - `node _os/_shared-skills/scripts/schema-compatibility.mjs`: Local development schema verified compatible on `dental_reservation_db`.
    - `node _os/_shared-skills/scripts/test-db-guard.mjs`: Preflight verified on `dental_reservation_test`.
    - `node _os/_shared-skills/scripts/scale-gate.mjs`: 100% bounded queries across all database operations.

## Dashboard UX pass: (site)/(app) route split, Overview merge, intake wizard, border reduction — 2026-10-24
- User-approved direction (recorded in `DESIGN.md`): dashboards never show the marketing navbar/footer. Routes now live in `src/app/(site)/` (public, with `SiteNav` + `SiteFooter`) and `src/app/(app)/` (admin/doctor/patient, with the new slim `src/components/app-top-bar.tsx`). The root layout keeps providers only; root `not-found.tsx` restores public chrome via `src/components/not-found-body.tsx`. Sticky sidebar offsets moved from 69px to `top-14`. `package.json` visual route map keys were updated to the grouped paths.
- Patient pages start beside the sidebar (no `mx-auto`); overview/plan/billing use `max-w-7xl`, intake `max-w-3xl`, care summaries `max-w-4xl`.
- Overview: the confirmation banner was merged into the Next Visit card (one Reschedule/Cancel set, Confirm Attendance there). The hygiene recall and forms prompts became one compact To-do list. Only one solid button shows per state.
- Times are clinic wall-clock slot strings; the misleading "(UTC)" labels were removed or relabelled "clinic time". No timezone conversion was added, because timezone policy is still undefined.
- Intake: a real 3-step wizard (guarded Continue, back navigation keeps values, focus moves to the step heading, reduced-motion scroll). The "no changes" toggle now opens Step 2 and swaps the editors for a read-only summary. Previously signed forms unlock all steps.
- Treatment plan and care/billing: nested borders removed (44→9 and 41→16 border lines); selected tiles use a ring.
- Verification: `tsc` (0 source errors), `eslint` (0 errors, 1 pre-existing `<img>` warning), `npm test` 14/14, `lint-ui-architecture` 4/4, `token-lint` pass. Production build of a scratch copy plus Playwright at 375px and 1440px across 6 patient routes, `/admin/overview`, `/services`, `/` and 404: one navbar per route type and no horizontal overflow. The dev server running on :3000 predates the route move and must be restarted. Headless dev-mode pages stayed on the loading skeleton on both servers, including unchanged routes, so that is pre-existing and not caused by this change. React #419 (server Suspense bailout to client) appears in prod on session-gated pages; it existed before this change.
- Open: Arabic wording for the new To-do/wizard strings is unreviewed; the new strings are inline, not in the dictionaries; the dev-mode headless hydration stall was not investigated.

## Patient Dashboard (5 connected workflows), Google Cloud OAuth/Calendar integration, and shared DashboardSidebar extraction — 2026-10-24
- Built the complete **Patient Dashboard** (`/patient/overview`, `/patient/appointments`, `/patient/forms`, `/patient/treatment-plan`, `/patient/care`, `/patient/billing`) while preserving **Guest Mode** on `/book` (signed-in patients get pre-filled contact info + a "Manage in Patient Dashboard →" banner; guests keep the original flow).
- Implemented the 5 connected patient lifecycle workflows:
  1. **Online Appointment Booking & Management** (`/patient/appointments`): 4 visit reason categories mapped to clinical durations (`30–60 mins`), "Any Available Doctor" vs specific eligible clinician selection, real-time open slots, symptom notes, `.ics` download + Google Calendar sync, reschedule modal, and 24-hour cancellation policy lock (`canCancelAppointment`).
  2. **One-Tap Confirmations & Recall Reminders** (`/patient/overview`): 48-hour upcoming visit confirmation banner (`Confirm Attendance` updates Admin/Doctor appointment views with a `Confirmed by Patient ✓` badge; `Need to Reschedule` jumps straight to rescheduling) + 6-month hygiene recall reminder (`Book My Cleaning` deep-links to `/patient/appointments?reason=cleaning&book=1`).
  3. **Digital Intake, Medical History & e-Consent Forms** (`/patient/forms`): Returning-patient "No Changes" `Switch` toggle, scaffolded Insurance card (ready for future activation), `ToggleGroup` checklists for medical conditions and allergies (checking allergies/conditions triggers a red `Medical Alert` badge on `/admin/appointments`), and finger/mouse digital signature via `SignaturePad`.
  4. **Visual Treatment Plan & Cost Estimates** (`/patient/treatment-plan`): Interactive 32-tooth FDI dental arch SVG (`18..28`, `48..38`), phased treatment `Accordion` (Phase 1 Urgent, Phase 2 Restorative, Phase 3 Elective), transparent pricing `Table` (Clinic Fee, Insurance Scaffold, Out-of-Pocket), digital signature plan approval, and 1-click Phase scheduling modal.
  5. **Billing, Online Payments & Post-Visit Summary** (`/patient/care` & `/patient/billing`): Completed visit summaries ("What Was Done Today", checkable Post-Op recovery rules, printable e-Prescription modal) + itemized invoices, online payment checkout (`RadioGroup` for Card, InstaPay/Vodafone Cash, Apple Pay, Google Pay), and downloadable/printable receipts synced with Admin status.
- Integrated Google Cloud APIs (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` documented in `.env.example`):
  - `GET /api/auth/google` and `GET /api/auth/google/callback` for Google OAuth 2.0 ("Continue with Google" on `/admin/login`) with automatic demo fallback when `.env.local` is unconfigured.
  - `POST /api/google/calendar` for Google Calendar API v3 event creation with automatic web deep-link fallback (`calendar.google.com/calendar/render?action=TEMPLATE...`).
- Extracted portable shared components (`src/components/shared/dashboard-sidebar.tsx` and `src/components/shared/signature-pad.tsx`) and installed/ported 12 Shadcn UI primitives (`radio-group`, `switch`, `progress`, `accordion`, `tabs`, `dialog`, `separator`, `avatar`, `toggle`, `toggle-group` via `shadcn` CLI; `table`, `textarea` ported from `https://github.com/synapsys-tech/nextjs-template`).
- Verification: `npx tsc --noEmit` (0 errors), `npm run lint` (0 errors), `npm test` (14/14 unit & i18n tests), `lint-ui-architecture.mjs` (4/4 boundary gates), `token-lint.mjs` (0 violations), and Playwright E2E + responsive viewport verification (`375px`, `768px`, `1440px`) across all `/patient/*` routes and `/book` passed with 0px horizontal overflow.

## Cross-dashboard mobile BottomNavBar (arunachalam/bottom-nav-bar) on test branch — 2026-10-23
- Created `test/mobile-bottom-nav-bar` branch to test switching the dashboard sidebar to the 21st.dev `arunachalam/bottom-nav-bar` floating pill navigation on phone (`< 768px`).
- Added the reusable `BottomNavBar` UI primitive in `src/components/ui/bottom-nav-bar.tsx` and the cross-dashboard mobile wrapper `DashboardBottomNav` in `src/components/shared/dashboard-bottom-nav.tsx` so Admin, Doctor, and Patient dashboards share one canonical mobile bottom navigation owner.
- Replaced the mobile top horizontal strip in `src/features/admin/admin-navigation-client.tsx` with `<DashboardBottomNav />` while preserving the collapsible desktop capsule `<aside>` on `md+`. Added `pb-24` mobile clearance in `AdminLayoutShell` and a Sign Out button in `AdminSettings`.
- Research: inspected `https://21st.dev/community/components/arunachalam/bottom-nav-bar/default` (accessed 2026-10-23). Observed: pill container with Framer Motion spring label expansion for the active tab, `stickyBottom` mode, and semantic `bg-card`/`text-primary` tokens. Impact: adapted with Next.js `Link`, `useReducedMotion()`, RTL `marginInlineStart`, and `44x44px` minimum touch targets.
- Verification: `tsc --noEmit`, `eslint`, `npm test` (14/14), `lint-ui-architecture.mjs` (4/4 gates), `token-lint.mjs`, `visual-audit.mjs`, and Playwright multi-viewport verification (`375px`, `768px`, `1440px`) passed with zero horizontal overflow.

## Folder structure consolidation (`src/components/{ui,shared,*.tsx}`, `src/lib`, `src/data`, `src/i18n`) — 2026-10-23
- Consolidated all UI and shared components under `src/components/` into three tiers:
  - `src/components/ui/`: basic `shadcn/ui` (Base UI) primitives (`alert.tsx`, `badge.tsx`, `button.tsx`, `card.tsx`, `checkbox.tsx`, `combobox.tsx`, `input.tsx`, `label.tsx`).
  - `src/components/shared/`: larger shared components reused across pages and features (`alert-error.tsx`, `expandable-card.tsx`, `language-combobox.tsx`, `service-card.tsx`, `service-icons.ts`, `site-brand.tsx`, `theme-toggle.tsx`).
  - `src/components/*.tsx`: global site blocks/shells (`site-nav.tsx`, `site-nav-interactive.tsx`, `site-footer.tsx`, `site-footer-client.tsx`, `theme-provider.tsx`).
- Removed top-level `src/shared/` completely by migrating `src/shared/lib/utils.ts` → `src/lib/utils.ts`, `src/shared/data/**` → `src/data/**`, and `src/shared/i18n/**` → `src/i18n/**`.
- Removed unreferenced legacy feature files (`admin-patients.tsx`, `appointment-section.tsx`, `landing-demo-data.ts`, `landing-footer.tsx`, `landing-nav.tsx`, `doctor-directory.tsx`, `visit-information.tsx`), `src/components/examples/`, and empty `_components/` directories under `src/app/`.
- Updated `components.json`, `eslint.config.mjs` boundary rules, `package.json` test scripts and visual route map, and architecture docs.
- Verification: 14/14 automated repository and i18n tests pass, `tsc --noEmit` passed with 0 errors, `eslint` passed with 0 errors, and `lint-ui-architecture.mjs` passed all 4 boundary gates.

## Clean service cards, booking auto-selection, and shadcn alert-error-with-everything integration — 2026-10-21
- Clean service cards without plus icon: Removed the circular plus button from collapsed `ExpandableCard` instances on `/services` and the homepage care guide. Retained full-card interactivity, accessible keyboard navigation, and added an explicit close button (`X`) on the expanded modal dialog.
- Automated service pre-selection in booking form: Enhanced `/book` query handling to accept both `serviceId` and `service` parameters. Clicking "Book now" (`احجز الآن` in Arabic) on any treatment card navigates to `/book?serviceId=...`, immediately pre-selecting the service in component state. Updated `Choice` tiles with a high-contrast checkmark badge when selected and active border/ring tokens for instant visual clarity.
- shadcn `alert-error-with-everything` component integration: Added the official shadcn error alert component via registry token, implementing icon, title, description, retry, and dismiss buttons (`AlertErrorWithEverything`). Applied it uniformly across all site error states: `/book` submission failures and validation notices, the global Next.js root error boundary (`src/app/error.tsx`), admin login and signup gates (`AdminDemoGate`), clinician editing (`DoctorEditor`), service creation/editing (`ServiceCreator`, `ServiceEditor`), and account registration (`AccountCreator`).
- Verification: 14/14 automated repository and i18n tests pass, `tsc --noEmit` passed with 0 errors, `eslint` passed with 0 errors, Next.js production build compiled 45/45 static and partial prerender routes successfully.

## Full-width design-matched navbar and admin light-mode white text conversion — 2026-10-21
- Full-width navbar from left to right: Removed the floating pill capsule container and fixed max-width constraints. The navbar now stretches 100% edge-to-edge (`w-full border-b border-border bg-background/95 shadow-xs backdrop-blur`), matching the responsive gutter padding (`px-4 sm:px-8 lg:px-12 2xl:px-16`) of the site footer.
- Design-matched theme colors: Replaced hardcoded `#0e121b` dark colors on the navbar with semantic design system tokens (`bg-background`, `text-foreground`, `text-muted-foreground`, `text-brand-primary`, `bg-brand-subtle`). The brand now displays `{t.brand.name}` and the clinic tooth icon with `bg-brand-subtle text-brand-primary`.
- Themed Cloudflare mega-menu: Styled the mega-menu dropdown with popover design tokens (`bg-popover`, `border-border`, `text-popover-foreground`). Left rail categories use `bg-brand-subtle text-brand-primary` when active and `hover:bg-muted` when inactive. Right pane service cards and footer links adhere to project brand tokens in both light and dark modes.
- Admin dashboard text color conversion from dark to light mode: Configured `--action-foreground: #ffffff` and `--action: #0070f3` in light mode (`:root`) while preserving dark foreground in dark mode (`.dark`). Action buttons across the admin dashboard—including "Create account" (`/admin/accounts`), "Reset demo session" (`/admin/settings`), "Create service" (`/admin/services/new`), and "Back to accounts"—now cleanly convert to high-contrast white text when transitioning from dark to light mode.
- Verification: 14/14 automated repository and i18n tests pass, `tsc --noEmit` passed with 0 errors, `eslint` passed with 0 errors, Next.js build compiled 45/45 static routes. Playwright end-to-end tests confirmed 100% full-width header bounding box (x=0, width matching body client width), zero horizontal scroll across 375px/768px/1440px viewports, mega dropdown hover visibility, and exact white text (`rgb(255, 255, 255)`) on all admin action buttons in light mode.

## Cloudflare mega-menu navbar, Badtz-UI ExpandableCard, Synapsys Cairo contact, About Us, and admin categories — 2026-10-21
- Floating island capsule navbar: Redesigned the navigation bar to match the reference dark floating pill design (`rounded-full bg-[#0a111a]/90 backdrop-blur-md border border-white/10 px-4 py-2`). Retained Server Component architecture in `site-nav.tsx` while delegating responsive interactive features to `site-nav-interactive.tsx`.
- Dynamic authentication state: Unauthenticated visitors see "Sign In" and a bright blue pill button "Book a visit". When authenticated as an administrator or client (via session storage), "Sign In" and "Book a visit" are replaced with a prominent "Open dashboard" button routing to `/admin/overview`.
- Cloudflare-style hover mega-menu: Hovering on "Services" in the navbar expands a multi-column mega-menu structured by categories (Preventive Care, Restorative Dentistry, Cosmetic Dentistry, Orthodontics, Pediatric Dentistry, Oral Surgery & Endodontics). Left rail lists categories with counts; right pane showcases treatments with clinical duration badges and descriptions; footer provides quick links to the full directory and consultation booking.
- Badtz-UI ExpandableCard integration: Implemented the Badtz-UI `ExpandableCard` component (`src/shared/components/ui/expandable-card.tsx` and exported via `@/components/ui/expandable-card`) using `motion/react`. Clicking any service card launches a modal view with clinical step-by-step procedures, benefits, recovery guidelines, and a direct booking CTA. Used in `/services` and the homepage care guide.
- Admin dashboard categories: Updated `Service` data contracts and `clinic-repository.ts` to include `category`, `image`, and `extendedDetails`. Enhanced `/admin/services` with category filter pills and service badges, and added category `<select>` controls to service creation (`/admin/services/new`) and editing (`/admin/services/[id]`).
- About Us page (`/about`): Replaced "Doctors" with "About us", featuring clinic history, 4 milestone impact metrics, core clinical principles, doctor specialist profiles (Dr. Layla Hassan, Dr. Omar Adel, Dr. Nour Samir, Dr. Adam Khalil), and advanced clinic technology. Aliased `/doctors` to `/about` for backwards compatibility.
- Contact Us page (`/contact`): Replaced "Visit" with "Contact us", featuring an interactive Google Maps embed for the Synapsys Office in Makram Ebeid, Nasr City, Cairo, a direct directions action, clinic hours, 24/7 emergency hotline (+20 122 000 9988), and patient inquiry form. Aliased `/visit` to `/contact`.
- Verification: `pnpm build` compiled 45/45 static routes with 0 TypeScript/ESLint errors. Visual audit passed on `/`, `/services`, `/about`, and `/contact` across 375px mobile, 768px tablet, and 1440px desktop viewports with 0px horizontal overflow and 100% compliant $\ge 44$px touch targets. Playwright end-to-end tests confirmed mega dropdown hover, card expansion/collapse, and dynamic dashboard button switching.

## Neutral role badges, accent action buttons, navbar login button, and sliding auth swipe cards — 2026-10-21
- Neutral role badges in `/admin/accounts`: Switched `RoleBadge` from custom colors (`info`, `success`, `purple`) to the standard site `variant="secondary"`, rendering clean, accessible theme-neutral badges for doctors, patients, and administrators.
- Synchronized action button colors: Updated "Back to accounts" buttons in `DoctorEditor` (`admin-catalog.tsx`) and `AccountCreator` (`admin-account-creator.tsx`), and the "Reset demo session" button in `AdminSettings` (`admin-settings.tsx`) to use `variant: "accent"`, matching the exact dentistry-blue color of "Book a visit".
- Navbar updates: Removed the "Admin" text link from the navigation links array in `SiteNav` across both desktop and mobile menus. Added a dedicated "Log in" button linking to `/login` (with outline style on desktop and mobile drawer), supported by complete bilingual i18n parity in `en.ts` and `ar.ts`.
- Sliding swipe auth gate: Rebuilt `AdminDemoGate` into a side-by-side dual-card layout implementing `https://www.shadcn.io/examples/login-card` and `https://www.shadcn.io/examples/signup-form`. Features an absolute sliding cover panel with clinic photography (`/dental-visit-hero.png`) and global brand gradient overlay (`bg-gradient-to-br from-[#19476b]/95 via-[#19476b]/85 to-[#123b5c]/95`). Clicking "Create an account" / "Sign up" smoothly translates the cover over to the left with a swipe animation to reveal the sign-up form; clicking "Log in" swipes it back to the right to reveal the login form. Supported by `inert` accessibility attributes and a responsive segmented switcher on mobile (<768px).
- Reusable UI primitives: Added `Card`, `Input`, `Label`, and `Checkbox` to `@/shared/components/ui/` complying with workspace component reuse rules.
- Verification: 14/14 repository & i18n tests pass, `tsc --noEmit` and `eslint` passed with 0 warnings/errors, Next.js build compiled 43/43 routes, Playwright automated end-to-end tests verified swipe animations, signup/login transitions, responsive fit (zero horizontal overflow at 375px/768px/1440px), and visual audit snapshots confirmed theme token conformity.

## Strict 404 admin gate, capsule sidebar extension, footer removal, and shadcn Badge component — 2026-10-21
- Strict unauthenticated 404 gate: Enforced server-side by `src/proxy.ts` (rewriting unauthorized paths to `/__not-found` rendering the exact 404 not-found page identical to non-existent URLs). It covers both unauthenticated visitors and wrong-role visitors across `/admin/*` and `/patient/*`.
- Dedicated login route: Added `/admin/login` and `/login` (redirects to `/admin/login`) as the exclusive entrypoint hosting the login/signup gate. Successful sign-in preserves the session in `sessionStorage` via `useSyncExternalStore` and routes to `/admin/overview`.
- Capsule sidebar extension: Restored the rounded capsule card design (`rounded-[2rem] border border-border bg-card shadow-sm`) and removed sticky locking, allowing the sidebar card to stretch smoothly alongside the content all the way to the end of the page (`h-full min-h-0`).
- Removed admin footer: Set `SiteFooter` to return `null` for all `pathname.startsWith("/admin")` paths, giving the admin dashboard full vertical height without footer clutter.
- Reusable shadcn Badge component: Created `@/shared/components/ui/badge.tsx` supporting standard variants (`default`, `secondary`, `destructive`, `outline`, `accent`, `success`, `purple`, `info`). Applied it across `/admin/accounts` for role and status badges, and in `ClinicInformation` on the public landing page.
- Component reuse rule: Updated root workspace operating law in `AGENTS.md` to mandate preferring and reusing shared UI primitives from `@/shared/components/ui/` across all projects.
- Verification: `npx tsc --noEmit` passed, `npm run lint` passed (0 warnings, 0 errors), Next.js build compiled 43 routes, curl tests verified 404 on `/admin`, `/admin/overview`, `/admin/accounts`, 200 on `/admin/login`, and 307 on `/login`.

## Accounts table, create account, and create service UI — 2026-10-21
- Converted doctors and patients views into an integrated Accounts table (`/admin/accounts`) displaying clinicians, patients, and administrators with role badges, email, phone/specialty, status, and edit actions.
- Updated DoctorEditor back button to return to `/admin/accounts` with "Back to accounts" label. Replaced doctor routes: `/admin/doctors` and `/admin/patients` redirect to `/admin/accounts`, and `/admin/accounts/[id]` hosts clinician editing.
- Configured direct requests to `/admin` to return a 404 HTTP status (`notFound()`), moving the active admin overview dashboard to `/admin/overview`.
- Styled all primary create and action buttons with the centralized global action tokens (`--action`, `--action-foreground`, `--action-hover` via `variant: "accent"`), matching the exact dentistry-blue color of "Book a visit".
- Created the "Create Account" page (`/admin/accounts/new`) and "Create Service" page (`/admin/services/new`).
- Maintained complete bilingual parity across English and Arabic (`en.ts` and `ar.ts`), responsive card/table switching for mobile/tablet/desktop (zero horizontal overflow), and accessible touch targets.
- Verification: `tsc --noEmit`, `eslint` (0 warnings, 0 errors), and `next build` (41 routes) passed. HTTP 404 confirmed on `/admin` and 200 OK confirmed on all active routes.

## Arabic localization — 2026-10-21
- Added English and Arabic across the public site, booking, and admin screens. The navbar combobox (read-only, opens the list on click) switches the language; the choice is stored in browser storage like the theme. Arabic sets `lang="ar"` and `dir="rtl"`, uses system Arabic fonts, drops letter-spacing, and mirrors directional icons, the booking slide-in, the mobile menu sheet, and the advanced-care photo.
- Repository errors are now stable codes (`ClinicError`) translated in the UI; tests assert the codes.
- Shared `AppCombobox` gained `readOnly`, `hideLabel`, and `className` props; its popup now sits above the mobile menu.
- Removed the admin header's language button. The navbar combobox is global, so admin pages use it too.
- Verification: `tsc`, `lint`, `npm test` (14/14, including new i18n checks), and `next build` (36 routes) pass. Browser checks on a production build at 375/1024/1280: read-only field ignores typing, language switch sets `dir=rtl`, mobile menu list is clickable and has no visible "Language" text, no horizontal overflow, the photo mirrors, and no console errors. Not yet done: a full screenshot audit at 768 and 1440 across every route.
- Limits: returning Arabic visitors see English briefly before hydration; the document title is set on the client; Arabic clinical wording needs review by the clinic's dental team. Research: web search found patient Q&A pages but no authoritative Arabic dental glossary (accessed 2026-10-21), so terms follow common usage.
- No database is involved; all data remains in browser memory.

## README handoff — 2026-10-20
- Added a collapsible README guide listing implemented public/admin routes and demo behavior, with manual booking/admin/theme checks and the automated verification commands. It states the in-memory simulation limits and fictional-contact guidance.
- Next recommended phase remains defining verified clinic details, scheduling rules, staff access, and persistence before replacing the simulations with production integrations.

## Current website evolution — 2026-10-20
- The user authorized a complete simulated clinic experience, retaining the existing blue/navy identity. Public service/provider detail routes, a first-visit guide, staged booking, and dedicated admin routes are implemented. Shared navbar/footer and light/dark controls persist across client navigation.
- User-supplied overview and capsule-sidebar references now govern the admin panel hierarchy, animated expanded/collapsed sidebar, and active icon states; both light/dark variants preserve clinic tokens.
- All domain fixtures/types and the in-memory repository are centralized in `src/shared/data/`. Name/email/phone and all edits are memory-only. The admin section is a public demonstration: there is no staff authentication, backend, database, real reservation, payment, or message delivery. Production scheduling/lifecycle/access contracts remain undefined.
- Three Luna workers implemented isolated owned scopes; root reviewed and returned concrete defects for revision. `IMPLEMENTATION_PROGRESS.md` is the compact task ledger; `DESIGN.md` is the current design contract; `MOCK_DATA.md` explains backend replacement.
- Verification: lint, TypeScript and optimized build passed36generated pages; repository suite8/8; booking browser34/34 plus six focused cached-entry/back/empty-eligibility checks on the optimized server; integrated route/journey18/18 with zero browser errors; admin appearance7/7 and long-contact admin7/7. Responsive review covered375/768/1440, both themes, expanded/collapsed sidebar, keyboard use and reduced motion. Known implementation defects found in review were revised and rechecked.
- Preview: `http://127.0.0.1:3000`. No changes staged or committed; preserve preexisting independent working-tree changes.

## Admin demo gate and navigation motion — 2026-10-20
- Admin routes now render a labeled open signup/login demo gate before the sidebar and protected-looking content. Account/password and signed-in email exist only in the mounted admin layout's memory; sign-out hides the routes and refresh clears the account. This remains a public frontend simulation, not authentication or server authorization.
- Restored animated feedback on the current navbar while preserving Home, Services, Doctors, Visit, Admin, and Book categories. The existing Next template transition now uses a slightly longer easing; stable scrollbar gutter prevents page-width changes from shifting the shared shell. Reduced-motion preferences disable the added motion.
- Architecture owners updated: `DESIGN.md`, `MOCK_DATA.md`, `GEMINI.md`, and `/architecture/`. Verification completed: ESLint, TypeScript, production build (36 routes), repository tests (8/8), focused browser flows for signup/login/sign-out/direct admin route handling, sidebar active row/collapse, centered booking transition, equal landing-card heights, and dark-mode slider contrast. Visual audits passed at 375/768/1440 for admin gate, booking, services, and landing; responsive touch targets and horizontal stability passed. Next.js admin Instant insights resolved by opting the gated admin page segments out of that validation. No staging or commit.
- Sidebar follow-up: category hover/selection now eases across color and a small horizontal shift; the row highlight is inset from the capsule rail edge and the active blue icon circle remains.
- Booking follow-up: later stages focus the new heading and smoothly center it in view; the initial load does not auto-scroll and reduced-motion users get instant movement.
- Landing follow-up: service cards fill their grid rows so all four sample cards share consistent height. Before/after slider arrows now use the navy brand token for contrast on the white control in dark mode.
- Shared combobox: added `src/shared/components/ui/combobox.tsx` on the installed Base UI primitive and replaced every admin native select with searchable, keyboard-operable options. It is used for calendar dates, appointment status/sort, and reschedule date/time. Its input uses an explicitly associated native label; the user-reported Base UI label warning was corrected.
- Sidebar positioning: desktop admin rail now has a fixed sticky viewport region below the global navbar, a scrollable nav list for short screens, and a balanced bottom inset. Removed the hover translation that made the category row visibly shift during navigation. The public footer now uses the theme's muted surface and text tokens rather than a full dark-blue block.
- Appointment filter spacing: enforced `min-w-0` on shared combobox wrappers and input groups so grid tracks no longer overflow their columns; added a wider desktop gap and kept the three-column filter row for wide screens only.
- Booking stage motion: each newly selected form stage slides in from the right, and reduced-motion preference disables that animation. The focused heading keeps the existing centered scroll behavior.
- Latest verification: no native `<select>` remains under `src/features/admin`. Browser checks cover combobox keyboard search/selection and empty results, status/sort controls, no-console-error behavior, and appointment-filter fit/spacing at 375/768/1024/1280/1440. Calendar checks and sidebar sticky/route position checks pass. ESLint, TypeScript, repository tests (8/8), and build (36 routes) pass. No changes staged or committed.

## Tier 2 Verification
- Tests: eight repository tests cover booking conflicts, duplicate requests, cancellation/rescheduling and protected catalog edits; browser evidence is under `.audit/evolution/`.
- Security: automated secret scan plus manual review of the explicit simulation boundary. Contacts are memory-only; production staff access is not implemented or claimed.
- Static architecture: route/import checks and bounded mock-data scale review. This is static evidence, not a production load or latency benchmark.
- UI/token invariants: shared theme tokens and feature boundaries, with eighteen concrete routes rendered at mobile/tablet/desktop sizes. Machine evidence and final freshness signoff are in the project-local Git metadata; no staging or commit was requested.

## Prior implementation history

The records below describe earlier milestones. Their static-booking and old-theme statements are superseded by the current status above.

## Navbar utility strip removed
- Removed the user-selected desktop utility strip above the sticky navigation. The navbar now starts directly at the top; sample-content labels remain beside the demo sections. `DESIGN.md` records this layout choice.

## Landing-page mock content
- The user requested mockup data. Existing landing sections now use fictional Bluehaven Dental sample details from `src/features/booking/landing-demo-data.ts`: clinic metrics, team names, example address/email/phone, opening hours, testimonials, a sample service menu, and static booking-search values.
- Visible labels distinguish the sample statistics, fictional testimonials, service listings, contacts/hours, and example search from verified clinic information. Contact values have no call, email, or map action. Search stays disabled; no booking, persistence, prices, or verified clinician credentials were introduced.
- Research: web.run accessed the NHS dental treatments guide (`https://www.nhs.uk/live-well/healthy-teeth-and-gums/dental-treatments/`) on 2026-10-19. Observed: the guide describes common categories including fillings, crowns, bridges, root canal treatment, braces, implants, whitening, and veneers. Inference/impact: those terms make the sample care menu plausible for prospective patients reviewing the page. Limits: the source describes general dental treatments, not this fictional clinic; every statistic, person, quote, contact detail, and opening hour is invented demo content. The guide is linked beside the sample menu.
- Verification: lint and mobile/tablet/desktop visual checks passed. Browser assertions confirmed the expected sample cards, disabled search, non-actionable fictional contacts, and no runtime errors. Rendered section captures are in `.audit/mock-screenshots/`. The scale review passed with a documented disposition for fixed literal fixtures. No changes were staged or committed. Work proceeded solo because the requested subagent authorization had not arrived.

## Approved landing CTA and navigation
- Implemented the user-approved navy consultation CTA at full viewport width. Mobile text and photo share one rounded clipping boundary, with a flush join and no inner photo corner cutouts. The photo reuses the project-owned generated consultation asset.
- Replaced the old appointment introduction in page composition, including “Your next step starts here.” The existing static search preview now sits directly beneath the CTA. Booking links in the hero, navigation, and footer land at `#next-step`; the CTA action continues to `#booking-preview`. Booking remains unavailable; no writes or scheduling behavior were added.
- Added desktop dropdown slide-down entry and mobile accordion expansion transitions, with reduced-motion fallbacks. The root reviewed the worker's changes and rendered mobile, tablet, and desktop results.
- Verification: lint and the responsive visual audit passed. The local browser journey `.audit/verify-cta-nav.mjs` checks full-width geometry, mobile corner clipping, booking targets, menu containment at desktop breakpoints, Escape/selection closing, mobile expansion/collapse, reduced motion, and runtime errors. Screenshots and interaction evidence are in `.audit/cta-screenshots/`. The changed-source scale review passed after documenting that the imported search preview is a fixed static display with no retrieval/cardinality owner required.
- Preview is running at `http://localhost:3000`. The confirmed project-owned development server was restarted to refresh a stale stylesheet. No changes were staged or committed.

## BUG TRIAGE LOG
### BUG-2026-ADMIN-LOGIN-REDIRECT — Router state update during `AdminLayoutShell` render on `/admin/login`
- STATUS: RESOLVED
- ROOT CAUSE: `AdminLayoutShell` called `router.replace("/admin/overview")` directly inside its render body when `signedInEmail` was truthy and `pathname === "/admin/login"`, triggering React's `Cannot update a component (Router) while rendering a different component (AdminLayoutShell)` console error.
- CANONICAL OWNER: `src/features/admin/admin-layout-shell.tsx`
- PREVENTION CLASS: DETECTION_ONLY
- VERIFICATION OWNER: `npx tsc --noEmit` and `eslint` check; redirect side-effect moved into `useEffect` while render returns `null`.
- FIXED-BY REFERENCE: `src/features/admin/admin-layout-shell.tsx`
- WHY NOT MECHANICALLY PREVENTABLE: Next.js `router.replace` is a normal method call without a built-in static lint rule for render-body invocation.

### BUG-2026-CTA-NAV — Rightmost dropdown exceeded the viewport
- STATUS: RESOLVED
- ROOT CAUSE: Each desktop dropdown was positioned from its individual trigger's left edge at a fixed wide panel size. At 1440px, “Plan your visit” extended about 120px beyond the right viewport edge.
- CANONICAL OWNER: `src/features/booking/landing-nav.tsx`
- PREVENTION CLASS: DETECTION_ONLY
- VERIFICATION OWNER: Root reviewer; explicit open-menu browser journey at 1024px, 1280px, and 1440px.
- FIXED-BY REFERENCE: Working tree; panels now anchor to the navigation container's right edge.
- WHY NOT MECHANICALLY PREVENTABLE: The current automatic page audit inspects navigation while closed. Open-menu containment was checked in the local browser journey, which is not a committed CI gate.

## Landing page navigation and motion — 2026-10-19
- Replaced the floating pill header with a standard full-width horizontal navbar: logo left, plain section links, and the existing appointment action. Added subtle scroll reveals, staggered card appearances, and hover feedback across the landing page.
- Reveal animation activates only when browser motion is enabled and IntersectionObserver is available. Reduced-motion users and unsupported browsers see all content without reveal delays.
- Replaced the clinic conversation hero photo with an original PNG of a dental implant surgical handpiece. Removed the overlapping note and moved the static search into its own pale-blue row below the image.
- Kept the care-topic section at the current three cards and reused the comparison slider for a second clearly labeled AI-generated illustrative smile pair. FAQ answers now expand and collapse with a short height and fade transition.
- Let the hero image overlap the text column slightly on desktop for a blended composition; it stacks below the copy at tablet and mobile sizes. Replaced the “Booking is not live yet” note with a prominent “Booking” button linking to the search preview.
- Removed the hero eyebrow and the booking search status sentence. Disabled Next.js's development badge so the preview no longer shows the floating black “N” overlay.
- Verification: `npm run lint` passed. The responsive audit passed at 375px, 768px, and 1440px with no horizontal overflow, 17/17 mobile touch targets passing, and all seven mobile action labels meeting the 14px font check. Browser inspection confirmed both sliders, all 29 reveal targets, reduced-motion fallback, FAQ expansion animation, and keyboard movement of the slider (50 → 51). Rendered screenshot captures are in `.audit/screenshots/`.

## Services visual and responsive navbar — 2026-10-19
- Used `Services.png` only as a visual reference for a full-width four-column service-topic grid with blue line icons, centered titles, and short descriptions. The reference screenshot itself is not rendered into the page, and the copy remains general because clinic offerings are unconfirmed.
- Generated an original clinic consultation image for the advanced-care photo background; it uses a distinct composition and does not copy the reference site's photography.
- Reworked the sticky navigation with desktop dropdown groups, descriptions and icons, plus a mobile sheet with accordion submenus. Items point to existing page sections and the appointment preview; no non-existent login or signup flow was added.
- Desktop dropdowns share one active state so opening a different menu closes the previous one. Selecting a menu destination also closes its menu.
- Verification: `npm run lint` and `npm run build` passed. The visual audit passed at 375px, 768px, and 1440px with all 23 mobile targets meeting 44px and no horizontal overflow. Browser interaction confirmed that switching dropdowns leaves exactly one open. Preview is running at `localhost:3000`.

## Status
Foundation scaffolded. A static booking UI preview is now available; no booking or staff-management behavior is implemented.

## Landing page information expansion — 2026-10-19
- Expanded the short preview with general care topics, first-visit preparation, a three-step planning guide, six expandable FAQs, and clinic information placeholders. Added care/FAQ navigation and footer section links.
- Preserved the existing light blue palette, hero, comparison, shared button primitive, and static booking boundary. Clinic treatments, dentist credentials, prices, address, contact details, and hours remain unconfirmed; no fictional claims or booking operations were introduced.
- Research: web.run accessed [NHS dental check-ups](https://www.nhs.uk/live-well/healthy-teeth-and-gums/dental-check-ups/) on 2026-10-19. Observed: check-ups generally involve examining teeth/gums/mouth, discussing oral health, and planning next visits. Inference: a preparation guide and clear answers help prospective patients understand a future visit. Limits: general patient education only; this source does not describe the clinic or define its services. A second ADA resource was inaccessible and was not used. An NHS source link appears beside the general check-up guidance.
- Verification: `npm run lint` passed. Responsive visual audit passed at 375px, 768px, and 1440px with no horizontal overflow and all nine audited mobile targets at least 44px. Playwright verified FAQ click/Enter toggling, all in-page anchor targets, and decoded comparison images. Reviewed desktop and mobile screenshots; extra captures are `.audit/screenshots/expanded-{375,768,1440}.png`.
- Reused the existing local preview without starting or stopping its process. Git inspection used an exact, command-local safe-directory exception; global Git configuration was not changed. The earlier task-compiler ownership limitation remains; no commit or staged checkpoint was performed.

## Landing page visual refactor — 2026-10-19
- Refactored the public landing preview around `_os/_vault/ui/design-references/Dentist.png`: rounded blue navigation, a split headline and clinic-photo hero, pale-blue circles, a blue information ribbon, and roomy rounded cards across the existing care, visit, comparison, planning, FAQ, and clinic sections. Kept the user-selected dentistry-blue booking buttons and their existing preview anchors.
- Audience: prospective dental patients deciding whether and how to arrange a visit. Conversion goal: guide visitors to the clearly marked, currently inactive booking preview. Translation from the reference: use its open white layout, blue elements, prominent image, and simple card hierarchy. Exclusions: the screenshot is a whitening product store; its product imagery, shop flow, testimonials, metrics, guarantees, orange call to action, and claims are not carried over. No clinic-specific facts were invented.
- Field evidence: the supplied local screenshot was the visual source. Existing recorded NHS check-up guidance remains the only source for general check-up copy; the refactor changes presentation and adds no clinical or scheduling claims. Opportunity: give clinic information and the appointment path clear visual hierarchy while preserving accurate preview status.
- Verification: `npm run lint` passed; route visual audit passed at 375px, 768px, and 1440px with 10/10 mobile targets at least 44px and no horizontal overflow. Loaded desktop and mobile screenshots were reviewed. Browser inspection confirmed hero/comparison images decode, in-page links resolve, and the existing FAQ remains keyboard and pointer accessible. Changed-source Scale Gate passed with no query findings.

## Agreed scope
- Patients can book appointments.
- Staff can manage availability and reservations.
- Store patient name and contact details only.
- No online payments; currency is not applicable.
- Default locale: English (`en-US`).
- Initial theme: monochrome; palette tokens are centralized in `src/app/globals.css`.
- Stack: Next.js + shadcn/ui, feature-driven slices with ESLint boundary enforcement.

## Next recommended phase
Define the appointment and clinic availability rules, staff authentication/authorization, and persistence provider before implementing booking writes.

## Verification
- `npm run lint` — passed.
- `npm run build` — passed.
- Visual audit at 375px, 768px, and 1440px — passed with no horizontal overflow.
- Latest UI preview: `npm run lint` passed; visual audit passed at 375px, 768px, and 1440px with no horizontal overflow or undersized touch targets. Scale Gate reported `PASS` with no database queries detected in the changed UI files.
- `npm audit --omit=dev` — zero advisories. Full audit still reports seven high-severity dev-tooling findings through `braces`; see `architecture/gotchas.md`.

## Landing page design refresh — 2026-10-19
- Applied the `DESIGN.md` direction to the public landing preview: warm off-white canvas, monochrome hierarchy, clinical blue booking actions, hairline borders, no shadows/gradients, and a floating glass pill navbar.
- Kept `BookingPreview` and its route usage stable. The search preview, smile comparison, and steps remain distinct section owners; booking remains static and clearly unavailable until clinic data is configured.
- Before/after slider remains a fictional illustrative mockup, not an actual patient result or treatment promise. Expanded its native range input to fill the visual comparison region for pointer, touch, and keyboard use.
- References: 21st.dev and Aceternity Compare informed the draggable reveal pattern; shadcn semantic tokens and local primitives informed styling. No dependencies added.
- Verification for this refresh: `npm run lint` passed; responsive visual audit passed at 375px, 768px, and 1440px with no horizontal overflow or undersized touch targets. Reused the existing project preview at `localhost:3000` without starting or stopping its server. Browser inspection confirmed both accent CTAs use `rgb(212, 255, 63)` with dark text, and the comparison range input fills its 618×463.5px visual frame.

## UI preview research — 2026-10-18
- Audience and use case: prospective dental patients previewing a future appointment request flow; this screen does not submit or retain information.
- Sources: [GOV.UK Design System text input guidance](https://design-system.service.gov.uk/components/text-input/) says text inputs should have visible labels; [NHS England online appointment booking guidance](https://www.england.nhs.uk/long-read/online-appointment-booking/) describes configuring appointment sessions before enabling online booking.
- Observed facts: visible labels are recommended for text inputs; appointment availability depends on configured clinic scheduling.
- Inference and impact: keep the preview fields clearly labeled and show availability as unavailable until clinic rules are defined. No services, durations, dates, hours, or live slots are invented.
- Limits: these public-sector references informed accessibility and workflow cues only; they do not set this clinic's product rules or establish a compliance claim.

## Landing page prototype research — 2026-10-19
- Audience and use case: prospective dental patients exploring a future appointment request flow; the landing page remains a static preview until clinic scheduling rules and provider data are defined.
- Sources and tools: web.run on 2026-10-19 reviewed [Zocdoc's dentist search](https://www.zocdoc.com/dentists) and [Airbnb's search guidance](https://www.airbnb.com/help/article/137); local visual references REF-003, REF-005, and REF-008 were inspected for landing-page hierarchy and photography.
- Observed facts: Zocdoc's dentist search organizes discovery around location, visit reason, provider details, reviews, and availability. Airbnb describes searching with destination, dates, and guest count, then refining results with filters. The supplied local references show a photo-led destination hero, restrained product hero, and long-form landing-page section rhythm.
- Inference and impact: translate the user's Airbnb direction into a prominent search capsule, clear choice labels, generous spacing, warm photo-led storytelling, and a short booking explanation. Do not copy Airbnb assets or travel-specific content. The search action is disabled and the page states that clinic areas, visit types, and live times are not connected.
- Limits: Zocdoc is a US-facing marketplace and Airbnb is a travel product; their workflows are references, not clinic requirements. The app has no configured provider listings, service catalog, clinic location, or live schedule, so the design does not show fictional listings, reviews, or appointment slots.
- Asset: generated an original unbranded clinic conversation photo for `public/dental-visit-hero.png`; it is used with Next.js image optimization.
- Prototype verification: `npm run lint` passed; visual audit passed at 375px, 768px, and 1440px with no horizontal overflow or undersized targets; changed-source Scale Gate passed with no database queries detected.

## Landing page refinement — 2026-10-19
- Replaced the split hero composition with an oversized two-line editorial headline, a narrow supporting aside, a panoramic care photograph, and an attached rounded search dock. Aligned hero and comparison to the same content grid while retaining the Opal palette and existing components.
- Expanded the smile comparison into a full-width editorial panel; retained its native range control and `aria-controls` relationship. Replaced the generic steps with a compact closing conversion section, refined the floating navigation mark, and added anchor offsets below the sticky dock.
- Rebalanced the 640–1023px search layout to show three equal fields and a separate disabled Search action row.
- Verification: `npm run lint` and `npm run build` passed after the composition refactor. Final screenshots were visually inspected at 375px, 768px, and 1440px; the audit reported no horizontal overflow and 5/5 mobile targets at least 44px. Chromium confirmed keyboard movement (50 → 51), pointer drag (→ 85), disabled search, and the booking anchor landing below the dock (112px from the viewport top). Earlier click and touch-drag checks also passed.
- Latest screenshots: `.audit/screenshots/mobile.png`, `.audit/screenshots/tablet.png`, and `.audit/screenshots/desktop.png`.

## Brand accent update — 2026-10-19
- Replaced the chartreuse booking accent with clinical blue and white action text; the lighter accent is `#55A9DC` with `#398FC5` hover. Dark mode uses `#82C9F2` for contrast.
- Updated `DESIGN.md` and project notes to match the blue palette.

## Al Fawzy-style landing page — 2026-10-19
- Reworked the landing page toward the structure of the Al Fawzy Dental homepage and made the utility/navigation header sticky. Sections now follow a clinic-site flow: photo hero, clinic approach, care guide, first-visit guidance, illustrative smile gallery, visit planning, appointment preview, FAQs, clinic information, and multi-column footer.
- Kept this project’s established blue theme and its existing original/generated clinic and illustrative assets. The reference’s brand identity, copy, photography, reviews, ratings, metrics, and clinic-specific claims are not reused. Booking and clinic contact/schedule data remain unavailable placeholders.
- Research: web.run accessed [Al Fawzy Dental homepage](https://alfawzydental.com/) on 2026-10-19. Observed: its navigation leads to clinic story/team, services, welcoming/visit content, testimonials, portfolio, and contact; the page contains a photo-led care hero, review section, service highlights, clinic story, cases, consultation and appointment prompts, branch information, and FAQs. Inference: this sequence is a useful clinic-homepage pattern for prospective patients. Impact: the project now follows a similar section rhythm and clearer appointment path. Limits: the reference describes a different clinic; its factual claims and assets do not apply to this project.
- Verification: `npm run lint` passed. Visual audit passed at 375px, 768px, and 1440px with no horizontal overflow and all audited mobile controls meeting 44px touch targets. Browser review confirmed the header remains at `top: 0` while scrolling, the smile illustrations load after scroll, and the page has no browser runtime errors. Closed the project-owned preview process on port 3000 at the user's request after visual review.

## BUG TRIAGE LOG
### BUG-2026-002 — ExpandableCard modal uncentering, stacking underneath siblings, and scale stretching
- STATUS: RESOLVED
- ROOT CAUSE: Three interacting factors: (1) An ancestor route container (`.route-enter` in `template.tsx`) retained an active CSS transform (`matrix(1, 0, 0, 1, 0, 0)`), which under CSS Transforms specs turned it into a containing block for `position: fixed`, trapping the overlay relative to the multi-thousand-pixel route container instead of the viewport. (2) Upstream Badtz-UI (`https://badtz-ui.com/r/expandable-card.json`) applied `layoutId` without `layout="position"` to multi-line text elements (`title`, `description`), used mismatched image aspect ratios between card and modal, and kept expanded detail containers mounted inside `<AnimatePresence>` during close; when morphing between 660px and 302px widths, Framer Motion applied non-uniform 2D CSS scale transforms (`scaleX`/`scaleY`) that distorted glyphs and squished images/text. (3) On close, `<AnimatePresence>` immediately unmounted the plain `div.fixed.z-[100]` modal wrapper and handed `layoutId` projection back to the grid card (`z-index: auto`), causing the closing card to animate underneath subsequent grid cards in DOM order and underneath the `z-10` backdrop.
- CANONICAL OWNER: src/shared/components/ui/expandable-card.tsx
- PREVENTION CLASS: VISUAL_AUDIT
- GUARD / TEST PATH: Playwright multi-viewport bounding box, mid-animation `document.elementFromPoint` / `zIndex` verification, and snapshot inspection at 375px, 768px, and 1440px
- VERIFICATION OWNER: UI Architect
- FIXED-BY REFERENCE: Restored the authentic Badtz-UI shared-layout (`layoutId`) morphing animation (`card`, `image`, `category`, `heading`, and rotating `+`/`×` `button`) while fixing all three bugs at the root: (1) portaled the backdrop and centered modal wrapper to `document.body` via `createPortal` with `useSyncExternalStore` hydration safety and `backwards` fill-mode on `.route-enter`; (2) enforced monotonic `zIndex` elevation (`++elevationSequence >= 60`) on the active and closing grid card until `onLayoutAnimationComplete`, keeping it above sibling cards (`z-0`), the navbar (`z-40`), and the fading backdrop (`z-50`); and (3) used `layout="position"` on text/header/button elements plus matching `aspect-[2/1]` image containers across collapsed and expanded states so FLIP scaling is 100% isotropic with zero text or image stretching.

## Next recommended phase
Provide verified clinic identity, service, team, location, hours, and contact details plus approved clinic photography so the current informational placeholders can be replaced accurately.

