import Ably from 'ably';

export interface RealtimePrincipal {
  userId: string;
}

export function capabilityForUser(userId: string): string {
  if (!userId.trim()) throw new Error('unauthorized');
  return JSON.stringify({ [`user:${userId}:*`]: ['subscribe', 'presence'] });
}

export function createAblyTokenIssuer(apiKey: string) {
  const ably = new Ably.Rest({ key: apiKey });
  return async function issueToken(principal: RealtimePrincipal) {
    return ably.auth.createTokenRequest({
      clientId: principal.userId,
      capability: capabilityForUser(principal.userId),
      ttl: 60 * 60 * 1000,
    });
  };
}
