export interface SessionConfig {
  workspaceId: string;
  runtimeProfile: string;
  env?: Record<string, string>;
}

export interface Session {
  sessionId: string;
  status: string;
  createdAt: string;
}

export interface Task {
  command: string;
  env?: Record<string, string>;
  timeout?: number;
  workdir?: string;
}

export interface TaskResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export interface RuntimeCapabilities {
  hasGpu: boolean;
  hasBrowser: boolean;
  hasNetwork: boolean;
  maxConcurrentTasks: number;
}

export interface RuntimeProvider {
  name: string;
  createSession(config: SessionConfig): Promise<Session>;
  destroySession(sessionId: string): Promise<void>;
  executeTask(sessionId: string, task: Task): Promise<TaskResult>;
  getCapabilities(): RuntimeCapabilities;
}
