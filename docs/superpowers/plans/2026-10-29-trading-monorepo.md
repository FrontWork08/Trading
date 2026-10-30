# Trading Monorepo Bootstrap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Establish a secure, testable monorepo foundation for Trading while leaving the missing Flutter application ready to be restored without fabricating its implementation.

**Architecture:** Use a TypeScript workspace for an HTTP API and a separately runnable persistent worker. Supabase SQL migrations define the data model and restrictive RLS; the API owns privileged actions and Ably token issuance; all God Mode operations are authenticated and audited. Flutter is an explicitly documented integration slot, and GitHub Actions will build an APK when the real Flutter source is added.

**Tech Stack:** Node.js 22, TypeScript, Fastify, Vitest, Supabase PostgreSQL, Ably Node SDK, GitHub Actions, Flutter stable (CI path only; app source unavailable).

**Spec:** `docs/architecture/monorepo.md`

## Global Constraints

- Do not deploy, apply migrations to production, edit Vercel/Supabase settings, or expose secrets.
- Never claim the original Flutter app is preserved; neither repository contains it.
- Keep secrets out of Git and default to deny for database access.
- All God Mode mutations require authorization and an immutable audit record.
- CI may produce an APK only after `apps/mobile` contains a valid Flutter project.

## Review Focus

- Unauthenticated or non-admin God Mode request: denied and not executed.
- Audit persistence failure: privileged mutation must fail closed.
- Realtime token request for another user/channel: denied.
- Supabase client attempts cross-user data access: RLS denies it.
- Missing Flutter project in a fresh checkout: workflow reports a clear skip rather than failing unrelated backend checks.

---

### Task 1: Architecture and workspace foundation

**Files:** `docs/architecture/monorepo.md`, `package.json`, `tsconfig.base.json`, `.gitignore`, `.env.example`

- [ ] Document service boundaries, local commands, environment names, data ownership, and production safety boundary.
- [ ] Create npm workspaces for `apps/api` and `apps/worker`; pin supported Node major to 22.
- [ ] Add environment variable names only; include no values that resemble real credentials.
- [ ] Verify workspace manifests parse and install scripts are documented.

### Task 2: API and worker skeleton

**Files:** `apps/api/src/server.ts`, `apps/api/src/config.ts`, `apps/api/test/health.test.ts`, `apps/api/package.json`, `apps/worker/src/worker.ts`, `apps/worker/test/worker.test.ts`, `apps/worker/package.json`

- [ ] Write failing health and worker lifecycle tests first.
- [ ] Implement a Fastify `/health` response and a worker entry point with graceful shutdown.
- [ ] Keep startup configuration validated and avoid connecting to remote production resources in tests.
- [ ] Run workspace tests and type checks.

### Task 3: Supabase schema and RLS

**Files:** `supabase/migrations/202610290001_initial_schema.sql`, `docs/architecture/security.md`

- [ ] Define profiles, portfolios, positions, orders, and immutable audit events with UUID keys and timestamps.
- [ ] Enable RLS on every user-owned table; use `auth.uid()` ownership policies.
- [ ] Make audit writes server-only and prevent updates/deletes for clients.
- [ ] Add local-only schema review instructions; do not run `db push` or apply against project `jhmkyqiomymsdncqiddr`.

### Task 4: Realtime and audited admin commands

**Files:** `apps/api/src/realtime/ably.ts`, `apps/api/src/admin/commands.ts`, `apps/api/test/admin-commands.test.ts`, `apps/api/test/realtime.test.ts`

- [ ] Use server-side Ably token issuance scoped to the authenticated user's channels.
- [ ] Gate God Mode commands behind an explicit admin role check.
- [ ] Record actor, command, target, request ID, timestamp, and outcome before reporting success.
- [ ] Fail closed if authorization or audit persistence fails; test these cases.

### Task 5: CI, docs, and Flutter integration boundary

**Files:** `.github/workflows/ci.yml`, `README.md`, `apps/mobile/README.md`

- [ ] Run API/worker tests and type checks on pull requests.
- [ ] Add APK build job gated on presence of `apps/mobile/pubspec.yaml`; upload the APK artifact when available.
- [ ] Document that the original Flutter source must be restored into `apps/mobile` before claiming app preservation or APK output.
- [ ] Verify workflow YAML, repository tree, and documented commands; no deployment or production migration.
