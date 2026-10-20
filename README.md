# Dental Reservation system

A Next.js clinic website with service and clinician pages, staged simulated booking, and a public admin demonstration.

## Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

- `src/app/` — routes and page composition
- `src/features/` — isolated business feature slices
- `src/shared/` — shared UI primitives and utilities
- `src/app/globals.css` — central shadcn theme and brand tokens
- `architecture/` — architecture decisions and pending domain rules

Change `--brand-primary`, `--brand-hover`, `--brand-subtle`, and `--brand-border` in `src/app/globals.css` to try another theme. ESLint enforces the app → feature/shared and feature → shared/same-feature boundaries.

Current product scope is public patient booking, staff schedule management, patient name/contact details only, no payments, and English (`en-US`). The appointment model, staff authorization, clinic hours, service durations, and persistence provider remain undecided.

<details>
<summary>What exists and what to test</summary>

### What exists

- Public clinic landing page, service directory and details, clinician directory and profiles, and a first-visit guide.
- A staged `/book` demo: choose a service, clinician, date and time, enter contact details, review, then see a confirmation. Back navigation preserves selections and the steps animate between stages.
- An `/admin` demo gate followed by overview, appointments and appointment details, calendar, clinicians, services, patients, and settings. Admin search, filters, scheduling edits, catalog edits, and reset are simulated.
- Shared animated navigation, light/dark themes, responsive layouts, keyboard-accessible controls, and reduced-motion support.

Booking and admin data live in browser memory. Refreshing resets the demo; there is no real reservation, staff authentication, message delivery, or server persistence. Use fictional contact details only. Theme preference may persist separately.

### Manual test checklist

1. Browse the landing page, `/services`, `/doctors`, and `/visit`; follow a service or clinician card to its detail page and use its booking link.
2. At `/book`, select a service and clinician, continue through date/time, contact, review, and confirmation. Check that each step transitions smoothly, the form stays centered, Back preserves prior inputs, and invalid or unavailable choices show feedback.
3. Open `/admin`, enter the demo, and try the overview, appointment search and filters, appointment details/rescheduling, calendar filters, clinician/service editing, patient list, settings, and reset. Check the admin comboboxes with typing and keyboard selection.
4. Repeat navigation and form interactions in light and dark themes, at a narrow/mobile width, and with the operating system's reduced-motion setting enabled.

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
