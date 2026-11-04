# Dental Template Redesign — Feature Inventory

This document establishes the comprehensive feature and behavioral baseline of the landing page for `dental-template-1`.
Per `DESIGN.md` Section 8, the calm luxury redesign transforms structure, composition, rhythm, and visual hierarchy, but **no existing capability, content slot, or user behavior may be lost**.

Every component, user interaction, data binding, accessibility guarantee, RTL rule, and dark mode adaptation must be accounted for across all ten sections.

---

## 1. Global & Architectural Behaviors

### 1.1 Bilingual RTL & LTR Mechanics
- **Locales Supported:** English (`en`, LTR) and Arabic (`ar`, RTL).
- **Direction Handling:** Root `<html dir="ltr" lang="en">` or `<html dir="rtl" lang="ar">` toggled dynamically via `LocaleProvider`.
- **Styling Rules:** Strict logical properties only (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`, `text-end`, `border-s`, `border-e`, `rounded-s`, `rounded-e`). Never use physical `left` or `right` utilities.
- **Directional Icon & Visual Mirroring:**
  - Back/forward directional chevrons and action arrows mirror via `rtl:-scale-x-100`.
  - Hero photography mirrors cleanly in Arabic (`rtl:-scale-x-100`) so negative space consistently remains under the headline on the inline-start side.
- **Typography Switching:**
  - Latin: `Cormorant Garamond` (Display headings), `Manrope` (Body and UI).
  - Arabic: `Amiri` (Display headings, strictly no letter-spacing), `IBM Plex Sans Arabic` (Body and UI).
- **Numerals & Data:** Western digits / localized timestamps and currency keep natural reading direction within Arabic prose.

### 1.2 Theme System (Light & Dark Modes)
- **Token Source of Truth:** `src/app/globals.css` using OKLCH values mapped to project semantic variables (`--background`, `--foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--accent`, `--muted`, `--muted-foreground`, `--border`, `--hero-scrim`).
- **Dark Mode Trigger:** `.dark` class on root HTML element managed via `ThemeProvider`.
- **Contrast Ratios:** Minimum 4.5:1 for body and interactive text; minimum 3:1 for large display headlines across both light and dark themes.
- **Token Purity:** Zero raw hex values, zero off-palette colors, zero arbitrary bracket colors in components.

### 1.3 Motion & Ergonomics (Reduced Motion Guarantee)
- **Entrance Animation:** Single restrained fade-up per section (~500ms ease-out, run once).
- **Interaction Transitions:** 150ms–200ms ease-out on hovers and active states.
- **Reduced Motion Support:** Under `@media (prefers-reduced-motion: reduce)`, all transitions, transforms, parallax, and animations are immediately suppressed (`duration-0`, `animate-none`).
- **Touch Target Floor:** All interactive controls (buttons, links, disclosures, sliders, language/theme toggles) maintain a minimum 44px × 44px tap target.
- **Document Scrolling:** Natural document scrolling preserved; no forced viewport clipping or artificial nested scroll containers.

---

## 2. Section-by-Section Feature Inventory (DESIGN.md Section 8)

### Section 1: Navigation (`SiteNav`, `SiteNavInteractive`)
- **Existing Capabilities:**
  - Clinic Brand Mark: Tooth capsule icon + clinic name (`BlueHaven Dental`), clicking navigates to `/`.
  - Desktop Navigation Links:
    - `Home` (`/`)
    - `Services` (`/services`) with hover mega-dropdown grouped by category (Preventive, Restorative, Cosmetic, Orthodontics, Pediatric, Oral Surgery) with icons, descriptions, and deep-links.
    - `About us` / Doctors (`/doctors`)
    - `Contact us` / Visit (`/visit`)
  - Primary Action Button: "Book an appointment" (`/book`).
  - Session Management: If logged in, surfaces "Open dashboard" button linking to active role dashboard.
  - Locale Switcher: Single-click toggle between English and Arabic.
  - Theme Switcher: Single-click toggle between Light and Dark modes.
  - Mobile Drawer / Dialog: Hamburger button (`min-h-11 min-w-11`), slide-in sheet with navigation links, full category breakdown, language switch, theme switch, and full-width booking CTA.
- **Redesign Composition (DESIGN.md Section 8.1):**
  - Transparent navbar over the hero on initial load; transitions to solid frosted/surface background with subtle border upon scrolling.
  - Brand logo, 4 core links (`Home`, `Services`, `About us`, `Contact us`), Language switch, Theme switch, and primary "Book" button (`rounded-full`).
  - Mobile view: streamlined drawer keeping 44px touch targets and full bilingual RTL support.

---

### Section 2: Hero & Immediate Booking (`LandingHero`, `BookingPreview`)
- **Existing Capabilities:**
  - Eyebrow badge: `t.landing.hero.eyebrow` ("A welcoming place to begin").
  - Hero headline: `t.landing.hero.title` ("Comprehensive dental care.").
  - Support lead: `t.landing.hero.lead`.
  - Dual CTAs: Primary "Book an appointment" (`/book`) with arrow icon; Secondary "First visit guide" (`/visit`) with message icon.
  - Hero Media: Aspect ratio container with clinic photography and reassurance card overlay (`t.landing.hero.overlayTitle`, `t.landing.hero.overlayText`).
  - Care Topics Pill Bar: `t.landing.hero.topicsLabel` with topic pills ("General check-ups", "Dental questions", "Smile goals", "First visits").
- **Redesign Composition (DESIGN.md Section 8.2 & Step 1 Scope):**
  - **Full-bleed Stage:** Full-viewport photography sourced from `public/images/demo/` (`hero-desktop.jpg` for desktop; `hero-mobile.jpg` below `md`). If missing, clearly labeled placeholder block (never generic stock).
  - **Start-side Scrim:** Gradient overlay using `--hero-scrim` (`oklch(0.985 0.008 230 / 0.85)` in light, `oklch(0.18 0.03 250 / 0.85)` in dark) ensuring WCAG AA text contrast over photography.
  - **Start-side Content:** Display headline in Cormorant Garamond / Amiri (`text-5xl` mobile, `text-7xl` desktop), single support line in Manrope / IBM Plex Sans Arabic, Primary CTA "Book a consultation" (`rounded-full`), Secondary CTA "View treatments" (`rounded-full`).
  - **End-side Interactive Card (Desktop):** Floating "Next available" appointment card:
    - Real booking preview slots wired directly to repository/mock data (`useClinic` / available slots).
    - One tap to initiate booking for that slot.
    - Frosted glass effect (`bg-background/80` with backdrop-blur) permitted **only** here over photography, strictly verified for WCAG AA contrast.
  - **Above-the-Fold Mobile Guarantee:** On mobile viewports (< 768px), the "Next available" booking card stacks directly under the headline, completely visible in the initial viewport without requiring vertical scrolling.
  - **Bottom-edge Trust Strip:** Integrated trust bar containing:
    - Overall clinic rating (e.g., 4.9★) and review count.
    - Insurance networks & flexible payment plans accepted.
    - Same-week appointment availability indicator.
    - Direct emergency telephone line.
    - All slots marked with clear clinic placeholder badges.
  - **RTL Behavior:** Scrim, text hierarchy, button order, and floating card start/end positions mirror completely; hero photo flips with `rtl:-scale-x-100`.

---

### Section 3: Signature Treatments (`CareGuide`)
- **Existing Capabilities:**
  - Section eyebrow: `t.landing.careGuide.eyebrow` ("Our services").
  - Section title: `t.landing.careGuide.title` ("Explore dental care topics.").
  - Section description: `t.landing.careGuide.body`.
  - Service Cards Grid: Dynamic listings from `useClinic().services` showing category badges, service name, description, baseline pricing ("from $X"), and direct booking links.
  - External NHS Guide link (`t.landing.careGuide.nhsLink`).
  - "View all services" CTA linking to `/services`.
- **Redesign Composition (DESIGN.md Section 8.3):**
  - Asymmetric composition: One large featured signature treatment with full photography and "from" price anchor, paired with an elegant, refined list of supporting treatments (name, single-line description, starting price, expand interaction).
  - Replaces uniform repetitive card rows with deliberate hierarchy.

---

### Section 4: Smile Showcase (`BeforeAfterComparison`)
- **Existing Capabilities:**
  - Section eyebrow: `t.landing.smiles.eyebrow` ("Illustrative comparisons").
  - Section title: `t.landing.smiles.title` ("Two smiles, two views.").
  - Interactive split slider: Drag handle with touch event listeners and keyboard arrow key increment/decrement controls.
  - Percentage reveal indicator: `t.landing.smiles.valueText`.
  - Dual Illustration tabs: Toggle between Illustration 1 and Illustration 2.
  - Transparent AI illustration disclaimer: `t.landing.smiles.disclaimer`.
- **Redesign Composition (DESIGN.md Section 8.4):**
  - Dark navy high-contrast atmospheric band (`bg-foreground` or deep dark tone).
  - Single dominant anchor: The comparison slider framed in an architectural arch frame (`rounded-t-full`), echoing a smile's natural curvature.
  - Concise caption and clear illustrative demo disclaimer.

---

### Section 5: Your First Visit (`VisitGuide`)
- **Existing Capabilities:**
  - Eyebrow: `t.landing.visitGuide.eyebrow` ("Online consultation").
  - Title: `t.landing.visitGuide.title` ("A conversation is a good place to start.").
  - Lead description and preparation steps:
    1. "Bring your questions"
    2. "Share what helps you feel comfortable"
    3. "Know what you are agreeing to"
  - Rounded consultation panel with "Read the NHS guide to dental check-ups" external link and first-visit guide link.
- **Redesign Composition (DESIGN.md Section 8.5):**
  - Four sequential visit steps in a horizontal cadence on desktop (receptive, consultation, treatment chair, aftercare), stacked cleanly on mobile.
  - Square 1:1 photography for each step paired with a calm single sentence designed to dismantle patient anxiety.

---

### Section 6: The Clinic & Doctor (`ClinicStory`, `AdvancedCareBanner`)
- **Existing Capabilities:**
  - `ClinicStory`: Eyebrow ("Who we are"), headline ("A dental visit should leave room for your questions"), body prose, 3 clinic pillars ("Time for questions", "Clear information", "Care at your pace"), and link to first-visit guide.
  - `AdvancedCareBanner`: Dedicated full-width callout ("Experience advanced dental care") with bulleted care promises and explore link.
- **Redesign Composition (DESIGN.md Section 8.6):**
  - Consolidates `ClinicStory` and `AdvancedCareBanner` into a unified editorial spread.
  - Anchor: Large portrait of the lead doctor in an architectural arch frame (`rounded-t-full`) physically overlapping into the adjacent section boundary.
  - Narrative: Warm studio introduction, clinician credentials, and philosophy.
  - The previous redundant `AdvancedCareBanner` is distilled into a restrained, elegant single-line commitment within this section.

---

### Section 7: Patient Voices & Clinic Metrics (`PatientSatisfaction`, `PatientMetrics`)
- **Existing Capabilities:**
  - `PatientSatisfaction`: Eyebrow ("Patient satisfaction"), headline ("Care begins with listening"), lead text, and fictional testimonial cards with star ratings, patient visit descriptions, quotes, and author metadata.
  - `PatientMetrics`: High-density statistics strip displaying clinic rating (4.9/5), active patient count, years in service, on-time rate, and demo data labels.
- **Redesign Composition (DESIGN.md Section 8.7):**
  - Unifies metrics and testimonials into a single compact, high-density proof band.
  - Three primary anchor metrics (aggregate rating, patient count, years in practice) displayed with tabular numerals.
  - Two to three authentic patient testimonials (CLINIC SLOTS with clearly marked demo/fictional badges).

---

### Section 8: Questions & Visit Details (`BookingFaq`, `ClinicInformation`)
- **Existing Capabilities:**
  - `BookingFaq`: Accordion with 6 essential patient questions (booking online, unknown treatments, routine check-up process, choosing doctors, pricing/costs, urgent dental care). Fully keyboard navigable with base-ui / Radix disclosure primitives.
  - `ClinicInformation`: Practice address, neighborhood directions, interactive/static map preview, operating hours by day, clinic team introduction, and demo data notice.
- **Redesign Composition (DESIGN.md Section 8.8):**
  - Side-by-side asymmetric desktop grid: FAQ accordion on the start side; clinic hours, physical address, map preview, and contact logistics on the end side.
  - On mobile, cleanly stacks logistics followed by FAQs.

---

### Section 9: Final Booking Dock (`AppointmentCta`, `BookingSearchPreview`)
- **Existing Capabilities:**
  - `AppointmentCta`: Closing call-to-action banner with eyebrow, dual-line title ("A little clarity. A confident next step."), lead copy, and direct booking trigger.
  - `BookingSearchPreview`: Interactive quick-search form allowing users to select clinic location ("Where"), visit type ("Visit type"), date ("When"), and proceed to `/book`.
- **Redesign Composition (DESIGN.md Section 8.9):**
  - Pale sky-blue grounding band (`bg-secondary` or subtle tinted panel) that physically overlaps the top edge of the site footer.
  - Houses the interactive quick-booking search dock paired with a single reassuring commitment line.

---

### Section 10: Site Footer (`SiteFooter`, `SiteFooterClient`)
- **Existing Capabilities:**
  - Clinic branding: Logo, studio name, and philosophy summary.
  - Comprehensive site map links:
    - Appointments (`/book`)
    - Services (`/services`)
    - Doctors (`/doctors`)
    - First visit (`/visit`)
    - Clinic story (`/#story`)
    - FAQs (`/#faq`)
    - Contact (`/contact`)
    - Admin demo login (`/login`)
  - Mandatory fictional demo clinic disclaimers and preview environment notices in both English and Arabic.
- **Redesign Composition (DESIGN.md Section 8.10):**
  - Preserves all legal disclaimers, demo indicators, and navigation links with refined typographic scale and calm luxury aesthetic.

---

## 3. Preservation Guarantee

| Feature / Behavior | Current Source File | Preservation Strategy in Redesign |
|---|---|---|
| **RTL Layout & Logical Props** | `src/i18n/locale-provider.tsx` | All redesign markup strictly uses `ps-`, `pe-`, `start-`, `end-`, `rtl:-scale-x-100`. |
| **Bilingual Dictionaries** | `src/i18n/dictionaries/{en,ar}.ts` | All copy binds to existing i18n keys; new keys added symmetrically to both `en.ts` and `ar.ts`. |
| **Dark Mode Semantic Tokens** | `src/app/globals.css` | Mapped via OKLCH tokens in `globals.css` under `:root` and `.dark`. |
| **Real Booking Slots Data** | `src/data/use-clinic.ts`, `src/data/mock/` | Hero "Next available" card directly binds to live clinic catalog slots. |
| **Interactive Before/After** | `src/features/booking/before-after-comparison.tsx` | Slider logic, touch/keyboard events, and dual comparison preserved in arch frame. |
| **Interactive FAQ Accordion** | `src/features/booking/booking-faq.tsx` | Radix / Base-UI disclosure states and accessibility preserved. |
| **Interactive Booking Search** | `src/features/booking/booking-search-preview.tsx` | Filter selectors and simulated navigation preserved in final booking dock. |
| **Mobile Above-the-Fold Booking**| `DESIGN.md` Section 8.2 | Mobile hero ensures headline + "Next available" card fit viewport without scrolling. |
| **Accessibility Targets (44px)** | All UI components | All interactive elements maintain `>= 44px` height/width touch targets. |
| **Reduced Motion Standard** | `DESIGN.md` Section 6 | All transitions and animations deactivated under `prefers-reduced-motion`. |
