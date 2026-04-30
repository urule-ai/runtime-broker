export interface Config {
  port: number;
  natsUrl: string;
  registryUrl: string;
}

export function loadConfig(): Config {
  return {
    port: parseInt(process.env.PORT ?? '4500', 10),
    natsUrl: process.env.NATS_URL ?? 'nats://localhost:4222',
    registryUrl: process.env.REGISTRY_URL ?? 'http://localhost:4400',
  };
}

export function validateConfig(_config: Config): void {
  const missing: string[] = [];
  if (!process.env.NATS_URL) missing.push('NATS_URL');
  if (missing.length > 0) {
    throw new Error(`[urule-runtime-broker] Missing required env vars: ${missing.join(', ')}`);
  }
}
