import { ulid } from 'ulid';
import type {
  RuntimeProvider,
  SessionConfig,
  Session,
  Task,
  TaskResult,
  RuntimeCapabilities,
} from './runtime-provider.js';

export class MockProvider implements RuntimeProvider {
  public readonly name = 'mock';
  private sessions = new Map<string, Session>();

  async createSession(config: SessionConfig): Promise<Session> {
    const session: Session = {
      sessionId: ulid(),
      status: 'running',
      createdAt: new Date().toISOString(),
    };
    this.sessions.set(session.sessionId, session);
    return session;
  }

  async destroySession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    this.sessions.delete(sessionId);
  }

  async executeTask(sessionId: string, task: Task): Promise<TaskResult> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    return {
      exitCode: 0,
      stdout: `mock output for: ${task.command}`,
      stderr: '',
    };
  }

  getCapabilities(): RuntimeCapabilities {
    return {
      hasGpu: false,
      hasBrowser: false,
      hasNetwork: true,
      maxConcurrentTasks: 4,
    };
  }
}
