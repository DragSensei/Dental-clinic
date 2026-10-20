<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project rules

- `src/app/globals.css` is the central theme source. Rebrand through its four `--brand-*` tokens.
- Keep route composition in `src/app/`, business logic in isolated `src/features/<name>/` slices, and shared primitives in `src/shared/`.
- Public booking collects only patient name and contact details. Staff can manage schedules. Do not add further patient data, payments, or access rules without an explicit product decision.
- Production database, appointment lifecycle, clinic hours, durations, and staff authentication remain undefined. The 2026-10-20 website evolution explicitly authorizes isolated in-memory booking and admin simulations with visible demo status. This does not authorize production writes or real staff operations. Collect only name and contact details; do not persist contacts in browser storage.
