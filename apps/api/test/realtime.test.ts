import { describe, expect, it } from 'vitest';
import { capabilityForUser } from '../src/realtime/ably.js';

describe('Ably capability', () => {
  it('scopes realtime access to the authenticated user namespace', () => {
    expect(JSON.parse(capabilityForUser('u-123'))).toEqual({
      'user:u-123:*': ['subscribe', 'presence'],
    });
  });

  it('rejects an empty user identity', () => {
    expect(() => capabilityForUser(' ')).toThrow('unauthorized');
  });
});
