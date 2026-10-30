import { describe, expect, it, vi } from 'vitest';
import { executeGodModeCommand } from '../src/admin/commands.js';

const input = { command: 'pause-trading', targetId: 'market-1', requestId: 'req-1' };

describe('God Mode commands', () => {
  it('denies non-admin principals without auditing or executing', async () => {
    const writeAudit = vi.fn();
    const execute = vi.fn();
    await expect(executeGodModeCommand({ userId: 'u1', role: 'user' }, input, { writeAudit, execute }))
      .rejects.toThrow('forbidden');
    expect(writeAudit).not.toHaveBeenCalled();
    expect(execute).not.toHaveBeenCalled();
  });

  it('audits before execution and records the successful outcome', async () => {
    const order: string[] = [];
    const writeAudit = vi.fn(async (event) => { order.push(`audit:${event.outcome}`); });
    const execute = vi.fn(async () => { order.push('execute'); });
    await executeGodModeCommand({ userId: 'admin-1', role: 'admin' }, input, {
      writeAudit, execute, now: () => new Date('2026-10-29T12:00:00.000Z'),
    });
    expect(order).toEqual(['audit:requested', 'execute', 'audit:succeeded']);
  });

  it('does not execute when the request audit cannot be persisted', async () => {
    const execute = vi.fn();
    await expect(executeGodModeCommand({ userId: 'admin-1', role: 'admin' }, input, {
      writeAudit: vi.fn().mockRejectedValue(new Error('audit unavailable')), execute,
    })).rejects.toThrow('audit unavailable');
    expect(execute).not.toHaveBeenCalled();
  });
});
