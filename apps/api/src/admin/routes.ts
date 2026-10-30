import type { FastifyInstance } from 'fastify';
import { executeGodModeCommand, type AdminCommandDependencies, type AdminPrincipal } from './commands.js';

export interface AdminRouteDependencies extends AdminCommandDependencies {
  authenticate: (authorizationHeader: string | undefined) => Promise<AdminPrincipal | null>;
}

export async function registerAdminRoutes(app: FastifyInstance, dependencies: AdminRouteDependencies): Promise<void> {
  app.post<{ Params: { command: string }; Body: { targetId: string; requestId: string } }>(
    '/admin/commands/:command',
    {
      schema: {
        body: {
          type: 'object',
          required: ['targetId', 'requestId'],
          additionalProperties: false,
          properties: {
            targetId: { type: 'string', minLength: 1, maxLength: 128 },
            requestId: { type: 'string', minLength: 1, maxLength: 128 },
          },
        },
      },
    },
    async (request, reply) => {
      const principal = await dependencies.authenticate(request.headers.authorization);
      if (!principal) return reply.code(401).send({ error: 'unauthorized' });
      try {
        await executeGodModeCommand(principal, {
          command: request.params.command,
          targetId: request.body.targetId,
          requestId: request.body.requestId,
        }, dependencies);
        return reply.code(202).send({ status: 'accepted', requestId: request.body.requestId });
      } catch (error) {
        if (error instanceof Error && error.message === 'forbidden') {
          return reply.code(403).send({ error: 'forbidden' });
        }
        if (error instanceof Error && error.message === 'invalid command') {
          return reply.code(400).send({ error: 'invalid command' });
        }
        throw error;
      }
    },
  );
}
