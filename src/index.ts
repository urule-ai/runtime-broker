import { buildServer } from './server.js';

const { app, config } = buildServer();

app.listen({ port: config.port, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`urule-runtime-broker listening on ${address}`);
});
