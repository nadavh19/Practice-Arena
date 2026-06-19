# Practice Arena

Practice Arena is a Next.js 16 application for planning guitar practice, completing and reviewing saved sessions, asking an AI music coach for help, finding song-learning resources, and training interval recognition with a sampled-piano ear-training game.

The application currently supports:

- User signup, login, profile editing, and JWT-protected pages.
- Rule-based guitar practice-session generation using level, mood, available time, goals, and recent feedback.
- Current-session task completion with difficulty and focus ratings.
- Session history, aggregate statistics, and completion tracking.
- A Gemini-powered music-practice coach.
- Song-resource lookup through SerpApi.
- A five-level music-theory interval game with persistent high scores.
- Separate admin authentication, user inspection, and reusable-task management.

## Onboarding

Read these files before making architectural changes:

1. `README.md` — current features, setup, APIs, algorithms, and limitations.
2. `docs/architecture-routing.md` — UI/API boundaries and route ownership.
3. `docs/schema.md` — additional data-model background; confirm details against `prisma/schema.prisma`, which is the source of truth.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The root route checks the JWT stored in the browser, loads the profile, and redirects to `/auth`, `/profile`, or `/session/new` as appropriate.

## Environment Variables

### Core runtime

The application needs:

- `DATABASE_URL` — pooled PostgreSQL connection used by the running application. The runtime also accepts `SUPABASE_POSTGRES_PRISMA_URL` or `SUPABASE_POSTGRES_URL` as fallbacks.
- `JWT_SECRET` — server-only secret used to sign and verify seven-day user and admin JWTs.

### Optional features

- `GEMINI_API_KEY` — enables the AI Coach.
- `GEMINI_MODEL` — defaults to `gemini-2.5-flash`.
- `GEMINI_FALLBACK_MODELS` — comma-separated fallback models; defaults to `gemini-2.5-flash-lite,gemini-2.0-flash-lite`.
- `GEMINI_MAX_OUTPUT_TOKENS` — defaults to `2048` and is clamped between `512` and `8192`.
- `SERPAPI_API_KEY` — enables Song Learner searches for Ultimate Guitar and YouTube results.
- `ADMIN_EMAIL` — admin account used by the seed script; defaults to `admin@local`.
- `ADMIN_PASSWORD` — admin password used by the seed script; defaults to `admin`.
- `RESEND_API_KEY` — required when reminder settings leave dry-run mode and emails should be sent.
- `EMAIL_FROM` — sender identity; defaults to `Practice Arena <onboarding@resend.dev>`.
- `APP_BASE_URL` — public application origin used for unsubscribe links; defaults to `http://localhost:3000`.
- `CRON_SECRET` — bearer secret required by `/api/cron/daily-reminders`.
- `NEXT_PUBLIC_THEORY_GAME_LOCAL_PROGRESS=true` — runs Theory Game progress from browser localStorage instead of the database. This also allows only `/theory-game` through the protected shell without a JWT for isolated local testing.

### Prisma maintenance

- `SUPABASE_POSTGRES_URL_NON_POOLING` — preferred direct connection for Prisma CLI migrations.
- `DIRECT_DATABASE_URL` — optional direct-connection fallback.

Do not commit `.env` values or expose database, JWT, Gemini, SerpApi, or admin secrets to client code.

## Useful Commands

```bash
npm install                 # install dependencies
npm run dev                 # start the Next.js development server
npm run lint                # run ESLint
npm run test:algorithms     # run practice and theory algorithm tests
npm run test:notifications  # run reminder-rule tests
npm run build               # generate Prisma Client and create a production build
npm run prisma:seed         # create or update the configured admin account
```

Use these only for their specific maintenance cases:

```bash
npx prisma generate         # after changing prisma/schema.prisma
npx prisma migrate deploy   # deploy an already-reviewed, committed migration
```

`prisma migrate deploy` uses the non-pooled URL when `SUPABASE_POSTGRES_URL_NON_POOLING` is configured. Do not use destructive reset or schema-push commands against the shared database.

## User-Facing Routes

Public routes:

- `/` — client-side profile-aware redirect.
- `/auth` — user login and signup.
- `/admin/login` — separate admin login.
- `/admin` — admin dashboard; protected by the admin token.

Regular-user protected navigation:

- `/profile` — view or edit nickname, level, and goals; also shows practice statistics.
- `/session/new` — choose mood, available time, and an optional session goal.
- `/session/current` — complete tasks from the session ID stored in localStorage and submit feedback.
- `/history` — session history and aggregate statistics.
- `/coach` — AI music-practice assistant.
- `/song-learner` — tab/listening search and learning guide.
- `/theory-game` — interval ear-training levels, phases, rounds, and high scores.

The protected shell is client-side. It reads `practiceArenaToken` from localStorage and redirects missing or invalid sessions to `/auth`. The current generated session ID is stored separately as `practiceArenaCurrentSessionId`.

## Main Practice Flow

1. A user signs up or logs in and receives a JWT.
2. The client stores the token in localStorage and sends it as `Authorization: Bearer <token>`.
3. The user completes or edits a guitar profile with a level and goals.
4. The user chooses a mood, available time from 5 to 240 minutes, and an optional session goal.
5. The server loads the profile, reusable tasks, and up to five recent feedback records.
6. Pure algorithms calculate the target difficulty, split the available time, score candidate tasks, and produce a deterministic plan.
7. The server saves the `Session` and its `SessionTask` rows. The client stores the returned session ID.
8. The current-session page loads history, locates that session ID, and displays its assigned tasks.
9. The user selects completed tasks and submits difficulty/focus ratings from 1 to 5.
10. The server marks valid assigned tasks complete, upserts feedback, and the client clears the current-session ID.

### Practice-session algorithm

- `computeDifficulty.ts` maps beginner, intermediate, and advanced profiles to a target task difficulty.
- `splitTimeBlocks.ts` splits the requested duration into practice-sized blocks.
- `selectTasks.ts` scores tasks using difficulty, mood, session/profile goals, recent feedback, and category variation.
- `generatePracticeSession.ts` orchestrates the calculation and returns the selected tasks and planning metadata.

Recent feedback can nudge later sessions easier or harder. Low focus can favor simpler categories, while an explicit session goal receives stronger priority than the saved profile goals.

## Admin Dashboard

The admin interface uses the same `User` table as the regular application, but only records with `role = admin` can authenticate through `/admin/login` or call the admin APIs. Run `npm run prisma:seed` to create or update the configured admin account using `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

Admin authentication is separate from regular-user authentication:

- A successful admin login returns the same seven-day JWT format used elsewhere, signed with `JWT_SECRET`.
- The browser stores it under `practiceArenaAdminToken`, separately from the regular-user token.
- `/admin` checks for that token client-side and redirects to `/admin/login` when it is missing.
- Every protected admin API independently verifies the bearer token against the database and checks that the authenticated user still has the `admin` role. A token in localStorage alone does not grant API access.
- A `401` response clears the stored admin token and redirects the browser to `/admin/login`.

The dashboard has four areas:

1. **Users** loads regular users and reusable tasks in parallel, then selects the newest user by default. Each user summary derives session, assigned-task, completed-task, and feedback counts from saved sessions. Selecting a user loads their profile, goals, sessions newest first, assigned tasks, completion state, and difficulty/focus feedback.
2. **Task inventory** lists reusable tasks newest first. These tasks form the pool used by practice-session generation.
3. **Add task** creates a validated reusable task. Name, difficulty, category, duration, and instrument are stored alongside optional description, key, BPM, tablature, chords, scale, song name, and artist name. Duration must be 1–240 minutes and an optional BPM must be 1–300.
4. **Email reminders** reads and updates global reminder settings and can generate or send a test reminder to the authenticated admin account.

The current admin interface can inspect data and add tasks. It does not edit or delete users, sessions, feedback, or existing tasks.

### Daily email reminders

Reminder processing is implemented but disabled and in dry-run mode by default:

- Reading settings creates the singleton `NotificationSettings` row with ID `global` when it does not exist. Admins can control enabled days, the 1–500 user batch limit, dry-run mode, AI generation, deterministic fallback generation, and the subject template.
- Vercel Cron calls `/api/cron/daily-reminders` every day at 08:00 UTC. The endpoint requires `Authorization: Bearer <CRON_SECRET>` and returns a considered/generated/sent/skipped/failed summary.
- A run exits without processing when reminders are disabled or the current UTC weekday is inactive. Otherwise it selects the oldest eligible regular users who remain subscribed and have no log for that UTC send date.
- Gemini can create reminder content from the user's profile, recent sessions, and statistics. If AI generation is disabled or fails, deterministic text is used when fallback generation is enabled.
- Dry-run mode generates content and records a `skipped` log without contacting Resend. Live mode requires `RESEND_API_KEY`, sends through Resend, and records provider IDs or failures.
- Sending creates a unique unsubscribe token when needed. The public unsubscribe endpoint disables reminders and records the unsubscribe timestamp.
- The admin test endpoint targets the authenticated admin email. In dry-run mode it returns a subject and preview; in live mode it sends a `[Test]` message.

`NotificationLog` enforces one record per user and UTC send date and stores status (`skipped`, `generated`, `sent`, or `failed`), subject, body preview, provider message ID, error, and creation time.

## Music Theory Interval Game

The Theory Game is a client-interactive ear-training feature at `/theory-game`. Static curriculum rules live in `lib/theory-game`, piano playback runs in the browser, and authenticated best scores are stored through the API and Prisma.

### Hierarchy

The hierarchy is:

```text
Level
└── Phase
    └── Round
```

- A **level** contains generated phases and displays the sum of the user's phase high scores.
- A **phase** has a fixed answer bank, round count, point value, stable ID, and individual high score.
- A **round** contains one hidden ascending pair of piano notes and one correct interval answer.

All levels and phases are unlocked and can be replayed any number of times.

### Interval bank

The game covers every chromatic distance from unison through one octave:

| ID | Answer label | Semitones |
| --- | --- | ---: |
| `p1` | Unison | 0 |
| `m2` | Minor 2nd | 1 |
| `M2` | Major 2nd | 2 |
| `m3` | Minor 3rd | 3 |
| `M3` | Major 3rd | 4 |
| `p4` | Perfect 4th | 5 |
| `tt` | Tritone | 6 |
| `p5` | Perfect 5th | 7 |
| `m6` | Minor 6th | 8 |
| `M6` | Major 6th | 9 |
| `m7` | Minor 7th | 10 |
| `M7` | Major 7th | 11 |
| `p8` | Octave | 12 |

The non-tritone intervals are organized into eight families:

- Unison: `p1`
- 2nds: `m2`, `M2`
- 3rds: `m3`, `M3`
- 4th: `p4`
- 5th: `p5`
- 6ths: `m6`, `M6`
- 7ths: `m7`, `M7`
- Octave: `p8`

The four opposite/forbidden family relationships are:

- Unison + octave
- 2nds + 7ths
- 3rds + 6ths
- 4th + 5th

These relationships drive the phase combinations in Levels 2–4. Tritone is handled separately as a wildcard in those levels.

### Levels and phases

| Level | Phase-generation rule | Phases | Rounds per phase | Points per correct answer | Level maximum |
| ---: | --- | ---: | ---: | ---: | ---: |
| 1 | Focused two-answer contrast phases | 7 | 12 | 5 | 420 |
| 2 | Every two-family combination except the four forbidden pairs | 24 | 12 | 5 | 1,440 |
| 3 | One forbidden pair plus one of the six remaining families | 24 | 12 | 5 | 1,440 |
| 4 | Four families containing exactly one forbidden relationship | 48 | 12 | 5 | 2,880 |
| 5 | One phase containing all 13 intervals | 1 | 15 | 100 | 1,500 |

Level 1 phases are:

1. Minor 2nd vs major 2nd
2. Minor 3rd vs major 3rd
3. Perfect 4th vs tritone
4. Tritone vs perfect 5th
5. Minor 6th vs major 6th
6. Minor 7th vs major 7th
7. Unison vs octave

For Levels 2–4, tritone is always displayed in the answer bank and has a 20% chance of being selected for a round. When it is not selected, the program chooses uniformly from the other concrete intervals in that phase's answer bank. Level 1 and Level 5 choose uniformly from their complete answer banks.

Each Level 1–4 phase has a maximum of 60 points. The Level 5 phase has a maximum of 1,500 points.

### Round generation and playback

1. Starting a phase loads and decodes all 49 bundled piano samples from MIDI 48 through 96 (`C3` through `C7`).
2. The game selects an interval according to the current phase rules.
3. It chooses a random lower MIDI note that leaves enough room for the upper note to remain within `C7`.
4. The upper note is the lower note plus the interval's semitone distance, so all tested intervals are ascending and no larger than an octave.
5. The exact same lower/upper note pair cannot occur in two consecutive rounds. Generation retries and then shifts the root as a deterministic fallback if necessary.
6. Both notes play together when the round starts.
7. The user can replay them together or play Note 1 and Note 2 separately.

Web Audio schedules simultaneous notes with a small shared start delay and lowers the gain when two samples play together. Starting another playback stops the currently active sources.

### Answer and score flow

1. The user selects one interval from the phase's answer bank.
2. The answer locks immediately; a round cannot be rescored by clicking again.
3. A correct answer turns green and adds the phase's point value.
4. An incorrect choice turns red, awards zero points, and reveals the correct answer in green.
5. The user explicitly advances to the next round.
6. At the end of the phase, the client submits the number of correct answers rather than a client-calculated score.
7. The server validates the level, stable phase ID, and allowed round count, then derives the score from the server-side curriculum.

### Progress and persistence

`TheoryPhaseScore` stores:

- User ID
- Level number
- Stable phase ID
- Best score
- Creation and update timestamps

The combination of user, level, and phase is unique. Saving uses an upsert plus a conditional update, so a lower later attempt never replaces a higher score. A zero-point first attempt is still recorded as attempted.

The level score is not a separate database value. It is calculated by summing the best scores for every phase in that level. Progress responses also include each phase maximum, the level maximum, and attempted-phase counts.

### Local Theory Game mode

Set this before starting the development server:

```env
NEXT_PUBLIC_THEORY_GAME_LOCAL_PROGRESS=true
```

In this mode:

- Progress is read from and written to `practiceArenaTheoryGameScores` in localStorage.
- The score API and `TheoryPhaseScore` table are not used.
- The protected shell allows `/theory-game` without a user JWT.
- Other protected routes remain protected.
- A visible banner identifies local test mode.

Do not enable this variable in production if scores must be authenticated and persisted centrally.

### Piano samples and licensing

The 49 MP3 files in `public/audio/piano` are C3–C7 Acoustic Grand Piano samples from the FluidR3 General MIDI soundfont, distributed by the MIDI.js Soundfonts project. Filenames were changed to MIDI note numbers for lookup.

See:

- `public/audio/piano/ATTRIBUTION.md`
- `public/audio/piano/LICENSE-FLUIDR3-CC-BY-3.0.txt`
- `public/audio/piano/LICENSE-MIDIJS.txt`

## API Overview

All endpoints use the response envelope:

```ts
{ success: true, data: ... }
{ success: false, error: { code: string, message: string } }
```

Regular protected endpoints require the user bearer token. Admin endpoints require the separately stored admin bearer token.

### Authentication and profile

- `POST /api/auth/signup` — create a regular user and return `{ token, user }`.
- `POST /api/auth/login` — validate a regular user and return `{ token, user }`.
- `GET /api/profile` — return the authenticated user's safe profile.
- `POST /api/profile` — update nickname, guitar instrument, level, or goals.

### Practice sessions

- `POST /api/session/generate` — generate and persist a practice plan.
- `POST /api/session/complete` — mark valid assigned tasks complete and upsert feedback.
- `GET /api/session/history` — return the user's sessions newest first with tasks and feedback.
- `GET /api/session/stats` — return session count, average ratings, and task-completion rate.

### Theory Game

- `GET /api/theory-game/progress` — return all generated levels and phases merged with the user's stored best scores.
- `POST /api/theory-game/scores` — accept `{ levelId, phaseId, correctAnswers }`, validate it, derive the score, and preserve the higher result.

### Coach and Song Learner

- `POST /api/chat` — answer music/practice questions using recent Practice Arena context and Gemini.
- `POST /api/song-learner` — search SerpApi in parallel for an Ultimate Guitar match and a YouTube listening result, with Google-search fallback URLs.

### Admin

- `POST /api/admin/auth/login` — validate the JSON email/password payload, require a DB-backed user with `role = admin`, compare the password hash, and return `{ token, user }`. Invalid JSON or input returns `400`; invalid credentials return `401`.
- `GET /api/admin/users` — list regular users newest first with derived session, assigned-task, completed-task, and feedback counts.
- `GET /api/admin/users/[userId]` — return one regular user's profile, sessions newest first, tasks, completion state, and feedback. A missing or admin-role target returns `404`.
- `GET /api/admin/tasks` — list reusable practice tasks newest first.
- `POST /api/admin/tasks` — validate and create a reusable practice task, returning `201`. Invalid JSON or task data returns `400`.
- `GET /api/admin/notifications` — read global reminder settings, creating the default singleton row when necessary.
- `POST /api/admin/notifications` — validate and update global reminder settings.
- `POST /api/admin/notifications/test` — generate a dry-run preview or send a live test reminder to the authenticated admin.

Except for the login endpoint, every admin endpoint requires `Authorization: Bearer <admin-token>`. Missing, invalid, expired, or non-admin credentials return `401`.

### Daily reminders

- `GET /api/cron/daily-reminders` — run the reminder batch after validating `Authorization: Bearer <CRON_SECRET>`.
- `GET /api/notifications/unsubscribe?token=...` — disable reminders for the user identified by a valid unsubscribe token and return a small HTML confirmation page.

### Utility

- `GET /api/test` — basic database connectivity check.

## Architecture

### App Router and client UI

- `app/(protected)` contains the regular-user shell and protected pages.
- Interactive pages and hooks use client components because authentication, current-session state, Web Audio, and local progress rely on browser APIs.
- `app/api/**/route.ts` contains HTTP boundaries: authentication, parsing, validation, service calls, and consistent responses.

### Services

- `user.service.ts` creates users, hashes passwords, reads profiles, and performs safe profile updates.
- `session.service.ts` generates, saves, completes, lists, and aggregates practice sessions.
- `chat.service.ts` builds Practice Arena context and calls Gemini with model fallbacks.
- `admin.service.ts` handles admin user/task views and task creation.
- `notification.service.ts` manages settings, eligibility, content generation, Resend delivery, logging, tests, and unsubscribe state.
- `theory-game.service.ts` reads high scores, builds progress, and performs monotonic score updates.

### Algorithms and shared libraries

- `algorithms` contains pure practice-session and Theory Game tests plus the practice generator.
- `lib/theory-game/definitions.ts` is the source of truth for intervals, families, levels, phases, round counts, and scoring.
- `lib/theory-game/rounds.ts` generates bounded note pairs and sample paths.
- `lib/theory-game/progress.ts` combines static curriculum data with stored scores.
- `lib/client` contains token/session storage, API clients, local theory progress, and piano playback.
- `lib/auth.ts`, `lib/validators.ts`, and `lib/api-response.ts` provide shared server-side authentication, validation, and response behavior.

### Prisma data model

- `User` stores identity, hashed password, profile data, role, and relations.
- `Session` stores mood, available time, optional goal, assigned tasks, and optional feedback.
- `Task` stores reusable guitar-practice content and metadata.
- `SessionTask` records task assignment and completion.
- `Feedback` stores one difficulty/focus rating pair per session.
- `TheoryPhaseScore` stores per-user phase high scores.
- `NotificationSettings`, `NotificationLog`, and reminder-related user fields store operational reminder configuration, unsubscribe state, and per-day delivery results.

## Current Limitations

- Regular and admin JWTs are stored in localStorage rather than secure HTTP-only cookies or server-backed sessions.
- Protected-page routing is enforced in the client shell; API routes independently validate bearer tokens.
- Admin management is read-only for users and session history; existing users, sessions, feedback, and tasks cannot be edited or deleted from the dashboard.
- Reminder delivery depends on Vercel Cron, a correct `CRON_SECRET`, and Resend configuration when dry-run mode is disabled.
- Practice-session content and profile validation are currently guitar-only.
- The current-session page loads full session history and locates the localStorage session ID client-side; there is no dedicated current-session endpoint.
- Theory Game rounds are ascending harmonic intervals from unison through one octave.
- Theory Game persists only the best phase score, not every attempt or individual round result.
- Theory rounds are generated in the browser. The server validates phase identity and score bounds but does not replay or cryptographically verify the generated rounds.
- The AI Coach requires Gemini, and Song Learner requires SerpApi plus outbound network access.
