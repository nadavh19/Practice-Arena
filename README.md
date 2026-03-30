# Practice Arena

A simple Next.js + Prisma backend project for generating music practice sessions.

## What We Have So Far

The project currently has:

1. A working Prisma schema and migrations
2. Seeded `Task` data
3. Validation schemas for API input
4. One basic test API route (`/api/test`)

This is the current foundation before full auth/session MVP routes are added.

## Project Commands

```bash
# Run app
npm run dev

# Lint
npm run lint

# Generate Prisma client
npx prisma generate

# Apply migrations in development
npx prisma migrate dev

# Seed tasks
npm run prisma:seed

# Open Prisma Studio
npx prisma studio --port 5555 --browser none
```

Then open:

`http://localhost:3000` for the app  
`http://localhost:5555` for Prisma Studio

## File-By-File Explanation

### `prisma/schema.prisma`

This is the **database blueprint**.

It defines:

1. Tables (models): `User`, `Session`, `Task`, `SessionTask`, `Feedback`
2. Fields in each table
3. Relations between tables

Simple relation view:

1. `User` has many `Session`s
2. `Session` belongs to one `User`
3. `Session` has many tasks through `SessionTask`
4. `Feedback` belongs to one `Session`

Prisma reads this file to know what DB structure should exist and what types/client to generate.

### `prisma/migrations/.../migration.sql`

These are the **actual SQL changes** applied to your database over time.

1. `20260321185438_init/migration.sql`
Initial schema creation.

2. `20260330145127_add_session_goal/migration.sql`
Adds:
- `Session.goal`
- `Task.createdAt`

Think of migrations as the history of DB changes.

### `prisma/migrations/migration_lock.toml`

Internal Prisma metadata file for migration consistency.

You normally do not edit this manually.

### `prisma.config.ts`

This tells Prisma:

1. Where your schema file is (`prisma/schema.prisma`)
2. How to read DB URL (`DATABASE_URL`)
3. Which seed command to run (`npm run prisma:seed`)

### `lib/prisma.ts`

This is your **database connection helper**.

It:

1. Reads `DATABASE_URL`
2. Creates Prisma client with Postgres adapter
3. Exports one shared `prisma` instance
4. Reuses the instance in development to avoid creating too many connections during hot reload

All services/routes should import this `prisma` object for DB queries.

### `prisma/seed.ts`

This file fills the DB with starter tasks.

It:

1. Loads env variables
2. Connects through `prisma`
3. Clears existing tasks (`deleteMany`)
4. Inserts a fixed task list (`createMany`)
5. Disconnects cleanly

Use this whenever you want a clean task dataset for testing.

### `lib/validators.ts`

This is the **input safety layer** using Zod.

It validates request bodies before business logic runs.

Schemas currently included:

1. `signupSchema`
2. `loginSchema`
3. `profileUpdateSchema`
4. `generateSessionSchema`
5. `completeSessionSchema`

Why it matters:

1. Prevents bad input from reaching the DB
2. Makes route handlers cleaner
3. Gives typed inputs via exported TypeScript types

## Mental Model

Use this quick map:

1. `schema.prisma` = what the DB should look like
2. `migration.sql` files = how DB changed over time
3. `lib/prisma.ts` = how code connects to DB
4. `prisma/seed.ts` = sample data loader
5. `lib/validators.ts` = request data checker

## Current MVP Status

Working now:

1. Prisma schema + migrations
2. Prisma generate/build/lint flow
3. Task seeding
4. Input validators

Not built yet:

1. Auth helper + auth routes
2. User service
3. Profile route (protected)
4. Session algorithms/service/routes

## Next Recommended Build Order

1. `lib/auth.ts`
2. `services/user.service.ts`
3. `app/api/auth/signup/route.ts`
4. `app/api/auth/login/route.ts`
5. `app/api/profile/route.ts`
6. `algorithms/*`
7. `services/session.service.ts`
8. `app/api/session/generate/route.ts`
9. `app/api/session/complete/route.ts`
