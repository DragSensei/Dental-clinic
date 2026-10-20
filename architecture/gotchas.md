# Gotchas and open decisions

## 2026-10-20 — Website simulation and framework integration
- Browser memory owns the demo snapshot. Use Next Link for internal routes; full reload resets appointment/contact/catalog edits. Appearance preferences are the only persisted browser values. `/admin` is public demo access, never a production staff authorization boundary.
- Next16.4 Cache Components and partial prefetching require Suspense around pathname-dependent navigation and around **leaf** async dynamic-param resolvers. A build alone missed some instant-shell prefetch failures; verify real detail-page navigation too. Fixed service/doctor IDs have static params; arbitrary appointment IDs retain runtime resolution.
- Base UI buttons default to ordinary buttons. Form actions must explicitly use `type="submit"`; lint/types do not catch a save button that never submits.
- Long valid contacts require min-width constraints and wrapping in review/confirmation. Booking step changes should move focus to the new heading and center it smoothly (instant with reduced motion); confirmation/error recovery keeps its sticky-header-aware start alignment.
- Keep static range-control styles in CSS. React19 hydration may warn when browser-normalized inline shorthand differs from the serialized style object.
- The admin signup/login screen is only an in-memory UI demo. Every admin route is visually gated, but the client can be bypassed; do not treat it as protection for patient data or real staff operations.
- Next streamed `notFound()` responses can retain HTTP200 after streaming begins; the UI still renders the dedicated not-found recovery. Do not use a streamed HTTP status alone to assess unknown-ID recovery.
- `.audit/` contains ignored evidence and isolated worktrees; ESLint ignores it to avoid scanning generated bundles. Application source remains checked.

## 2026-10-18 — Booking rules are not defined yet
What to check: Before adding database writes, define appointment duration, clinic hours, staff availability, cancellation/rescheduling, and conflict handling.
Why: These rules shape the appointment model and prevent double-booking.

## 2026-10-18 — Staff authorization is not defined yet
What to check: Define staff roles and server-side authorization before exposing schedule or reservation management actions.
Why: A UI-only gate cannot protect patient contact details or staff operations.

## 2026-10-18 — Development dependency audit has an upstream advisory
What to check: Re-run `npm audit` and update the tooling tree when upstream fixes are published. The remaining findings are high severity and dev-only, through `braces` in the ESLint tooling; the published advisory lists no patched release. `handlebars` is pinned to patched version 4.7.10.
Why: `npm audit fix --force` proposes downgrading Next's ESLint config to a version incompatible with this Next.js app. The production dependency audit is clean.
