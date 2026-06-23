# SALONE ONLINE APPLICATION

Next.js App Router application for business listings, verification workflow, review moderation, and AI-powered semantic search on PostgreSQL with pgvector.

## Tech stack (summary)

| Layer | Technology |
| --- | --- |
| Framework | [Next.js](https://nextjs.org) 16 (App Router, React 19) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL with `vector` (pgvector) and `pgcrypto` extensions |
| ORM | Prisma 7 (multi-file schema under `prisma/`) |
| DB driver | `pg` via `@prisma/adapter-pg` (required in Prisma 7) |
| Auth | Auth.js — implemented with `next-auth` v4 + `@next-auth/prisma-adapter` |
| AI search | OpenAI embeddings (`text-embedding-3-small`) + pgvector similarity |
| Validation | Zod 4 |
| Forms (ready) | React Hook Form + `@hookform/resolvers` |
| File storage (ready) | AWS SDK S3 client |

---

## Installed npm packages

All packages below are declared in `package.json` and installed via `npm install`. Versions follow the ranges in `package.json`; run `npm list --depth=0` for exact resolved versions.

### Production dependencies

| Package | Version (range) | Role in this project |
| --- | --- | --- |
| `next` | `16.2.7` | App Router, API routes, SSR, production build |
| `react` | `19.2.4` | UI runtime |
| `react-dom` | `19.2.4` | React DOM renderer |
| `prisma` | `^7.8.0` | Prisma CLI (`migrate`, `generate`, `studio`) — also used in npm scripts |
| `@prisma/client` | `^7.8.0` | Generated type-safe database client |
| `@prisma/adapter-pg` | `^7.8.0` | Prisma 7 driver adapter connecting the client to PostgreSQL |
| `pg` | `^8.21.0` | Node.js PostgreSQL driver (used by the Prisma adapter) |
| `dotenv` | `^17.4.2` | Loads `.env` for Prisma CLI (`prisma.config.ts`) |
| `next-auth` | `^4.24.14` | Auth.js-compatible auth (sessions, credentials, API route) |
| `@next-auth/prisma-adapter` | `^1.0.7` | Persists Auth.js `Account` / `Session` models via Prisma |
| `bcryptjs` | `^3.0.3` | Password hashing for register + credentials login |
| `zod` | `^4.4.3` | Request/query validation (`src/lib/validation/*`) |
| `openai` | `^6.41.0` | Embedding API for semantic search (`src/lib/ai/embeddings.ts`) |
| `react-hook-form` | `^7.77.0` | Form state *(installed; use for future auth/business forms)* |
| `@hookform/resolvers` | `^5.4.0` | Zod resolver for React Hook Form *(installed; not wired yet)* |
| `@aws-sdk/client-s3` | `^3.1058.0` | S3 uploads for business documents *(installed; configure in `.env`)* |
| `clsx` | `^2.1.1` | Conditional class names *(installed; utility for UI)* |
| `tailwind-merge` | `^3.6.0` | Merge Tailwind classes without conflicts *(installed; utility for UI)* |
| `uuid` | `^14.0.0` | UUID generation *(installed; optional — DB uses Prisma/`pgcrypto` IDs)* |
| `jose` | `^6.2.3` | JWT utilities *(installed; useful for custom tokens — Auth.js uses its own session/JWT flow)* |

### Development dependencies

| Package | Version (range) | Role in this project |
| --- | --- | --- |
| `typescript` | `^5` | Type checking |
| `@types/node` | `^20` | Node.js types |
| `@types/react` | `^19` | React types |
| `@types/react-dom` | `^19` | React DOM types |
| `@types/pg` | `^8.20.0` | Types for `pg` |
| `@types/bcryptjs` | `^2.4.6` | Types for `bcryptjs` |
| `eslint` | `^9` | Linting |
| `eslint-config-next` | `16.2.7` | Next.js ESLint rules |
| `tailwindcss` | `^4` | Utility-first CSS |
| `@tailwindcss/postcss` | `^4` | PostCSS integration for Tailwind v4 |
| `prettier` | `^3.8.3` | Code formatting |
| `prettier-plugin-tailwindcss` | `^0.8.0` | Sort Tailwind classes in Prettier |
| `tsx` | `^4.22.4` | Run TypeScript seed script (`npm run db:seed`) |
| `vitest` | `^4` | Unit and API route tests |
| `@vitejs/plugin-react` | `^4` | Vitest React/JSX support |
| `@vitest/coverage-v8` | `^4` | Code coverage (V8) |
| `jsdom` | `^26` | DOM environment for component tests |
| `@testing-library/react` | `^16` | React component testing utilities |
| `@testing-library/jest-dom` | `^6` | DOM matchers for Vitest |

### Packages actively imported in application code

| Package | Used in |
| --- | --- |
| `next` / `react` / `react-dom` | `app/**` |
| `@prisma/client`, `@prisma/adapter-pg` | `src/lib/prisma/prisma.ts`, `prisma/seed.ts` |
| `next-auth`, `@next-auth/prisma-adapter` | `src/lib/auth/*`, `app/api/auth/*`, `middleware.ts`, `app/providers.tsx` |
| `bcryptjs` | `src/lib/auth/auth-options.ts`, `app/api/auth/register/route.ts`, `prisma/seed.ts` |
| `zod` | `src/lib/validation/*`, API route parsing |
| `openai` | `src/lib/ai/embeddings.ts` |

### Installed but not yet imported (reserved)

| Package | Intended use |
| --- | --- |
| `@aws-sdk/client-s3` | Upload/store `BusinessDocument` files |
| `react-hook-form`, `@hookform/resolvers` | Client forms with Zod validation |
| `clsx`, `tailwind-merge` | Shared `cn()` helper for components |
| `uuid` | Client-side or script UUIDs if needed |
| `jose` | Custom JWT signing/verification outside NextAuth |

---

## Database (not npm — required infrastructure)

| Component | Purpose |
| --- | --- |
| **PostgreSQL** | Primary database (`DATABASE_URL`) |
| **`vector` extension** | pgvector — `SearchEmbedding.embedding` column |
| **`pgcrypto` extension** | `gen_random_uuid()` in embedding upserts |

Enable before migrating:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

Prisma schema declares extensions in `prisma/schema.prisma`:

```prisma
extensions = [vector, pgcrypto]
```

---

## Environment variables

Configure the project root `.env` file (not committed to git):

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string (Neon or local) |
| `NEXTAUTH_URL` | Yes | App URL for Auth.js callbacks |
| `NEXTAUTH_SECRET` | Yes | Session/JWT signing secret |
| `OPENAI_API_KEY` | For search | OpenAI embeddings for `/api/search` |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET` | Optional | Future document uploads to S3 |

---

## npm scripts

| Script | Command | Description |
| --- | --- | --- |
| `dev` | `next dev` | Start development server |
| `build` | `prisma generate && next build` | Generate client + production build |
| `start` | `next start` | Run production server |
| `lint` | `eslint` | Lint the codebase |
| `postinstall` | `prisma generate` | Auto-generate Prisma Client after `npm install` |
| `db:generate` | `prisma generate` | Regenerate Prisma Client |
| `db:migrate` | `prisma migrate dev` | Create/apply migrations |
| `db:push` | `prisma db push` | Push schema without migration files |
| `db:studio` | `prisma studio` | Open Prisma Studio GUI |
| `db:seed` | `tsx prisma/seed.ts` | Seed roles + default admin user |
| `test` | `vitest` | Run tests in watch mode |
| `test:run` | `vitest run` | Run tests once (CI) |
| `test:coverage` | `vitest run --coverage` | Run tests with coverage report |

---

## Testing

Tests use [Vitest](https://vitest.dev) with the same `@/` and `@/lib/` path aliases as the app. Environment variables are loaded from your project `.env` via `tests/setup.ts` (no separate test env file).

### Layout

```
tests/
  setup.ts                 # dotenv + Testing Library matchers
  helpers/
    prisma-mock.ts         # Prisma mock factory for workflow tests
  unit/                    # Pure logic (no HTTP)
    auth/
    validation/
    ai/
    api/
    verification/
  api/                     # App Router route handlers (mocked deps)
    search.route.test.ts
vitest.config.ts
```

### What is covered

| Area | Type | Notes |
| --- | --- | --- |
| Zod schemas | Unit | `auth`, `verification` validation |
| Auth roles | Unit | `hasRole`, `isAdmin` |
| AI search text | Unit | `buildBusinessSearchText` (no OpenAI calls) |
| API helpers | Unit | `jsonOk` / `jsonError` |
| Verification workflow | Unit | Prisma mocked — submit/decide rules |
| `GET /api/search` | API | `semanticSearch` mocked — no DB/OpenAI |

### Commands

```bash
npm test              # watch mode
npm run test:run      # single run (use in CI)
npm run test:coverage # HTML + text coverage under coverage/
```

Database and OpenAI are **not** required for the default suite. Add integration tests later with a dedicated test database if needed.

---

## Project structure

```
app/
  api/
    auth/[...nextauth]/          # Auth.js route handlers
    auth/register/               # User registration
    search/                      # Semantic search (GET ?q=)
    verification/                # Submit + list requests
    verification/[id]/decision/  # Admin approve/reject
  admin/                         # Admin dashboard (ADMIN role)
  dashboard/                     # Owner dashboard (authenticated)
  login/
prisma/
  schema.prisma                  # generator + datasource
  enums.prisma
  models/                        # one Prisma model per file
  seed.ts                    # orchestrator
  seed/
    roles.ts
    categories.ts
    locations.ts
    users.ts
    data/                    # U.S. regions, cities, category definitions
src/
  lib/
    auth/                        # Auth options, session helpers, roles
    ai/                          # OpenAI embeddings + pgvector search
    prisma/                      # Prisma Client singleton (PrismaPg adapter)
    validation/                  # Zod schemas
    verification/                # Verification workflow logic
    api/                         # JSON response helpers
  types/
    next-auth.d.ts               # Session/JWT type extensions
prisma.config.ts                 # Prisma 7 CLI config (schema path, DATABASE_URL)
middleware.ts                    # Protects /admin and /dashboard
tests/                           # Vitest unit + API tests
vitest.config.ts
```

---

## Setup

1. Install dependencies:

```bash
npm install
```

2. Ensure `.env` at the project root defines `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, and optionally `OPENAI_API_KEY`.

3. Prepare PostgreSQL (extensions above), then migrate and seed:

```bash
npm run db:migrate
npm run db:seed
```

4. Start development:

```bash
npm run dev
```

**Default seed accounts** (override in `.env`):

| Role | Email | Password |
| --- | --- | --- |
| `SUPER_ADMIN` | `superadmin@example.com` | `SuperAdmin123!@#` |
| `ADMIN` | `admin@example.com` | `Admin123!@#` |
| `BUSINESS_OWNER` | `owner@example.com` | `Owner123!@#` |
| `USER` | `user@example.com` | `User123!@#` |

Optional `.env` keys: `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`, `SUPER_ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_USERNAME`, `OWNER_*`, `USER_*`.

### Seed data included

| Data | Count (approx.) | Source |
| --- | --- | --- |
| Roles | 4 | `SUPER_ADMIN`, `ADMIN`, `BUSINESS_OWNER`, `USER` |
| U.S. locations | ~350+ | All 50 states + D.C. — capitals and major cities per state |
| National categories | 10 | Restaurants, retail, health, etc. |
| Regional category groups | 5 parents + 25 specialties | Northeast, Southeast, Midwest, Southwest, West |

Seed modules live under `prisma/seed/` (`roles`, `categories`, `locations`, `users`) with static data in `prisma/seed/data/`.

---

## API overview

| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `/api/auth/register` | POST | — | Register user |
| `/api/auth/[...nextauth]` | GET, POST | — | Sign in, sign out, session |
| `/api/search?q=` | GET | — | Semantic business search |
| `/api/verification` | GET | ADMIN | List verification queue |
| `/api/verification` | POST | User | Submit verification request |
| `/api/verification/[id]/decision` | POST | ADMIN | Approve or reject |

---

## Prisma schema layout

Multi-file schema (Prisma 6.7+). CLI loads every `.prisma` file under `prisma/` via `schema: "prisma"` in `prisma.config.ts`.

| File | Contents |
| --- | --- |
| `prisma/schema.prisma` | `generator`, `datasource`, PostgreSQL extensions |
| `prisma/enums.prisma` | Domain enums |
| `prisma/models/*.prisma` | One model per file (User, Business, SearchEmbedding, etc.) |

---

## License

See [LICENSE](./LICENSE).
