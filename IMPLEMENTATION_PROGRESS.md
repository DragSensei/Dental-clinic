# Website evolution — implementation ledger

## Scope and decisions
- Preserve actual navy/white/pale-blue clinic identity and existing imagery. `globals.css` remains the theme owner.
- User authorized end-to-end **simulated** booking and client-side admin management. No production writes, payments, authentication, or additional patient fields. Name/email/phone remain memory-only; reload resets the demo.
- Shared in-memory repository and typed fixtures under `src/shared/data/` respect feature import boundaries. No new dependency or database migration.
- Persistent global navigation in root layout; admin navigation is additional. User supplied overview and collapsed-sidebar references on 2026-10-20, explicitly authorizing matching expanded sidebar, animated collapse/expand, and light/dark modes. Preserve clinic blue/navy while applying supplied panel/rail geometry.
- Public destinations: `/`, `/services`, `/services/[id]`, `/doctors`, `/doctors/[id]`, `/visit`, `/book` (staged query navigation).
- Admin destinations: `/admin`, `/admin/appointments`, `/admin/appointments/[id]`, `/admin/calendar`, `/admin/doctors`, `/admin/doctors/[id]`, `/admin/services`, `/admin/services/[id]`, `/admin/patients`, `/admin/settings`.

## Ownership and execution
- Three isolated Git worktrees under ignored `.audit/worktrees/`, seeded with existing uncommitted project files; no existing work staged or committed.
- foundation_booking (Luna): shared data/repository/hook, booking flow/routes, landing fixture adapter.
- public_shell (Luna): public routes/service cards, persistent navigation/footer, shared page CSS and route states/motion.
- admin (Luna): admin routes/views/navigation and simulated management.
- Root: architecture decisions, documentation, selective diff review, integration, focused tests/browser visual checks, shared button sizing.
- Reference steering: admin owns reference-aligned overview/sidebar; public_shell additionally owns global theme provider/toggle and theme tokens. Sidebar imports shared ThemeToggle.
- Shared contract published before dependent implementation; root copies completed shared files to dependent isolated checkouts.

## Discovery and gaps
- Existing application is a landing preview only; no booking/admin backend or staff authentication exists.
- `DESIGN.md` incorrectly described reference image usage; actual UI uses original generated consultation image and services icon grid.
- Older theme/static-preview descriptions conflict with actual blue UI and newly authorized simulation.
- Relevant workflow requires shared primitives/tokens, operational states, >=44px targets, responsive visual review, and reduced motion. No canonical approximately-20-laws list found in selected policy; named principles are connected to concrete implementation in updated design documentation.

## Research (2026-10-20)
- W3C WAI multi-page forms: https://www.w3.org/WAI/tutorials/forms/multi-page/ (web.run). Observed: logical form stages, visible progress, revisitable completed stages preserving inputs. Applied inference: focused booking stages with review and back navigation suit prospective patients. Does not define clinic scheduling policy.
- W3C animation guidance: https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html (web.run). Observed: nonessential interaction motion can be disabled. Applied inference: small route/card feedback with reduced-motion fallback. This is design guidance, not a compliance certification.
- Local Next.js installed docs consulted for persistent layouts and route behavior; preserve approved installed stack.

## Status and acceptance
- Follow-up request: every admin route is gated by an open signup/login demo screen; credentials/access remain in mounted React memory only, and sign-out returns to the gate. This is deliberately not staff authorization. The public navbar preserves the existing categories with active underline/staggered entry, and the existing template transition plus stable scrollbar gutter address navigation/layout jumping. Reduced motion disables transitions. Focused validation pending.
- Discovery, implementation, integration, and review revisions complete. Final source-bound verification is recorded below.
- Shared API published and synced. Review corrected inverted feature/shared fixture dependency, atomic rescheduling, doctor/service edit conflict protection, frozen catalog typing, and a contradictory conflict test assertion.
- Public initial lint/type checks passed; root requested restored tooth logo, whole-card focus/click treatment, detail-route active navigation, direct footer booking destination, truthful visit CTA, and actual route-error recovery.
- Admin review revisions delivered coherent view extraction, visible save feedback, pending guards, tabular stats, and the supplied reference-aligned expanded/collapsed sidebar in both themes.
- Booking root review requested actionable validation, meaningful mobile progress, completed-step navigation, compatible clinician preselection, invalid-step guards, and focused confirmation/recovery links.
- Follow-up shared-combobox request: added a reusable string-valued Base UI combobox in `src/shared/components/ui/combobox.tsx` and applied it across the full admin dashboard: calendar dates, appointment status/sort, and reschedule date/time. Search, keyboard selection, no-results feedback, shared theme tokens, and responsive sizing are covered by a focused browser check. A runtime accessibility warning on Base UI's trigger-only `Combobox.Label` was corrected by associating a native label with the input.
- Sidebar follow-up: pinned the desktop rail beneath the global navbar in a viewport-height shell with balanced end spacing; its links scroll inside the capsule on short screens. Removed the row translation tied to pointer hover that contributed to the Services navigation shift. The public footer now uses muted semantic theme tokens for a quieter finish.
- Filter spacing correction: the combobox's intrinsic minimum width was exceeding its grid track. Added `min-w-0` at the shared control boundary, added more horizontal gap, and delayed the three-column appointment-filter layout until wide desktop. Browser checks confirm the status and sort controls remain separated and inside the panel at five widths.
- Booking transition: added a short right-to-left stage entrance when `/book` advances, with a reduced-motion override. The focused step heading and centered scrolling remain intact.
- Existing server on port 3000 was verified as this project via Next's exact directory/PID report; baseline desktop captured and visually inspected at `.audit/evolution/baseline-desktop.png`.
- Root restarted the proven project-owned stale preview; shared navigation/theme now render correctly. Preview: `http://127.0.0.1:3000`.
- Integrated production build passed 35/35 generated pages. Follow-up runtime checks caught new Next Cache Components instant-shell requirements; dynamic public/admin resolvers now have leaf Suspense, navbar pathname detection has a dimension-preserving boundary.
- Responsive admin audit passed375/768/1440 with14/14 mobile targets and no spill. Root inspected light/dark expanded and collapsed screenshots. Appearance test exercises theme persistence and reduced-motion properties.
- Long-contact booking QA found actual overflow and sticky-heading focus defects. Worker fixed wrapping/scroll margins; root reran34 browser assertions, all passed.
- Admin browser journey found missing explicit submit types on Base UI form buttons. Worker added submit/button types; root verified actual reschedule/cancel/catalog edit flows.
- Source changes from public reviewer were limited to four already-owned files (smooth-scroll metadata and reduced-motion loading classes); root inspected these changes. No unrelated drift accepted.
- ESLint now ignores ignored `.audit/` worktree/generated evidence; this excludes generated bundles while retaining all application source checks.
- Landing now previews4services; full12 belong to `/services`. Canonical service-icon map fixes mismatched topic icons. Static slider CSS removed hydration warnings; all4comparison images decode and keyboard slider50→51 verified. Brand SVG browser icon added.
- Production build passed36generated pages. Optimized-server browser flow passed18checks including search/filter/sort, calendar, patients, clinician/service edits, reset, and cross-public consistency with zero JS errors.
- All4Tier2 pillars and18 rendered route audits passed. Added thin frontend verifier reusing existing ESLint boundaries and concrete visual route mappings (including removed starter assets) for the initially untracked project. No OS code changed.
- Long-contact admin stress tests passed7checks after fixes: list/detail/patients at375/1440 fit; table View target44×44. Root inspected the revised mobile detail screenshot.
- Final cache revision passed: explicit service/provider entries synchronize retained `/book` state; query-free Back preserves service/clinician/date/time and contact details. Empty clinician eligibility has recovery text and disabled Continue. Six focused checks passed on the optimized server; original booking suite remains34/34.
- Final source lint, TypeScript, and production build passed36generated pages; optimized-server integrated journeys passed18/18 with zero browser errors. Appearance7/7 and long-admin7/7 checks passed. Root reviewed delegated diffs and responsive screenshots at375/768/1440 in both themes.
- Remaining product boundary: real availability, persistence, staff authentication/authorization and notification delivery require approved backend contracts. Public admin and booking remain visibly simulated; contacts remain memory-only.
