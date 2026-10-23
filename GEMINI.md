# Dental Reservation system

## What this is
A web app foundation for public dental appointment booking and staff schedule management.

## Stack
Next.js App Router, React, TypeScript, Tailwind CSS 4, and shadcn/ui.

## Conventions
App routes compose isolated features. Features may use shared code and their own slice; cross-feature imports are blocked by ESLint. Shared UI and utilities live under `src/components/` (`ui/`, `shared/`, and global blocks), `src/lib/`, `src/data/`, and `src/i18n/`. The theme source is `src/app/globals.css`.

See `architecture/` for decisions, data-model status, and domain questions that need resolution before backend work.

## Features
- Project foundation — created 2026-10-18.
- Clinic website — existing photo-led blue/navy identity and illustrative smile comparison, persistent navbar, dedicated service/clinician/visit pages, and light/dark appearance.
- Simulated booking and admin — added 2026-10-20; staged booking, shared in-memory data, appointment/calendar management, catalog editors, and session-derived patient list. No production booking, auth, persistence, messaging, or payments. See `MOCK_DATA.md`, `DESIGN.md`, and `IMPLEMENTATION_PROGRESS.md`.
- Admin demo signup/login and animated navigation transitions — added 2026-10-20; credentials are memory-only and the gate is not real authentication. See `architecture/decisions.md` and `architecture/gotchas.md`.

## Known gotchas
See `architecture/gotchas.md`.
