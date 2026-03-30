# Practice Arena Final Project Plan (Through May 31, 2026)

## Summary
Deliver a production-ready MVP+ for final submission with three guaranteed pillars: authenticated end-to-end practice flow, history/analytics dashboard, and lightweight RAG decision support. Keep recommendation task selection rule-based; use RAG for guidance/explanations/resource retrieval only.

## Public Interfaces and Data Changes
1. Auth transport: move JWT from response-body/Bearer usage to `HttpOnly` cookie-based session (`Secure`, `SameSite=Lax`, `Path=/`), including logout cookie clear.
2. Session generation input: keep current context contract (`mood`, `availableTime`, optional goal/focus field if added), and return plan blocks + explainability metadata.
3. Dashboard API additions: add history/stats endpoint(s) returning session list, completion rate, streak/consistency proxy, and difficulty/focus trends.
4. Resource retrieval interface: add a lightweight RAG service interface that accepts user/profile/session context and returns ranked resource suggestions + short rationale.
5. Task dataset schema extension: enrich seeded task/content metadata (tags, intent, level fit, mood/time suitability, optional external links/source type).

## Implementation Changes
1. Frontend flow: implement a single protected stepper page with views for auth, profile setup, context input, generated plan, feedback capture, and dashboard access.
2. Backend integration: wire frontend to existing auth/profile/session/feedback APIs; add robust loading/error/empty states and unauthorized handling.
3. Cookie auth migration: update auth routes and request user extraction to support cookies (temporarily allow Bearer fallback only during transition).
4. Dashboard module: build session history list + compact analytics cards/charts using stored session/task/feedback data.
5. Lightweight RAG module: create curated knowledge base + retrieval/ranking layer for external learning resources and explainable guidance text.
6. Database content creation: expand `prisma/seed.ts` into expert-curated practice library and resource records sufficient for demos across beginner/intermediate/advanced.
7. Observability and safety: add structured logging around generation/retrieval failures and user-facing fallback messages.
8. Documentation alignment: map implemented features directly to functional/non-functional requirements list for final report traceability.

## Test Plan
1. Auth tests: signup/login/logout, cookie issuance/expiry behavior, unauthorized access rejection.
2. Session tests: context validation, plan generation correctness, time-block integrity, edge cases (minimal/max time).
3. Feedback/adaptation tests: completion marking, feedback upsert behavior, trend/stat calculations.
4. Dashboard tests: correct aggregation for history and analytics under sparse and dense data.
5. RAG tests: deterministic retrieval from curated corpus, relevance ranking sanity, fallback when no match.
6. End-to-end scenarios: new user first session, returning user adaptive session, failure-path resilience (API/network/retrieval errors).

## Timeline (March 30–May 31, 2026)
1. Apr 1–Apr 14: cookie auth migration, stepper shell, profile/context/plan flow.
2. Apr 15–Apr 30: feedback flow, dashboard APIs/UI, enriched seeded dataset.
3. May 1–May 15: lightweight RAG integration, explainability, stabilization.
4. May 16–May 31: full QA pass, bug fixing, performance pass, demo hardening, requirement trace matrix.

## Assumptions and Defaults
1. Scope choice fixed: Balanced A-grade, implementation-focused, with lightweight RAG.
2. RAG remains decision-support only; core rule-based algorithm continues selecting tasks.
3. Initial instrument focus stays guitar-first; extensibility hooks are prepared but not fully generalized.
4. History analytics are practical and defensible (not research-grade ML inference).
5. Existing APIs/models remain base; only additive changes unless a blocker requires contract cleanup.
