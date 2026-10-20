# Project state

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

## Next recommended phase
Provide verified clinic identity, service, team, location, hours, and contact details plus approved clinic photography so the current informational placeholders can be replaced accurately.
