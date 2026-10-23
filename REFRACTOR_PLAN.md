# Refactor: Align the booking landing page with `Dentist.png`

## Scope
Refresh the existing booking preview to use the supplied dental reference's clean white canvas, blue header and hero accents, oversized image led two column hero, and generous information cards. Preserve current clinic facts, booking preview behavior, and the selected dentistry blue. No duplicated behavior is being extracted.

## Usage inventory
- [x] `src/app/page.tsx` — sole route entry; calls `BookingPreview`.
- [x] `src/features/booking/booking-preview.tsx` — sole composition owner; imports each landing section directly.
- [x] `src/features/booking/landing-hero.tsx` — direct use from `BookingPreview`; sole owner of `BookingSearchPreview`.
- [x] `src/features/booking/booking-search-preview.tsx` — nested under hero; anchor `#booking-preview` is targeted by navigation and visit CTA.
- [x] `src/features/booking/landing-nav.tsx` — direct use from composition; in-page targets are `#home`, `#care`, `#how-it-works`, `#questions`, and `#booking-preview`.
- [x] `src/features/booking/care-guide.tsx`, `visit-guide.tsx`, `before-after-comparison.tsx`, `how-it-works.tsx`, `booking-faq.tsx`, `clinic-information.tsx`, `landing-footer.tsx` — one direct call each from `BookingPreview`; no additional source, test, dynamic, route, or documentation call sites found for their component names.
- [x] `src/app/globals.css` — central theme tokens; styling source for the reference palette.
- [x] `DESIGN.md` — existing visual contract; user-selected reference supersedes its monochrome art direction.

## Milestones
- [x] 0 — Inspect `Dentist.png`, read the current design contract, trace route and component call sites, and record baseline unrelated worktree changes.
- [x] 1 — Record the selected visual direction in `DESIGN.md` and update shared page color tokens.
- [x] 2 — Restyle navigation, hero, and booking preview to match the reference hierarchy while preserving every anchor and disabled booking state.
- [x] 3 — Restyle the existing information sections and finish with responsive, accessibility, lint, and route visual checks.

## Completion
- Lint passed. The route visual audit passed at 375px, 768px, and 1440px with 10/10 mobile touch targets at least 44px and no horizontal overflow. Browser review confirmed the hero, navigation, and loaded smile comparison images render in the selected layout.
- Scale Gate passed with no database query findings. No booking/search behavior was added or changed.

## Existing worktree state
Before this task, the project had unrelated modified, deleted, and untracked files across app setup, design assets, and feature modules. Keep this refactor scoped to the booking page components, theme, design notes, and this plan; do not stage or revert pre-existing work.

## Notes
- The screenshot advertises a particular teeth-whitening product, audience metrics, guarantees, and order flow. Do not copy its marks, imagery, clinical claims, commerce content, or unsupported clinic facts.
- Keep the recent user-selected blue action color; the reference's orange CTA is not part of this adaptation.
