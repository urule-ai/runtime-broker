import Fastify from 'fastify';
import { loadConfig } from './config.js';
import { authMiddleware } from '@urule/auth-middleware';
import { MockProvider } from './providers/mock-provider.js';
import { SessionManager } from './services/session-manager.js';
import { sessionsRoutes } from './routes/sessions.routes.js';

export async function buildServer() {
  const config = loadConfig();
  const app = Fastify({ logger: true });

  // Auth middleware
  await app.register(authMiddleware, { publicRoutes: ['/healthz'] });

  const sessionManager = new SessionManager();
  sessionManager.registerProvider(new MockProvider());

  app.register(sessionsRoutes, { sessionManager });

  app.get('/healthz', async () => ({ status: 'ok' }));

  return { app, config };
}
