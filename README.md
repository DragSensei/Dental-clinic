# Dental Reservation system

A Next.js clinic website with service and clinician pages, staged simulated booking, and simulated admin, doctor, and patient dashboards.

## Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Restart the dev server after moving or renaming route folders; a running server can keep serving the old route tree.

Demo sign-in lives at `/admin/login` (for example `admin@bluehaven.example` or `mariam.a@example.com`, password `clinic-demo-123`). Admins and doctors land on `/admin/overview`; patients land on `/patient/overview`.

### Optional Google integration

Copy `.env.example` to `.env.local` and fill in `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` to enable "Continue with Google" (`/api/auth/google`) and Google Calendar event creation (`/api/google/calendar`). Without them, both fall back to demo sign-in and a Google Calendar web link.

## Project structure

- `src/app/` — routes and page composition, split into two route groups:
  - `(site)/` — public marketing pages with the global navbar and footer
  - `(app)/` — admin/doctor (`/admin/*`) and patient (`/patient/*`) dashboards with a slim app toolbar and sidebar, without marketing chrome
  - `api/` — Google OAuth and Calendar route handlers
- `src/features/` — isolated business feature slices (`admin`, `patient`, `booking-flow`, `public`, …)
- `src/components/` — `ui/` shadcn primitives, `shared/` reusable blocks (dashboard sidebar, bottom nav, signature pad), and global shells (`site-nav`, `site-footer`, `app-top-bar`)
- `src/data/`, `src/lib/`, `src/i18n/` — mock clinic repository and session, utilities, English/Arabic dictionaries
- `src/app/globals.css` — central shadcn theme and brand tokens
- `architecture/` — architecture decisions and pending domain rules

Change `--brand-primary`, `--brand-hover`, `--brand-subtle`, and `--brand-border` in `src/app/globals.css` to try another theme. ESLint enforces the app → feature/shared and feature → shared/same-feature boundaries.

Current product scope is public patient booking, staff schedule management, patient name/contact details only, no payments, English (`en-US`) by default, with Arabic (`ar`, right-to-left) selectable from the navbar language combobox. The appointment model, staff authorization, clinic hours, service durations, and persistence provider remain undecided.

<details>
<summary>What exists and what to test</summary>

### What exists

- Public clinic landing page, service directory and details, clinician directory and profiles, and a first-visit guide.
- Service cards on `/services` and the homepage care guide now feature an uncluttered presentation with plus buttons removed from collapsed cards. Clicking any card opens a detailed clinical procedure modal with an explicit close button and a direct "Book now" action.
- Automatic service selection in the booking form: Clicking "Book now" from any service card links directly to `/book?serviceId=...` and automatically pre-selects the treatment with an accessible checkmark indicator and active state.
- Standardized error handling with shadcn `alert-error-with-everything`: Any runtime or user error across the site (booking validation and submission failures, root error boundaries, admin authentication, service editing, and account creation) displays a unified, high-contrast error alert with icon, title, description, retry, and dismiss actions.
- A staged `/book` demo: choose a service, clinician, date and time, enter contact details, review, then see a confirmation. Back navigation preserves selections and the steps animate between stages.
- A patient dashboard (`/patient/overview`, `appointments`, `forms`, `treatment-plan`, `care`, `billing`): a next-visit card with attendance confirmation and calendar export, a to-do list for recalls and forms, booking/rescheduling with a 24-hour cancellation lock, a 3-step intake wizard with e-signature, an interactive FDI tooth chart with phased cost estimates, visit summaries, and simulated invoice payment.
- An `/admin` demo gate followed by overview, appointments and appointment details, calendar, clinicians, services, patients, and settings. Admin search, filters, scheduling edits, catalog edits, and reset are simulated.
- Shared animated navigation, light/dark themes, responsive layouts, keyboard-accessible controls, and reduced-motion support.

Booking and admin data live in browser memory. Refreshing resets the demo; there is no real reservation, staff authentication, message delivery, or server persistence. Use fictional contact details only. Theme preference may persist separately.

### Backend foundation

Use the [synapsys-tech/nextjs-template](https://github.com/synapsys-tech/nextjs-template) as the starting template for the future backend integration. Connect this demo to it only after defining the clinic's appointment, availability, persistence, and staff-access contracts; the current app does not yet use that backend.

### Manual test checklist

1. Browse the landing page, `/services`, `/doctors`, and `/visit`; follow a service or clinician card to its detail page and use its booking link.
2. At `/book`, select a service and clinician, continue through date/time, contact, review, and confirmation. Check that each step transitions smoothly, the form stays centered, Back preserves prior inputs, and invalid or unavailable choices show feedback.
3. Sign in as a patient and walk through `/patient/overview` (confirm attendance, to-do actions), `/patient/appointments` (book, reschedule, cancel), `/patient/forms` (Continue/Back through the 3 steps, toggle "no changes"), `/patient/treatment-plan` (select teeth, approve the plan), and `/patient/billing` (pay an invoice). Confirm dashboards show the app toolbar rather than the marketing navbar.
4. Open `/admin`, enter the demo, and try the overview, appointment search and filters, appointment details/rescheduling, calendar filters, clinician/service editing, patient list, settings, and reset. Check the admin comboboxes with typing and keyboard selection.
5. Repeat navigation and form interactions in light and dark themes, at a narrow/mobile width, and with the operating system's reduced-motion setting enabled.

### Automated checks

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

The focused repository tests use Node 22 TypeScript stripping and an alias loader; Node may print experimental-loader/module-format warnings. No additional test dependency is needed.

See [MOCK_DATA.md](MOCK_DATA.md) for canonical data owners, simulated scheduling assumptions, and backend replacement steps. [DESIGN.md](DESIGN.md) owns current design decisions; [IMPLEMENTATION_PROGRESS.md](IMPLEMENTATION_PROGRESS.md) records review and verification progress.

</details>
