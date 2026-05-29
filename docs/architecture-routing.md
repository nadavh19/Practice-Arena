# Architecture Routing Guide

This guide explains the two concerns that live under `app/` and how to trace UI behavior to backend logic quickly.

## If You Are Debugging UI, Start Here

1. Find the screen file in `app/**/page.tsx` (or segment `layout.tsx`).
2. Find `apiGet` / `apiPost` calls in that page.
3. Open the matching backend route in `app/api/**/route.ts`.
4. Follow the service call into `services/*.service.ts`.

## If You Are Debugging Backend Route Behavior, Start Here

1. Open the route file in `app/api/**/route.ts`.
2. Check transport concerns first: auth, JSON parse, validation, response mapping.
3. Follow service imports from `@/services/*`.
4. Continue into `algorithms/*` (when session generation is involved) and Prisma queries.

## If You Are Debugging Generation Logic, Start Here

1. Begin at `services/session.service.ts` in `generateAndSaveSession`.
2. Follow the call to `algorithms/generatePracticeSession.ts`.
3. Continue into `computeDifficulty.ts`, `splitTimeBlocks.ts`, and `selectTasks.ts`.
4. Return to service-level persistence (`Session`, `SessionTask`, `Feedback` writes/reads).

## App Directory: Two Roots, Two Purposes

1. UI route tree:
- `app/**/page.tsx`
- `app/**/layout.tsx`
- Route groups like `app/(protected)`

2. API route tree:
- `app/api/**/route.ts`
- These are backend HTTP entrypoints (not UI pages).

## Route Ownership Matrix

### UI Page to API Route Mapping

| UI route | UI file | API endpoints used | Backend route files |
| --- | --- | --- | --- |
| `/` | `app/page.tsx` | `GET /api/profile` | `app/api/profile/route.ts` |
| `/auth` | `app/auth/page.tsx` | `POST /api/auth/login`, `POST /api/auth/signup` | `app/api/auth/login/route.ts`, `app/api/auth/signup/route.ts` |
| `/profile` | `app/(protected)/profile/page.tsx` | `GET /api/profile`, `POST /api/profile` | `app/api/profile/route.ts` |
| `/session/new` | `app/(protected)/session/new/page.tsx` | `POST /api/session/generate` | `app/api/session/generate/route.ts` |
| `/session/current` | `app/(protected)/session/current/page.tsx` | `GET /api/session/history`, `POST /api/session/complete` | `app/api/session/history/route.ts`, `app/api/session/complete/route.ts` |
| `/history` | `app/(protected)/history/page.tsx` | `GET /api/session/history`, `GET /api/session/stats` | `app/api/session/history/route.ts`, `app/api/session/stats/route.ts` |
| `/coach` | `app/(protected)/coach/page.tsx` | `POST /api/chat` | `app/api/chat/route.ts` |

### API Route to Service Mapping

| API endpoint | Backend route file | Service delegation | Downstream logic |
| --- | --- | --- | --- |
| `POST /api/auth/signup` | `app/api/auth/signup/route.ts` | `createUser` (`services/user.service.ts`) | Prisma user creation + bcrypt hash |
| `POST /api/auth/login` | `app/api/auth/login/route.ts` | `getUserByEmail`, `getUserById` (`services/user.service.ts`) | Prisma reads + bcrypt compare |
| `GET /api/profile` | `app/api/profile/route.ts` | `getUserById` (`services/user.service.ts`) | Prisma user read |
| `POST /api/profile` | `app/api/profile/route.ts` | `updateUserProfile` (`services/user.service.ts`) | Prisma user update |
| `POST /api/session/generate` | `app/api/session/generate/route.ts` | `generateAndSaveSession` (`services/session.service.ts`) | Calls `algorithms/generatePracticeSession.ts` + Prisma session/task writes |
| `POST /api/session/complete` | `app/api/session/complete/route.ts` | `completeSession` (`services/session.service.ts`) | Prisma ownership checks + completion updates + feedback upsert |
| `GET /api/session/history` | `app/api/session/history/route.ts` | `getSessionHistory` (`services/session.service.ts`) | Prisma session/task/feedback reads |
| `GET /api/session/stats` | `app/api/session/stats/route.ts` | `getSessionStats` (`services/session.service.ts`) | Prisma aggregates + counts |
| `POST /api/chat` | `app/api/chat/route.ts` | `askMusicCoach` (`services/chat.service.ts`) | Prisma profile/session context + Gemini REST call |
| `GET /api/test` | `app/api/test/route.ts` | No service layer (direct Prisma call) | Prisma connectivity data read |

## Conventions (Standardized Ownership)

1. `app/**/page.tsx` and `app/**/layout.tsx`:
- UI only: render, local state, user interaction, route redirects.

2. `app/api/**/route.ts`:
- Transport only: auth, parse body, validate input, call service, return API envelope.

3. `services/*`:
- Business logic and database orchestration.

4. `algorithms/*`:
- Pure session recommendation logic (no HTTP concerns).

5. `lib/client/*`:
- Browser API client and browser storage helpers.

## Documentation QA Checklist

1. Login trace:
- `/auth` -> `POST /api/auth/login` -> `app/api/auth/login/route.ts` -> `getUserByEmail` / `getUserById`.

2. Profile save trace:
- `/profile` -> `POST /api/profile` -> `app/api/profile/route.ts` -> `updateUserProfile`.

3. Session generation trace:
- `/session/new` -> `POST /api/session/generate` -> `app/api/session/generate/route.ts` -> `generateAndSaveSession` -> `generatePracticeSession`.

4. Session completion trace:
- `/session/current` -> `POST /api/session/complete` -> `app/api/session/complete/route.ts` -> `completeSession`.

5. History trace:
- `/history` -> `GET /api/session/history` + `GET /api/session/stats` -> `getSessionHistory` + `getSessionStats`.

6. Coach trace:
- `/coach` -> `POST /api/chat` -> `app/api/chat/route.ts` -> `askMusicCoach` -> Gemini API with server-side context.
