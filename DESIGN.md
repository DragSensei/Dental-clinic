# Design Language

## Ownership and audience
- Source of truth: this file and the semantic theme tokens in `src/app/globals.css`.
- Audience: prospective patients exploring dental care and a simulated appointment journey, plus reviewers using the public admin demonstration.
- Impression: established, welcoming dental clinic with clear routes to learn, prepare, and book.

## Visual direction
- Primary reference: [Al Fawzy Dental homepage](https://alfawzydental.com/). Follow its section order: hero, patient satisfaction, patient metrics, advanced-care feature, clinic story, services, cases, consultation, appointment, branches, FAQs, and footer.
- Keep this product's navy, white, pale-blue, and sky-blue palette from `globals.css`; use clear full-width sections, large headings, straightforward cards, and clinic photography.
- Close the visit guide with a full-viewport-width rounded navy consultation panel, sky-blue primary action, and first-visit guide link. On mobile, copy and the flush-edge consultation photo share one rounded clipping boundary. Booking actions lead to `/book`; clearly label its simulated status.
- Keep the primary navigation sticky at the top, without a utility strip above it.
- `Services.png` informed the service-topic icon grid; the reference screenshot is not a product asset. The advanced-care feature uses the project-owned generated consultation image.
- Use existing project-owned generated imagery and illustrative comparison assets. Do not reuse Al Fawzy's name, logo, photography, reviews, ratings, metrics, or copy.

## Responsive and accessibility behavior
- Reflow the navigation and section grids for mobile; keep natural page scrolling and avoid horizontal overflow.
- Keep keyboard focus visible, interactive targets at least 44px, and existing FAQ and comparison controls keyboard-operable.
- Respect reduced-motion preferences.

## Product truth
- The 2026-10-20 mission authorizes functional **simulated** booking and admin changes. No real reservation, message delivery, payment, authentication, or server persistence is implied.
- Central fictional fixtures belong to `src/shared/data/mock/`; the old landing data file is a compatibility export. Labels distinguish fictional clinic facts, illustrative smiles, testimonials, clinicians, and scheduling from verified information.
- Patient inputs are name and contact details only. Data and edits live in browser memory; refresh or resetting the demo discards them. Admin routes are a public demonstration, not authenticated staff access.
- Sample durations, dates, time slots, and appointment statuses illustrate interaction only. Production scheduling, timezone, concurrency, retention, and staff access policy require explicit contracts.

## Shared application grammar
- Public marketing routes (`src/app/(site)/`) keep the persistent global navbar and footer, with Next.js client navigation. Authenticated dashboards (`src/app/(app)/`: admin, doctor, patient) never show the marketing navbar, its "Open dashboard" action, or the footer; they use a slim 56px app toolbar (brand link to the public site, "View website", language, theme) plus the dashboard sidebar exactly once. Approved 2026-10-24 for all dashboards.
- Dashboard content starts beside the sidebar (no centered gutter). Overview/plan/list pages may use up to `max-w-7xl`; long forms stay left-aligned at about `max-w-3xl` for readable line length.
- Dashboard screens show at most one solid primary action at a time; secondary actions use outline/ghost variants. Never present the same record twice on one screen (e.g. a confirmation banner duplicating the next-visit card). Show appointment times in the clinic's local time, not UTC labels.
- Borders define top-level surfaces only. Inside a card, group content with spacing, a subtle `bg-muted` tint, or a divider instead of nested bordered boxes; selected states may use a ring.
- User-approved admin references (2026-10-20): Image #1 (`72c801b1a27aef0e177c4bef1082eb7b.jpg`) supplies overview hierarchy: four summary cards, rounded panels, clear sidebar and a larger schedule region. Image #2 (`798c70d3fa3c5c57f3627575cb780782.jpg`) supplies the collapsed capsule rail, evenly spaced icons, and circular active selection; the expanded sidebar adds matching labels and spacing. Translate both into the clinic's blue/navy tokens in **light and dark modes**. Use actual appointment/catalog data, not reference revenue/orders or invented growth charts. Do not reproduce the reference's presentation backdrop gradients.
- Sidebar width and label/active feedback animate briefly and respect reduced motion. Provide named icon buttons, current-page indication, and a 44px expand/collapse control. The global navbar remains persistent and uses the same identity in both modes. Store only theme/navigation preferences, never contact data, in browser storage.
- Keep the desktop admin rail sticky below the global navbar with balanced top/bottom whitespace; allow its link list to scroll on short viewports. Use a softer pale-blue footer surface so the closing site links remain clear without overpowering the page.
- Keep the existing Home, Services, Doctors, Visit, Admin, and Book categories in the restored animated navbar. Use a short active/hover underline and restrained staggered entry; page changes use a subtle fade/vertical settle. All motion respects reduced-motion settings.
- Place every admin route behind a clearly labeled demo signup/login screen. Demo credentials and access live only in memory and disappear on refresh/sign-out. Explain that this does not secure real clinic data.
- New public pages use a common content width, eyebrow/title/description rhythm, generous vertical spacing, and bordered surfaces. Admin siblings share their own canvas and header baseline. Keep natural document scrolling.
- Typography follows the existing sans-serif hierarchy; navy headings, muted body text, sky-blue actions. Use theme variables, shared button variants, consistent rounded borders, and tabular numerals for schedule/statistics data.
- Service cards have individual bordered regions, room between cards, visible focus, useful metadata, and a directional hover/focus cue. Whole-card destinations open service details; detailed booking links preselect the relevant service/provider.
- The landing page previews four service cards; `/services` owns the complete twelve-item sample menu. Service icons use one shared stable-ID map so landing, directory, and edited catalog labels stay consistent.
- Booking progressively discloses service, clinician, date/time, contact, review, and simulated confirmation. Preserve entered values when navigating completed steps; guard future steps and unavailable selections.
- On booking step changes, move keyboard focus to the new heading and ease it toward the viewport center. Respect reduced motion and leave the initial page position undisturbed.
- Transition each new booking stage in from the right with a short horizontal slide; disable the slide for reduced-motion preferences.
- Tables and calendar views support inspection and filtering before detail-page edits. Complex appointment/service/doctor changes belong on dedicated pages, with visible validation, pending status, and success/error feedback.
- Shared form controls live in `src/shared/components/ui/`; the searchable combobox keeps visible labels, keyboard selection, themed option states, and empty-result feedback consistent across the admin dashboard.
- Route entry and card feedback use short restrained motion; disable nonessential motion through `prefers-reduced-motion`. Loading placeholders reserve space; route error states provide retry and recovery navigation.

## Principles translated into behavior
The selected workflow explicitly requires consistency, four operational states, shared ownership, responsive visual review, natural scrolling, 44px targets, and reduced motion. No canonical list of approximately twenty named laws was present in the selected project/OS owners. These named principles express the concrete decisions above; they do not replace repository rules.

| Principle | Application |
| --- | --- |
| Consistency and Standards / Jakob's Law | Persistent familiar navbar, shared buttons, labeled native forms, standard dedicated destinations. |
| Hick's Law / Progressive Disclosure | One logical booking stage at a time; service selection narrows eligible clinicians and times. |
| Fitts's Law / Accessibility | Minimum 44px controls, visible keyboard focus, semantic labels and reduced-motion support. |
| Recognition Rather Than Recall / Miller's Law | Visible booking progress and review summary preserve service, clinician, date, time, and entered details. |
| Gestalt Proximity, Similarity, Common Region | Spaced service cards, bordered top-level panels with borderless internal grouping, consistent admin tables and grouped form fields. |
| Visual Hierarchy / Aesthetic-Usability Effect | Existing photo-led clinic identity, clear heading scale, calm spacing and one main action per stage. |
| Visibility of System Status / Error Prevention | Demo labels, pending/empty/error states, disabled unavailable choices, validated repository mutations and conflict checks. |
| User Control and Freedom | Back navigation, editable selections, recoverable route errors, explicit demo reset. |
| Tesler's Law | Shared data repository owns scheduling complexity rather than asking users to reconcile conflicting choices. |

## Research boundary
W3C [multi-page form guidance](https://www.w3.org/WAI/tutorials/forms/multi-page/) and [animation guidance](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), accessed 2026-10-20, informed staged forms, visible progress, retained inputs, and reduced motion. These are interaction references, not clinic scheduling policy or an accessibility certification. See the implementation ledger for observations and limits.
