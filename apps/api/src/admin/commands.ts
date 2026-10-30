export interface AdminPrincipal {
  userId: string;
  role: string;
}

export interface AuditEvent {
  actorId: string;
  command: string;
  targetId: string;
  requestId: string;
  outcome: 'requested' | 'succeeded' | 'failed';
  occurredAt: string;
}

export interface AdminCommandDependencies {
  writeAudit: (event: AuditEvent) => Promise<void>;
  execute: (command: string, targetId: string) => Promise<void>;
  now?: () => Date;
}

export async function executeGodModeCommand(
  principal: AdminPrincipal,
  input: { command: string; targetId: string; requestId: string },
  dependencies: AdminCommandDependencies,
): Promise<void> {
  if (!principal.userId.trim() || principal.role !== 'admin') throw new Error('forbidden');
  if (!input.command.trim() || !input.targetId.trim() || !input.requestId.trim()) {
    throw new Error('invalid command');
  }

  const occurredAt = (dependencies.now ?? (() => new Date()))().toISOString();
  await dependencies.writeAudit({
    actorId: principal.userId,
    command: input.command,
    targetId: input.targetId,
    requestId: input.requestId,
    outcome: 'requested',
    occurredAt,
  });

  try {
    await dependencies.execute(input.command, input.targetId);
  } catch (error) {
    await dependencies.writeAudit({
      actorId: principal.userId,
      command: input.command,
      targetId: input.targetId,
      requestId: input.requestId,
      outcome: 'failed',
      occurredAt: (dependencies.now ?? (() => new Date()))().toISOString(),
    });
    throw error;
  }

  await dependencies.writeAudit({
    actorId: principal.userId,
    command: input.command,
    targetId: input.targetId,
    requestId: input.requestId,
    outcome: 'succeeded',
    occurredAt: (dependencies.now ?? (() => new Date()))().toISOString(),
  });
}
