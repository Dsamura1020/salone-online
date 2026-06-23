# Architecture

Modular monolith aligned with the recommended project layout.

## App routes

| Area | Path | Role |
|------|------|------|
| Public | `app/(public)/` | `/`, `/search`, `/about`, `/businesses/[slug]` |
| Auth | `app/(auth)/` | `/login`, `/register`, `/forgot-password`, `/verify-email` |
| Dashboard | `app/dashboard/` | `/dashboard` → role redirect |
| Owner | `app/dashboard/owner/` | Business owner UI |
| User | `app/dashboard/user/` | Member UI |
| Admin | `app/dashboard/admin/` | Admin stats, verification, reviews |
| Verifier | `app/dashboard/verifier/` | Redirects to admin verification |
| API | `app/api/` | Route handlers only |

Legacy `/admin/*` URLs redirect to `/dashboard/admin/*` via middleware.

## Source layout

- `src/components/` — shared UI (`ui/`, `forms/`, `tables/`, `charts/`, `layouts/`, `landing/`)
- `src/features/` — feature modules with `actions/`, `components/`, `services/`, `repositories/`, `schemas/`, `types/`
- `src/repositories/` — Prisma data access (`*.repository.ts`)
- `src/services/` — domain services (`*.service.ts`)
- `src/lib/` — infrastructure (prisma, auth, validation, storage, ai, security)
- `src/tests/` — Vitest unit, integration, and API tests

## Import aliases

`@/components/*`, `@/features/*`, `@/services/*`, `@/repositories/*`, `@/lib/*`, `@/utils/*`, `@/hooks/*`

Legacy shims remain under old paths (e.g. `@/lib/auth/session`, `@/lib/auth/roles`, `@/lib/ai/search`) so existing imports keep working.
