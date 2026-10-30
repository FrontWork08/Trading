# Security model

- Client access to user data is governed by Supabase RLS and `auth.uid()` ownership.
- The service-role key and Ably API key are server-only secrets. They must never be sent to Flutter or committed.
- God Mode commands are admin-only, validate the target, and write an audit event before mutation. The execution result is recorded as a second event. An audit failure before mutation fails closed.
- Audit records are append-only to clients; production retention and privileged access are operational policies to configure separately.
- Migrations in this repository are source files only. No production migration has been applied.
- Tests use fakes/local services and must not contact production.
