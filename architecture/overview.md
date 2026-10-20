# Architecture overview

## Stack
- Next.js App Router, React, TypeScript, and Tailwind CSS 4.
- shadcn/ui uses Base UI primitives and CSS variables.
- ESLint `eslint-plugin-boundaries` enforces local import boundaries.

## Source layout
- `src/app/` owns routes, layouts, metadata, and composition.
- `src/features/<feature>/` owns isolated business capabilities.
- `src/shared/` owns reusable UI and utilities.
- `src/shared/components/ui/` owns site-wide form primitives; `AppCombobox` wraps Base UI's accessible combobox and accepts string-valued labeled options. Every admin select/filter uses it for consistent search, keyboard interaction, and empty states.

## Theme
`src/app/globals.css` is the only theme source. Change the four `--brand-*` tokens there to rebrand; semantic shadcn tokens map to those values. The current palette is navy, white, pale blue, and sky blue.

## Product boundary
The agreed scope is patient booking and staff schedule management with patient name/contact only. No database or auth provider has been selected. The user authorized in-memory booking/admin simulations on 2026-10-20; they are publicly accessible demo screens, never a protected staff system. Reload resets all edits and contact data.

## Evolution boundaries
- Root layout owns persistent shared site navigation; `/admin` has additional section navigation.
- The admin layout gates its simulated routes with a session-only demo signup/login state; no real authentication, server authorization, or persisted credentials exist.
- `src/features/public/`, `src/features/booking-flow/`, and `src/features/admin/` own separate workflows. Existing landing content remains in its established feature.
- `src/shared/data/mock/` owns all fictional domain fixtures and types; the shared repository owns availability, conflict checks, and simulated mutations. Features consume this owner without cross-feature imports.
- See `IMPLEMENTATION_PROGRESS.md` for routes, ownership, review findings, and current verification status.
