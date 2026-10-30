# Trading monorepo architecture

## Boundaries

`apps/api` serves authenticated HTTP requests and owns server-only integrations. `apps/worker` is a separate long-running process for durable/background work. Both may share Supabase, but user-facing access must remain subject to RLS. Ably credentials and Supabase service credentials stay server-side. `apps/mobile` is reserved for the original Flutter client; it was absent from both inspected repositories on 2026-10-29.

The API uses Node.js 22, TypeScript, Fastify, and Vitest. The worker uses Node.js 22 and TypeScript. Supabase PostgreSQL is the persistent store; Ably is realtime transport. GitHub Actions checks the Node workspaces and conditionally builds the mobile APK.

## Local development

1. Install Node.js 22 and Flutter stable if working on mobile.
2. Run `npm install` and copy `.env.example` to `.env`.
3. Set local development credentials only. Do not point local tests at production.
4. Run `npm test` and `npm run typecheck`.
5. Use a local Supabase instance to review migrations. Never apply migrations to production as part of CI.

## Runtime contracts

- API exposes `/health` as a dependency-free liveness endpoint.
- Admin commands require an authenticated principal with the `admin` role and an audit writer.
- Realtime authorization issues narrowly scoped, short-lived Ably tokens after user authorization.
- Worker shutdown stops accepting work and completes in-flight work before exit.
- APK output is produced only when `apps/mobile/pubspec.yaml` is present.
