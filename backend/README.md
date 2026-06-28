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
| `cats` | cat profiles, household membership, cat-facing privacy controls |
| `care` | health observations, feeding, litter, behaviour, routines, sitter access, supplies, timeline |
| `lost-found` | lost/found reports, protected location handling, report lifecycle, contact requests |
| `sightings` | user sightings and possible-report matches |
| `colonies` | protected colony records, trusted caregiver access, care activity |
| `moderation` | verification, review queues, expiry, abuse reports, audit trail |
| `media` | signed uploads, scanning pipeline, visibility rules, deletion lifecycle |
| `notifications` | email/push/in-app notification preferences and delivery jobs |

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

Only health and authentication foundation routes are implemented in this initial backend structure. Feature routes are planned and their database models are present. Do not attach the frontend to care, report, or media write endpoints until authorization, moderation, object storage, and tests for each module are implemented.

## Suggested deployment

- Frontend: Vercel.
- API: a Node container host such as Railway, Render, Fly.io, AWS App Runner, or a Vercel function adaptation.
- Database: managed PostgreSQL.
- Media: private S3-compatible bucket with signed URLs and a scanning worker.
- Jobs: Redis-backed worker for notifications, report expiry, scans, and moderation queues.

Use separate production, staging, and local environments. Do not reuse credentials or encryption keys across them.

## Authentication note

The starter authentication routes return a 15-minute access token so the API boundary can be tested. Before connecting the browser, add refresh-session rotation and secure, HTTP-only, `Secure` cookies on a shared production domain. Do not persist access tokens in local storage.
