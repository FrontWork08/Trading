# Trading

Monorepo foundation for the Trading simulator. The repositories inspected on 2026-10-29 did not contain the Flutter app, so `apps/mobile` is reserved for restoring that source; this bootstrap does not fabricate or replace it.

## Workspace

- `apps/api`: HTTP API and privileged integrations.
- `apps/worker`: persistent background process.
- `apps/mobile`: location for the original Flutter app once recovered.
- `supabase/migrations`: versioned schema and row-level security policies. Migrations here have **not** been applied to production.

Use Node.js 22 and `npm install`, `npm test`, `npm run typecheck`. Copy `.env.example` to `.env` for local development and provide credentials through your local secret manager; never commit secrets.

The GitHub Actions workflow runs backend checks and builds an APK only when `apps/mobile/pubspec.yaml` exists. Production deploys and migrations are intentionally outside CI.

See [architecture](docs/architecture/monorepo.md), [security](docs/architecture/security.md), and [implementation plan](docs/superpowers/plans/2026-10-29-trading-monorepo.md).
