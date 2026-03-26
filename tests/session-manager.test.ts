import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../src/services/session-manager.js';
import { MockProvider } from '../src/providers/mock-provider.js';

describe('SessionManager', () => {
  let manager: SessionManager;

  beforeEach(() => {
    manager = new SessionManager();
    manager.registerProvider(new MockProvider());
  });

  it('should allocate a session, check status, then terminate', async () => {
    // Allocate
    const session = await manager.allocateSession('mock', {
      workspaceId: 'ws-001',
      runtimeProfile: 'default',
    });

    expect(session.sessionId).toBeDefined();
    expect(session.status).toBe('running');
    expect(session.createdAt).toBeDefined();

    // Status
    const status = manager.getSessionStatus(session.sessionId);
    expect(status).toBeDefined();
    expect(status!.sessionId).toBe(session.sessionId);
    expect(status!.status).toBe('running');

    // Terminate
    await manager.terminateSession(session.sessionId);

    // Verify terminated
    const afterTerminate = manager.getSessionStatus(session.sessionId);
    expect(afterTerminate).toBeUndefined();
  });

  it('should throw when allocating with unknown provider', async () => {
    await expect(
      manager.allocateSession('nonexistent', {
        workspaceId: 'ws-001',
        runtimeProfile: 'default',
      }),
    ).rejects.toThrow('Unknown provider: nonexistent');
  });

  it('should throw when terminating a non-existent session', async () => {
    await expect(manager.terminateSession('no-such-id')).rejects.toThrow(
      'Session not found: no-such-id',
    );
  });

  it('should list registered providers', () => {
    const providers = manager.listProviders();
    expect(providers).toHaveLength(1);
    expect(providers[0].name).toBe('mock');
    expect(providers[0].capabilities.maxConcurrentTasks).toBe(4);
  });

  it('should execute a task on an active session', async () => {
    const session = await manager.allocateSession('mock', {
      workspaceId: 'ws-002',
      runtimeProfile: 'default',
    });

    const result = await manager.executeTask(session.sessionId, {
      command: 'echo hello',
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('echo hello');
    expect(result.stderr).toBe('');
  });
});
