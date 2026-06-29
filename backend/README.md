# WhisMap API foundation

This folder is a separate TypeScript backend for WhisMap V5. The existing Next.js frontend stays at the repository root and can continue to deploy to Vercel. The API is designed to deploy separately as a container-based service with PostgreSQL.

## What this foundation includes

- Fastify 5 REST API with `/health`, versioned `/api/v1`, OpenAPI documentation, CORS, security headers, request rate limiting, structured error responses, and request IDs.
- PostgreSQL data model with Prisma for accounts, households, cat profiles, care records, reports, sightings, protected contact requests, colonies, moderation, media metadata, notifications, and audit logs.
- Authentication foundation with email/password registration, Argon2id password hashes, short-lived JWT access tokens, and role boundaries.
- Privacy-by-design data model: public areas and approximate coordinates are separated from encrypted exact locations; contact details and private media are never exposed through public endpoints.
- Docker development services for PostgreSQL, Redis, and MinIO-compatible object storage.
- Module boundaries for the product areas that exist in the V5 frontend.

## Architecture

```text
WhisMap V5 root
├── src/                         # existing Next.js frontend
└── backend/
    ├── src/
    │   ├── config/              # environment validation
    │   ├── common/              # errors, auth guards, pagination, encryption helpers
    │   ├── plugins/             # Fastify plugins: DB, auth, security, OpenAPI
    │   ├── modules/             # feature modules, one folder per domain
    │   ├── routes/              # API version routing
    │   └── server.ts            # process entry point
    ├── prisma/schema.prisma     # PostgreSQL schema and migrations source
    ├── tests/                   # API and module tests
    └── docker-compose.yml       # local PostgreSQL, Redis, MinIO
```

## Run locally on Windows

Open a second PowerShell window while the frontend remains in its own terminal.

```powershell
cd "C:\Users\John Andrei\OneDrive\Desktop\WhisMap_V5_Backend_Foundation\backend"
Copy-Item .env.example .env

# Replace the placeholder encryption key before starting the API.
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$key = [Convert]::ToBase64String($bytes)
(Get-Content .env) -replace '^DATA_ENCRYPTION_KEY_BASE64=.*$', "DATA_ENCRYPTION_KEY_BASE64=$key" | Set-Content .env

bun install --registry https://registry.npmjs.org
bunx prisma generate
bunx prisma migrate dev --name init
bun run dev
```

For local PostgreSQL, Redis, and MinIO through Docker Desktop:

```powershell
docker compose up -d
```

The API health endpoint runs at `http://localhost:4000/health`. OpenAPI UI runs at `http://localhost:4000/docs` in development.

## API modules

| Module | Owns |
|---|---|
| `auth` | account registration, login, access control, session lifecycle |
| `database` | PostgreSQL connectivity checks for admins |
| `map` | public approximate map markers for reports, sightings, and colonies |
| `geocoding` | privacy-preserving local geocode and reverse-geocode helpers |
| `media` | authenticated image upload, local development storage, metadata, visibility rules |
| `email` | admin-only outbound email queueing through notification records |
| `anti-spam` | rate-limited server-side content scoring |
| `notifications` | in-app/email/push notification creation, listing, and read state |
| `cats` | cat profiles, household membership, cat-facing privacy controls |
| `care` | health observations, feeding, litter, behaviour, routines, sitter access, supplies, timeline |
| `lost-found` | lost/found reports, protected location handling, report lifecycle, contact requests |
| `sightings` | user sightings and possible-report matches |
| `colonies` | protected colony records, trusted caregiver access, care activity |
| `moderation` | verification, review queues, expiry, abuse reports, audit trail |

## Implemented v1 endpoints

| Endpoint | Access | Purpose |
|---|---|---|
| `POST /api/v1/auth/register` | public, rate-limited | create an account |
| `POST /api/v1/auth/login` | public, rate-limited | issue a JWT access token |
| `GET /api/v1/auth/me` | authenticated | return the current account |
| `GET /api/v1/database/status` | admin | check PostgreSQL connectivity |
| `GET /api/v1/map/markers` | public | return public approximate map markers |
| `POST /api/v1/geocoding/forward` | public, rate-limited | normalize an area or coordinate query |
| `POST /api/v1/geocoding/reverse` | public, rate-limited | return an approximate area label for coordinates |
| `POST /api/v1/media/images` | authenticated, rate-limited | upload a validated image to local development storage and register metadata |
| `POST /api/v1/email/send` | admin, rate-limited | queue an outbound email notification |
| `POST /api/v1/anti-spam/check` | public, rate-limited | score submitted content for spam signals |
| `GET /api/v1/notifications` | authenticated | list the current user's notifications |
| `POST /api/v1/notifications` | admin | create a notification for a user |
| `PATCH /api/v1/notifications/:id/read` | authenticated | mark a notification as read |

## Security rules that must remain server-side

1. Never return an exact colony or lost-cat location from public endpoints.
2. Never expose reporter, owner, sitter, or contact email/phone fields in public JSON.
3. Validate all write requests on the server, then authorize based on user and household role.
4. Use a signed upload flow and malware scanning before serving user media.
5. Rate-limit authentication, reporting, contact, and upload endpoints.
6. Store passwords with Argon2id; do not use reversible encryption for passwords.
7. Encrypt sensitive location/contact payloads before persistence. Keep keys in a managed secrets service in production.
8. Record moderation actions and privileged reads in append-only audit logs.

## What is intentionally not live yet

Care, cat profile, lost-found report, sighting, colony, and moderation write routes are still planned. The media route uses local development storage and records assets with `PENDING` scan status; production should replace this with private object storage, signed upload URLs, and a scanning worker before serving user media.

## Suggested deployment

- Frontend: Vercel.
- API: a Node container host such as Railway, Render, Fly.io, AWS App Runner, or a Vercel function adaptation.
- Database: managed PostgreSQL.
- Media: private S3-compatible bucket with signed URLs and a scanning worker.
- Jobs: Redis-backed worker for notifications, report expiry, scans, and moderation queues.

Use separate production, staging, and local environments. Do not reuse credentials or encryption keys across them.

## Authentication note

The starter authentication routes return a 15-minute access token so the API boundary can be tested. Before connecting the browser, add refresh-session rotation and secure, HTTP-only, `Secure` cookies on a shared production domain. Do not persist access tokens in local storage.
