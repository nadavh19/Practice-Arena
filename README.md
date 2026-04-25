# Practice Arena

Practice Arena is a Next.js + Prisma backend for a personalized music practice flow:

1. Signup / login
2. Update profile
3. Generate a practice session
4. Complete the session with feedback


## Tasks

implement phase 3 - check about if i should do cookies or not


## Quick Start

```bash
# Install
npm install

# Run migrations
npx prisma migrate dev

# Seed tasks
npm run prisma:seed

# Start app
npm run dev
```

Required `.env` values:

1. `DATABASE_URL`
2. `JWT_SECRET`

`JWT_SECRET` note:

1. `JWT_SECRET` is one app-level secret string (server-only).
2. A JWT token is created per user auth action (`signup` / `login`) using that secret.
3. If `JWT_SECRET` is missing, auth routes cannot issue valid tokens.

Useful commands:

```bash
npm run lint
npm run build
npx prisma generate
npx prisma studio --port 5555 --browser none
```

## Deployment Environment (Vercel)

Set these in Vercel Project Settings -> Environment Variables:

1. `DATABASE_URL`
2. `JWT_SECRET`

Apply to both `Preview` and `Production` (and `Development` if needed).

## Current API Flow

### 1) Auth

1. `POST /api/auth/signup`
Creates user and returns JWT token.

2. `POST /api/auth/login`
Validates credentials and returns JWT token.

Use returned token in protected routes:

`Authorization: Bearer <token>`

### 2) Profile (Protected)

1. `GET /api/profile`
Returns current user profile.

2. `POST /api/profile`
Updates profile fields (`nickname`, `instrument`, `level`, `goals`).
`instrument` is currently locked to `guitar`.

### 3) Session (Protected)

1. `POST /api/session/generate`
Builds a practice plan from user level + available time and saves it.

2. `POST /api/session/complete`
Marks selected tasks as completed and stores feedback ratings.

### 4) Utility

1. `GET /api/test`
Simple DB connectivity check.

## Project Architecture (Simple)

1. **Routes** (`app/api/.../route.ts`)
Handle HTTP only: parse request, validate, call service, return response.

2. **Services** (`services/*.service.ts`)
Contain business logic and DB orchestration.

3. **Algorithms** (`algorithms/*.ts`)
Pure logic for generating sessions (difficulty, time blocks, task selection).

4. **Lib** (`lib/*.ts`)
Shared helpers: DB client, auth, validators, API response formatting.

5. **Prisma** (`prisma/*`)
Schema, migrations, seed data.

## File Responsibilities

### Prisma Layer

1. `prisma/schema.prisma`
Database structure (User, Session, Task, SessionTask, Feedback).

2. `prisma/migrations/*/migration.sql`
SQL history of DB changes.

3. `prisma/seed.ts`
Seeds `Task` rows for realistic session generation.

4. `prisma.config.ts`
Prisma config (schema path, datasource URL, seed command).

### Shared Lib Layer

1. `lib/prisma.ts`
Creates and exports shared Prisma client.

2. `lib/validators.ts`
Zod schemas for all API payloads.

3. `lib/auth.ts`
JWT helpers:
- `createToken`
- `verifyToken`
- `getUserFromRequest`

4. `lib/api-response.ts`
Unified API response envelope:
- success: `{ success: true, data }`
- error: `{ success: false, error }`

### Services Layer

1. `services/user.service.ts`
User business logic:
- create user (hash password)
- get user by email/id
- update profile
- return safe user shape (no password)

2. `services/session.service.ts`
Session business logic:
- generate + save session/tasks
- complete session
- upsert feedback
- enforce ownership checks

### Algorithm Layer

1. `algorithms/computeDifficulty.ts`
Maps user level to difficulty.

2. `algorithms/splitTimeBlocks.ts`
Splits available time into 5-minute blocks.

3. `algorithms/selectTasks.ts`
Selects tasks by difficulty, tries category variation.

4. `algorithms/generatePracticeSession.ts`
Orchestrates all algorithm steps into a session plan.

### API Route Layer

1. `app/api/auth/signup/route.ts`
Signup endpoint.

2. `app/api/auth/login/route.ts`
Login endpoint.

3. `app/api/profile/route.ts`
Protected profile get/update endpoint.

4. `app/api/session/generate/route.ts`
Protected session generation endpoint.

5. `app/api/session/complete/route.ts`
Protected session completion endpoint.

6. `app/api/test/route.ts`
Simple DB connectivity test endpoint.

## User Model Notes

Current `User` key fields:

1. `email`
2. `password` (hashed)
3. `nickname` (optional, set after signup)
4. `instrument` (currently always `guitar`)
5. `level`
6. `goals`

`nickname` is not unique and can be cleared (`null`) through profile update.

## How Data Moves in a Request

Example: `POST /api/session/generate`

1. Route receives request + bearer token.
2. Route validates body with Zod.
3. Route calls session service.
4. Service loads user/tasks from DB.
5. Service runs algorithm files.
6. Service writes Session + SessionTask to DB.
7. Route returns unified success response.

That same pattern is used across the backend.
