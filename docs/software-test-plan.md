# Software Test Plan (STP) - Practice Arena

Version: 1.0  
Project: Practice Arena  
Document type: Software Test Plan  
Prepared for: Academic final project review and implementation validation

## 1. Introduction

This Software Test Plan defines the testing approach for Practice Arena, a Next.js web application for personalized guitar practice planning, practice-session completion, progress tracking, AI-assisted music coaching, song-resource lookup, interval ear training, admin task management, and daily email reminders.

The purpose of this plan is to verify that the main user-facing flows, backend APIs, recommendation algorithms, validation rules, role-based access controls, and deployment checks work according to the current implementation design. The plan combines automated tests, manual system testing, and acceptance testing.

## 2. Test Items

The following software items and modules are included in the testing scope:

| Test Item | Main Files or Routes | Purpose |
| --- | --- | --- |
| Authentication | `/auth`, `/api/auth/signup`, `/api/auth/login`, `lib/auth.ts`, `services/user.service.ts` | User signup, login, password hashing, JWT creation, and role checks. |
| Profile management | `/profile`, `/api/profile`, `lib/validators.ts`, `services/user.service.ts` | Viewing and updating user profile fields. |
| Practice session generation | `/session/new`, `/api/session/generate`, `services/session.service.ts`, `algorithms/*.ts` | Creating personalized practice sessions from user context and reusable tasks. |
| Current session completion | `/session/current`, `/api/session/complete` | Completing assigned tasks and submitting feedback. |
| History and statistics | `/history`, `/api/session/history`, `/api/session/stats` | Displaying saved sessions and aggregate progress data. |
| AI coach | `/coach`, `/api/chat`, `services/chat.service.ts` | Context-aware music-practice assistant using Gemini. |
| Song learner | `/song-learner`, `/api/song-learner` | Searching for tablature/listening resources using SerpApi and fallback URLs. |
| Theory game | `/theory-game`, `/api/theory-game/progress`, `/api/theory-game/scores`, `lib/theory-game/*` | Interval-game curriculum, round behavior, progress, and best-score persistence. |
| Admin authentication | `/admin/login`, `/api/admin/auth/login` | Separate admin login and admin-role JWT use. |
| Admin dashboard | `/admin`, `/api/admin/users`, `/api/admin/tasks`, `services/admin.service.ts` | User inspection and reusable task management. |
| Notifications | `/api/admin/notifications`, `/api/admin/notifications/test`, `/api/cron/daily-reminders`, `/api/notifications/unsubscribe`, `services/notification.service.ts` | Reminder settings, dry-run/live reminder flow, cron authorization, and unsubscribe behavior. |
| Build and static checks | `package.json`, TypeScript, ESLint, Next.js build | Regression checks before delivery. |

## 3. Features to be Tested

The current testing cycle will verify the following features:

### User Authentication and Profile

- New user registration with valid email, password, level, and goals.
- Login with valid and invalid credentials.
- JWT-protected access to regular-user API routes.
- Profile retrieval and update.
- Validation for level, guitar-only instrument, required goals, and nickname length.

### Practice Session Flow

- Practice-session generation using mood, available time, and optional goal.
- Recommendation algorithm behavior for difficulty, time blocks, task scoring, mood preference, goal preference, feedback adaptation, and deterministic tie-breaking.
- Current-session loading from localStorage state.
- Task completion with only valid assigned task IDs.
- Feedback submission using difficulty and focus ratings from 1 to 5.
- History list and aggregate statistics after completion.

### AI Coach and Song Learner

- Coach requests with authenticated user context.
- Coach error handling when `GEMINI_API_KEY` is missing or external AI request fails.
- Song Learner request validation.
- SerpApi search success path and missing-key failure path.
- Google fallback URL behavior when preferred Ultimate Guitar or YouTube result is not found.

### Theory Game

- Generated level and phase structure.
- Interval bank correctness.
- Score calculation from correct answers.
- Best-score persistence where lower later scores do not overwrite higher scores.
- Local theory progress mode when `NEXT_PUBLIC_THEORY_GAME_LOCAL_PROGRESS=true`.

### Admin and Notifications

- Admin login with valid and invalid credentials.
- Rejection of normal user tokens on admin APIs.
- User overview and user-detail views.
- Reusable task creation and validation.
- Notification settings read/update.
- Admin test reminder in dry-run mode.
- Cron reminder rejection without correct `CRON_SECRET`.
- Unsubscribe endpoint behavior for valid and invalid tokens.

### Regression and Build Quality

- Existing algorithm tests.
- Existing notification-rule tests.
- ESLint checks.
- Production build check.

## 4. Features Not to be Tested

The following items are out of scope for this testing cycle:

- Production-scale load, stress, and performance testing.
- Cross-browser and cross-device matrix testing beyond the selected local browser/environment.
- External-provider correctness for Gemini, SerpApi, YouTube, Ultimate Guitar, or Resend.
- Payment processing, because the application has no payment feature.
- Instruments other than guitar, because current validation intentionally supports guitar only.
- Full security penetration testing.
- Database disaster recovery and backup restoration.
- Editing or deleting existing users, sessions, feedback, or reusable tasks from the admin dashboard
## 5. Testing Strategy

Testing will be performed in layers so that pure logic, service behavior, API boundaries, and complete user flows are all covered.

### Unit Testing

Unit tests will verify deterministic functions that do not require a browser or live external services.

- Practice-session algorithms: difficulty calculation, time-block splitting, task selection, mood and goal scoring, feedback adjustment, and tie-breaking.
- Theory-game definitions and scoring rules.
- Notification rule functions such as active-day selection, subject generation, deterministic fallback content, and settings normalization.

Automated command:

```bash
npm run test:algorithms
npm run test:notifications
```

### Integration Testing

Integration tests will verify that API routes, services, validation, authentication, and Prisma persistence work together.

Recommended focus areas:

- Signup/login API with database persistence.
- Session generation creates `Session` and `SessionTask` rows.
- Session completion updates valid assigned tasks and upserts `Feedback`.
- Theory score API validates phase IDs and preserves best scores.
- Admin APIs enforce admin role.
- Notification settings and logs are saved correctly.

### System Testing

System testing will verify complete workflows through the running application:

- Signup/login/profile setup.
- Generate a practice session, complete it, and view history/statistics.
- Ask the AI coach a music-practice question.
- Search for a song-learning resource.
- Play a theory-game phase and save progress.
- Log in as admin, inspect a user, create a task, and test reminder settings.

### Acceptance Testing

Acceptance testing will be performed from the perspective of the expected users:

- Regular user can complete the main practice lifecycle without developer intervention.
- Admin can inspect application data and add reusable practice content.
- Optional integrations fail gracefully when keys are missing.
- The application can pass lint and build checks before final submission.

### Regression Testing

Regression testing will be run after meaningful changes to routes, services, algorithms, Prisma schema, or validation logic.

Recommended regression commands:

```bash
npm run lint
npm run test:algorithms
npm run test:notifications
npm run build
```

## 6. Test Environment

### Software

| Component | Requirement |
| --- | --- |
| Operating system | Local development machine supported by Node.js and Next.js. |
| Runtime | Node.js compatible with the project dependencies. |
| Framework | Next.js 16.2.1 and React 19.2.4. |
| Database | PostgreSQL database configured through `DATABASE_URL`. |
| ORM | Prisma 7.6.0. |
| Browser | A modern browser such as Chrome, Edge, or Firefox. |
| Test runner | Node.js built-in test runner with `tsx`. |
| Static checks | ESLint and Next.js production build. |

### Environment Variables

Required for core testing:

- `DATABASE_URL`
- `JWT_SECRET`

Optional for integration-specific testing:

- `GEMINI_API_KEY`
- `SERPAPI_API_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `APP_BASE_URL`
- `CRON_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_THEORY_GAME_LOCAL_PROGRESS`

### Tools

| Tool | Use |
| --- | --- |
| VS Code | Development and manual inspection. |
| Browser dev tools | Client-side debugging and network inspection. |
| Prisma | Database client generation and database access. |
| Postman or equivalent | Manual API testing. |
| Git/GitHub | Version control and change tracking. |
| Terminal | Running development server and test commands. |

## 7. Responsibilities

| Role | Responsibilities |
| --- | --- |
| Developer | Implement features, maintain automated tests, fix defects, and run regression commands. |
| Tester / QA reviewer | Execute manual test cases, record actual results, report defects, and verify fixes. |
| Project owner / student | Confirm requirements, prioritize fixes, and approve final acceptance results. |
| Admin test user | Validate admin login, user inspection, task creation, and reminder configuration. |
| Regular test user | Validate signup, profile, practice session, feedback, history, coach, song learner, and theory game flows. |

## 8. Schedule

| Phase | Activities | Estimated Timing |
| --- | --- | --- |
| Test preparation | Confirm environment variables, database access, seed admin user, and available task inventory. | Day 1 |
| Unit and regression testing | Run algorithm tests, notification tests, lint, and build. | Day 1 |
| API and integration testing | Validate auth, profile, session, theory, admin, and notification endpoints. | Day 2 |
| Manual system testing | Execute main user, admin, coach, song learner, and theory game flows in the browser. | Day 3 |
| Defect fixing and retesting | Fix failed cases and rerun affected regression tests. | Day 4 |
| Acceptance review | Review final results, unresolved risks, and readiness for submission/demo. | Day 5 |

## 9. Risks and Contingencies

| Risk | Impact | Contingency |
| --- | --- | --- |
| Missing or invalid environment variables | Core or optional features may fail during testing. | Maintain a documented `.env` checklist and test optional integrations separately. |
| Database connection failure | Signup, session, admin, and persistence tests cannot run. | Verify `DATABASE_URL`, run a connectivity check, and use a known test database. |
| External API unavailability | AI coach, Song Learner, or live reminders may fail. | Test graceful error handling and fallback behavior; avoid making acceptance depend on third-party uptime. |
| Email provider restrictions | Live reminder tests may not send. | Use notification dry-run mode and admin test preview as the default acceptance path. |
| LocalStorage token state becomes stale | Browser tests may redirect unexpectedly. | Clear localStorage before each manual scenario or use a fresh browser profile. |
| Shared database data affects deterministic results | Existing sessions/tasks may change test outcomes. | Use dedicated test accounts and clearly named reusable test tasks. |
| Build or lint failure late in the cycle | Delivery may be delayed. | Run lint/build early and after every meaningful implementation change. |
| Cron endpoint accidentally run live | Emails could be sent unintentionally. | Keep reminders disabled or dry-run enabled during test cycles unless live delivery is intentionally tested. |

## 10. Representative Test Cases

The following test cases are representative scenarios for the STP. The `Actual Result` column should be filled during execution.

| Test Case ID | Description | Preconditions | Test Steps | Expected Result | Actual Result |
| --- | --- | --- | --- | --- | --- |
| TC-001 | Register a new user with valid details | Server running, database available, email not already used | 1. Open `/auth`.<br>2. Select signup.<br>3. Enter valid email, password, guitar instrument, level, and goals.<br>4. Submit the form. | User account is created, JWT is returned/stored, and user can continue to protected app flow. | To be filled during testing |
| TC-002 | Reject signup with invalid instrument | Server running | 1. Send signup request with instrument other than `guitar`.<br>2. Submit request. | API returns validation error because only guitar is currently supported. | To be filled during testing |
| TC-003 | Login with valid regular-user credentials | Existing regular user in database | 1. Open `/auth`.<br>2. Enter valid email and password.<br>3. Submit login form. | User logs in successfully and receives a regular-user token. | To be filled during testing |
| TC-004 | Login with incorrect password | Existing regular user in database | 1. Open `/auth`.<br>2. Enter valid email and incorrect password.<br>3. Submit login form. | Login fails with an invalid credentials message. | To be filled during testing |
| TC-005 | Update profile with valid fields | User logged in | 1. Open `/profile`.<br>2. Update nickname, level, or goals.<br>3. Save profile. | Profile is updated and displayed with the new values. | To be filled during testing |
| TC-006 | Generate practice session | User logged in, profile exists, reusable tasks exist | 1. Open `/session/new`.<br>2. Enter mood, available time, and optional goal.<br>3. Submit generation form. | Session is created, selected tasks are returned, and current session ID is stored. | To be filled during testing |
| TC-007 | Validate minimum available time | User logged in | 1. Send session generation request with available time below 5 minutes.<br>2. Submit request. | API returns validation error. | To be filled during testing |
| TC-008 | Complete assigned tasks and feedback | User has generated current session | 1. Open `/session/current`.<br>2. Mark one or more assigned tasks complete.<br>3. Enter difficulty and focus ratings.<br>4. Submit feedback. | Valid assigned tasks are marked complete, feedback is saved, and current session ID is cleared. | To be filled during testing |
| TC-009 | Ignore invalid completed task ID | User has a session; API request includes task ID not assigned to session | 1. Submit `/api/session/complete` with one valid and one invalid task ID.<br>2. Include valid ratings. | Only assigned task IDs are marked complete; invalid task ID is ignored. | To be filled during testing |
| TC-010 | View history and statistics | User has at least one completed or generated session | 1. Open `/history`.<br>2. Review session list and statistics. | History appears newest first and statistics show session count, average ratings, and completion rate. | To be filled during testing |
| TC-011 | Access protected route without token | Browser localStorage has no `practiceArenaToken` | 1. Clear localStorage.<br>2. Open `/profile` or `/session/new`. | User is redirected to `/auth`. | To be filled during testing |
| TC-012 | Ask AI coach with Gemini configured | User logged in, `GEMINI_API_KEY` configured | 1. Open `/coach`.<br>2. Ask a guitar-practice question.<br>3. Submit message. | Coach returns a music-practice response using user context. | To be filled during testing |
| TC-013 | Handle missing Gemini key | User logged in, `GEMINI_API_KEY` not configured | 1. Open `/coach`.<br>2. Submit a question. | API returns a clear configuration error instead of crashing. | To be filled during testing |
| TC-014 | Search Song Learner with valid input | User logged in, `SERPAPI_API_KEY` configured | 1. Open `/song-learner`.<br>2. Enter song title and optional artist.<br>3. Submit search. | Response includes learning guide, Ultimate Guitar or fallback URL, and YouTube or fallback URL. | To be filled during testing |
| TC-015 | Handle missing SerpApi key | User logged in, `SERPAPI_API_KEY` not configured | 1. Submit a Song Learner search. | API returns a clear message that SerpApi is not configured. | To be filled during testing |
| TC-016 | Load theory-game progress | User logged in or local theory mode enabled | 1. Open `/theory-game`.<br>2. View levels and phases. | Levels, phases, maximum scores, and saved progress are displayed. | To be filled during testing |
| TC-017 | Preserve higher theory score | User has an existing high score for a phase | 1. Submit a lower score for the same phase.<br>2. Reload progress. | Existing higher best score remains unchanged. | To be filled during testing |
| TC-018 | Admin login with valid credentials | Admin account seeded with `npm run prisma:seed` | 1. Open `/admin/login`.<br>2. Enter admin email and password.<br>3. Submit form. | Admin token is stored and admin dashboard opens. | To be filled during testing |
| TC-019 | Reject normal user on admin API | Regular user token exists | 1. Call an admin API with regular-user bearer token. | API returns unauthorized response. | To be filled during testing |
| TC-020 | Create reusable admin task | Admin logged in | 1. Open admin dashboard.<br>2. Go to Add task.<br>3. Enter valid task details.<br>4. Submit form. | New task is created and appears in task inventory. | To be filled during testing |
| TC-021 | Reject invalid admin task duration | Admin logged in | 1. Submit task with duration outside allowed range.<br>2. Submit form. | API returns validation error. | To be filled during testing |
| TC-022 | Update notification settings | Admin logged in | 1. Open admin notifications panel.<br>2. Change dry-run or active days.<br>3. Save settings. | Settings are saved and reloaded with updated values. | To be filled during testing |
| TC-023 | Generate admin reminder test in dry-run mode | Admin logged in, notification dry-run enabled | 1. Open admin notifications panel.<br>2. Run test reminder. | Test returns subject and preview without sending email. | To be filled during testing |
| TC-024 | Reject cron without secret | No or invalid `Authorization` header | 1. Call `/api/cron/daily-reminders` without valid bearer secret. | API returns unauthorized response. | To be filled during testing |
| TC-025 | Unsubscribe with valid token | User has an unsubscribe token | 1. Open `/api/notifications/unsubscribe?token=<valid-token>`. | User reminders are disabled and confirmation HTML is returned. | To be filled during testing |
| TC-026 | Run algorithm tests | Dependencies installed | 1. Run `npm run test:algorithms`. | Practice and theory algorithm tests pass. | To be filled during testing |
| TC-027 | Run notification tests | Dependencies installed | 1. Run `npm run test:notifications`. | Notification rule tests pass. | To be filled during testing |
| TC-028 | Run lint check | Dependencies installed | 1. Run `npm run lint`. | ESLint completes without blocking errors. | To be filled during testing |
| TC-029 | Run production build | Dependencies and environment configured | 1. Run `npm run build`. | Prisma Client is generated and Next.js production build succeeds. | To be filled during testing |
