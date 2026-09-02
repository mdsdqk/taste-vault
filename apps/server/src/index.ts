import { loadConfig, isLoopbackHost } from "./config.js";
import { buildServer } from "./server.js";

const config = loadConfig();

if (!isLoopbackHost(config.host) && !config.allowRemote) {
  console.error(
    `Refusing to bind ${config.host}: the write API has no auth. Pass --allow-remote or set TASTEVAULT_ALLOW_REMOTE=1 if you really mean it.`,
  );
  process.exit(1);
}

const app = await buildServer(config);

try {
  await app.listen({ host: config.host, port: config.port });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    app.log.info(`${signal} received — shutting down`);
    void app.close().then(() => process.exit(0));
  });
}
