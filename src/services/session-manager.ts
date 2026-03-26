import type {
  RuntimeProvider,
  Session,
  SessionConfig,
  Task,
  TaskResult,
  RuntimeCapabilities,
} from '../providers/runtime-provider.js';

export class SessionManager {
  private activeSessions = new Map<string, { session: Session; providerName: string }>();
  private providers = new Map<string, RuntimeProvider>();

  registerProvider(provider: RuntimeProvider): void {
    this.providers.set(provider.name, provider);
  }

  getProvider(name: string): RuntimeProvider | undefined {
    return this.providers.get(name);
  }

  listProviders(): Array<{ name: string; capabilities: RuntimeCapabilities }> {
    return Array.from(this.providers.values()).map((p) => ({
      name: p.name,
      capabilities: p.getCapabilities(),
    }));
  }

  async allocateSession(
    providerName: string,
    config: SessionConfig,
  ): Promise<Session> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Unknown provider: ${providerName}`);
    }

    const session = await provider.createSession(config);
    this.activeSessions.set(session.sessionId, {
      session,
      providerName,
    });
    return session;
  }

  getSessionStatus(sessionId: string): Session | undefined {
    const entry = this.activeSessions.get(sessionId);
    return entry?.session;
  }

  async terminateSession(sessionId: string): Promise<void> {
    const entry = this.activeSessions.get(sessionId);
    if (!entry) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const provider = this.providers.get(entry.providerName);
    if (provider) {
      await provider.destroySession(sessionId);
    }
    this.activeSessions.delete(sessionId);
  }

  async executeTask(sessionId: string, task: Task): Promise<TaskResult> {
    const entry = this.activeSessions.get(sessionId);
    if (!entry) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const provider = this.providers.get(entry.providerName);
    if (!provider) {
      throw new Error(`Provider not found: ${entry.providerName}`);
    }

    return provider.executeTask(sessionId, task);
  }
}
