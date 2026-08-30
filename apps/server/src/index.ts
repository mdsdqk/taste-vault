import { loadConfig } from "./config.js";
import { buildServer } from "./server.js";

const config = loadConfig();
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
