# Architecture decisions

## 2026-10-21 — Arabic localization with a client-side language preference
Chose: a `LocaleProvider` in `src/i18n/` that stores the language in browser storage (like the theme), with English as the default and Arabic (`ar`, right-to-left) selectable from the navbar combobox. Copy lives in typed `en`/`ar` dictionaries (Arabic is checked against the English shape), seeded catalog copy is translated in `src/data/mock/localized-copy.ts`, and repository failures carry stable codes that the UI translates.
Because: the user asked for Arabic across the project. A client-side preference keeps every existing URL, the static prerendering, and the appearance-only browser storage rule intact.
Alternatives considered: `app/[lang]` sub-path routing (the framework's recommended pattern) changes every URL and route file, and cookie-based rendering would make every page dynamic under cache components.
Trade-off: a returning Arabic visitor sees English for a moment until hydration applies the stored preference. Sub-path routing would remove that and add per-language URLs; revisit if SEO or first-paint language matters.
Staff-edited catalog text is shown as entered; only seeded copy is translated. The Arabic clinical terms are drafted from common usage and need review by the clinic's dental team.

## 2026-10-20 — Multi-page simulated clinic experience
Chose: preserve the existing Next.js/feature/shared architecture; dedicated service/provider pages, staged booking, and an admin section using one small typed in-memory repository. Root layout owns shared navigation; admin layout adds section navigation. No dependency or database migration is required.
Because: the user requested a functional simulated journey and spacious dedicated workflows while preserving the current design. Contact data stays in memory and no production booking is claimed.
Alternatives considered: large booking modals, per-page fixture copies, browser persistence, or inventing a production backend. These would undermine the requested information architecture, consistency, or unresolved privacy/access contracts.
Open: real availability/timezone policy, database lifecycle, authenticated staff roles, and production API contracts remain external integration work.

## 2026-10-20 — Reference-led admin navigation and appearance
User supplied a rounded-panel overview reference and a capsule-shaped collapsed rail with circular active selection, requesting matching expanded navigation, animation, and both light/dark modes. Preserve the clinic palette, adapt the reference geometry and hierarchy, and use a persistent shared theme control. Only appearance/navigation preferences may use browser storage; contact/appointment data remains memory-only.

## 2026-10-20 — Session-only demo access gate
Chose: gate every `/admin` route behind an open signup/login flow owned by the admin layout; keep the created demo account and sign-in state in component memory, with a visible sign-out action.
Because: the user requested an access step for the existing simulated dashboard, while the project explicitly leaves production staff authentication undefined and permits only a frontend simulation.
Alternatives considered: browser-persisted credentials or a real auth provider. The first would imply durable access and retain passwords; the second needs an approved staff policy and backend. This demo gate is explicitly not authorization and must not be used for real patient information.
Implementation note: admin page segments opt out of Next.js instant-navigation validation because the client gate intentionally withholds their children until a demo session exists; public routes retain the normal validation.

## 2026-10-18 — Project foundation: Next.js and feature slices
Chose: Next.js App Router, TypeScript, Tailwind CSS 4, shadcn/ui, and isolated feature slices enforced by ESLint boundaries.
Because: The product needs public booking and staff scheduling, while keeping the initial project ready for separated business capabilities.
Alternatives considered: Vite + React; a simpler flat Next.js source tree.

## 2026-10-18 — Theme: central monochrome CSS variables
Chose: Keep the brand palette and semantic shadcn tokens in `src/app/globals.css`, with primary, hover, subtle, and border values as named variables.
Because: The user wants to try different color themes by changing one central file.
Alternatives considered: Per-component colors or separate theme configuration files.
