# WhisMap V5 — implementation notes

## Implemented in this frontend update

- Three clear primary journeys: protected map, Lost & Found, and private cat care.
- Compact white, accessible orange, and charcoal visual system. The main action orange is `#B84412`, which has a 5.42:1 contrast ratio against white.
- New WhisMap logo used across the app.
- Reduced navigation and responsive footer, with a clearer primary action.
- Homepage rewritten to explain the product and show direct actions instead of broad, competing feature lists.
- Protected map with search, radius and status filters, legend, map/list modes, no-result state, and explicit approximate-location language.
- Lost & Found with search, filters, sorting, mobile-friendly cards, a protected visual map, local persistence, safer report form, and a responsive fit-first image detail modal.
- Lost & Found modals support Escape close, focus management, and keyboard focus trapping.
- Public seed data contains no real contact details. New reports remain local and explicitly await a real moderation workflow.
- Private Cat Care workspace with cat profiles, local persistence, and all requested tools: health log, custom feeding plan, litter log, behaviour journal, sitter handoff, routine, multi-cat household, inventory, lost-cat emergency toolkit, and life timeline.
- Cat-care records are tied to the selected cat where appropriate. Health, nutrition, and litter features use observation-focused language and do not diagnose or prescribe care.
- Sighting and concern-report forms have validation, local draft persistence, image resizing, privacy copy, loading/empty/error states, and clear frontend-only disclosure.
- Cruelty/concern reporting no longer claims that moderators, authorities, or emergency services are contacted. It is explicitly a local preparation tool in this frontend-only build.
- Colony pages now protect sensitive care details instead of displaying specific schedules or access information.
- Falling decorative motifs are quieter on task-heavy pages and fully disabled for reduced-motion preferences.
- Unused backend, database, UI-library, and platform-specific scripts were removed. Package scripts are cross-platform and do not use Unix-only commands such as `tee`.

## Validation completed

The final source passed:

```text
npm run check
npm run lint
npm run build
```

The production build generated all primary routes successfully.

## Still required for a real production service

- Accounts, authentication, and role-based permissions.
- Encryption at rest and in transit for private household and contact data.
- Moderation queues, verification, report expiry, audit logs, user blocking, and abuse handling.
- Secure contact requests that do not expose phone numbers or emails.
- A real map/geocoding provider, server-side privacy radius, and trusted-user access controls.
- Server-side validation, rate limiting, file scanning, malware protection, and secure media storage.
- Notifications, sitter sharing with automatic expiry, calendar sync, and cross-device data sync.
- Consent-driven analytics based on trustworthy, reviewed data.

## Backend foundation added

- Added a separate `backend/` Fastify + PostgreSQL + Prisma foundation without moving or breaking the existing Next.js frontend.
- Added root and backend `.npmrc` files that use the public npm registry.
- Removed the generated `package-lock.json` that referenced an unavailable internal package registry and could cause Bun installs to stall on Windows.
