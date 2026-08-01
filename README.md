# Caflow — CaterFlow code showcase

Public sample of **[CaterFlow](https://github.com/MadinaBonuAlisherova/caterflow)** — a catering marketplace for Uzbekistan (restaurants, caterers, private chefs).

This repo contains **selected source files only** (not a runnable full app). It is meant for reviewers, collaborators, and portfolio visibility.

## What’s included

| Area | Path | Highlights |
|------|------|------------|
| **Homepage & CaterAi** | `frontend/src/components/landing/` | Hero, AI intake hub, ZeroCater-inspired sections, trust stats |
| **Browse / search UI** | `frontend/src/components/search/` | Filters, vendor cards, paginated results |
| **Customer account UI** | `frontend/src/components/account/` | Warm gold/cream account shell |
| **Catering content** | `frontend/src/components/catering/` | Menu-style education sections |
| **AI + search client** | `frontend/src/lib/` | CaterAi parser, catering search helpers |
| **Media uploads** | `backend/.../media/` | Server-side R2 upload (no browser CORS to storage) |
| **AI parsing API** | `backend/.../ai/` | Catering request interpretation |
| **Vendor discovery** | `backend/.../search/`, `vendor/` | Paginated public vendor search |

## Tech stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind, TanStack Query, React Hook Form + Zod
- **Backend:** Java 21, Spring Boot, PostgreSQL, Flyway, JWT auth, Cloudflare R2 (S3-compatible)

## Full repository

The complete monorepo (frontend + backend + migrations + deploy docs) lives in the private/main **caterflow** project. This showcase omits secrets, admin tooling, payments, and deployment config.

## Security note

No `.env` files, API keys, or production credentials are included. Use `.env.example` patterns from the main repo when running locally.
