# @urule/runtime-broker

Sandbox session allocation broker for managing isolated execution environments.

Part of the [Urule](https://github.com/urule-ai/urule) ecosystem — the open-source coordination layer for AI agents.

## Features

- **Provider-based architecture** -- pluggable runtime providers with a common `RuntimeProvider` interface
- **Session management** -- allocate, query, and terminate sandbox sessions per workspace
- **Task execution** -- run commands inside allocated sessions with environment variables, timeouts, and working directories
- **Capability discovery** -- each provider declares its capabilities (GPU, browser, network, concurrency)
- **Mock provider** included for development and testing
- Fastify REST API with health check

## Quick Start

```bash
npm install
npm run build
npm start
```

Or for development with hot reload:

```bash
npm run dev
```

The server starts on port `4500` by default.

### Allocate a session

```bash
curl -X POST http://localhost:4500/api/v1/sessions \
  -H 'Content-Type: application/json' \
  -d '{
    "workspaceId": "ws-1",
    "runtimeProfile": "node-20",
    "provider": "mock"
  }'
```

### Check session status

```bash
curl http://localhost:4500/api/v1/sessions/SESSION_ID/status
```

### Terminate a session

```bash
curl -X DELETE http://localhost:4500/api/v1/sessions/SESSION_ID
```

### List available runtimes

```bash
curl http://localhost:4500/api/v1/runtimes
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/sessions` | Allocate a new sandbox session |
| `GET` | `/api/v1/sessions/:sessionId/status` | Get session status |
| `DELETE` | `/api/v1/sessions/:sessionId` | Terminate a session |
| `GET` | `/api/v1/runtimes` | List available runtime providers and their capabilities |
| `GET` | `/healthz` | Health check |

## How to Implement a Runtime Provider

Implement the `RuntimeProvider` interface and register it with the `SessionManager`:

```ts
import type { RuntimeProvider, SessionConfig, Session, Task, TaskResult, RuntimeCapabilities } from '@urule/runtime-broker';

export class DockerProvider implements RuntimeProvider {
  readonly name = 'docker';

  async createSession(config: SessionConfig): Promise<Session> {
    // Spin up a Docker container for the workspace
  }

  async destroySession(sessionId: string): Promise<void> {
    // Stop and remove the container
  }

  async executeTask(sessionId: string, task: Task): Promise<TaskResult> {
    // Run a command inside the container
  }

  getCapabilities(): RuntimeCapabilities {
    return {
      hasGpu: false,
      hasBrowser: true,
      hasNetwork: true,
      maxConcurrentTasks: 8,
    };
  }
}
```

Then register it in `server.ts`:

```ts
sessionManager.registerProvider(new DockerProvider());
```

### Key Types

| Type | Description |
|---|---|
| `RuntimeProvider` | Interface: `createSession`, `destroySession`, `executeTask`, `getCapabilities` |
| `SessionConfig` | `{ workspaceId, runtimeProfile, env? }` |
| `Session` | `{ sessionId, status, createdAt }` |
| `Task` | `{ command, env?, timeout?, workdir? }` |
| `TaskResult` | `{ exitCode, stdout, stderr }` |
| `RuntimeCapabilities` | `{ hasGpu, hasBrowser, hasNetwork, maxConcurrentTasks }` |

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `4500` | Server port |
| `NATS_URL` | `nats://localhost:4222` | NATS server URL |
| `REGISTRY_URL` | `http://localhost:4400` | Urule registry service URL |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.

## License

Apache-2.0
