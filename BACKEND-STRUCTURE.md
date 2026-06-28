# WhisMap V5 backend structure

A backend foundation is now included in `backend/`. It leaves the current frontend intact and creates a safe path from browser-only demo data to a multi-user production application.

## Product boundary

| Public/community data | Private household data |
|---|---|
| approximate lost/found locations, verified report status, public map markers | exact locations, contact details, cat health, feeding, sitter, inventory, private media |

The backend must enforce this split. It cannot be left to frontend filtering.

## Build order

1. Run PostgreSQL and migrate the schema.
2. Complete account verification, refresh sessions, password reset, and frontend auth connection.
3. Build private Cat Profile + Care CRUD with household-role authorization.
4. Build lost/found reports with protected locations, moderation, secure contact requests, and report expiry.
5. Add signed media uploads, scan jobs, deletion lifecycle, and image metadata stripping.
6. Add map/geocoding provider, server-side privacy radius, and trusted caregiver permissions.
7. Add notifications, sitter access expiry, analytics consent, monitoring, backups, and incident response.

## Do not deploy as production yet

The new API is a structured foundation, not a completed production service. It needs migrations, tests, media scanning, moderation workflows, deployment secrets, monitoring, and operational review before it stores real user data.
