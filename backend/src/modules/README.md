# Module ownership

Each domain gets one module folder. A module owns its route definitions, request schemas, service layer, policies, repository/database queries, DTOs, and tests. Modules must not access another module's tables directly; use a service contract or an explicit shared read model.

## Current state

- `auth` and `health` have starter routes.
- All other folders are implementation boundaries only. Their data models are already prepared in `prisma/schema.prisma`.
- Before exposing a feature module, add server-side validation, authorization, audit logging where required, tests, and public/private DTOs.

## Required future route families

```text
/api/v1/cats
/api/v1/households
/api/v1/care
/api/v1/lost-found
/api/v1/sightings
/api/v1/colonies
/api/v1/contact-requests
/api/v1/moderation
/api/v1/media
/api/v1/notifications
```
