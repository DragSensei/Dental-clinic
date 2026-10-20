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

## Demo routes and data

Explore `/services`, `/doctors`, and `/visit`, then `/book` for the complete simulated journey. `/admin` provides appointment management, calendar, clinician/service editors, session-derived patient contacts, and reset. The shared navbar supports light and dark modes. The dashboard uses the user-supplied overview and capsule sidebar references, adapted to the existing clinic palette.

All scheduling and admin changes are simulated in browser memory. Refresh resets the session; no real reservation, login, message delivery, or server persistence is provided. Enter fictional contacts only. Theme preferences may persist separately.

See [MOCK_DATA.md](MOCK_DATA.md) for the canonical data owners, simulated scheduling assumptions, and backend replacement steps. [DESIGN.md](DESIGN.md) owns current design decisions; [IMPLEMENTATION_PROGRESS.md](IMPLEMENTATION_PROGRESS.md) records review and verification progress.

## Verification

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

The focused repository tests use Node 22 TypeScript stripping and an alias loader; Node may print experimental-loader/module-format warnings. No additional test dependency is needed.
