// initOtel must run BEFORE Fastify is loaded so auto-instrumentation can hook
// it at module-load time. Static imports are hoisted; we keep only the OTel
// helper imported statically here and dynamically import everything else.
import { initOtel } from '@urule/observability';

const otelSdk = initOtel('runtime-broker');

const { loadConfig, validateConfig } = await import('./config.js');
const { buildServer } = await import('./server.js');

const preConfig = loadConfig();
validateConfig(preConfig);
const { app, config } = await buildServer();

app.listen({ port: config.port, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`urule-runtime-broker listening on ${address}`);
});

const shutdown = async () => {
  app.log.info('Shutting down...');
  await app.close();
  if (otelSdk) await otelSdk.shutdown();
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
