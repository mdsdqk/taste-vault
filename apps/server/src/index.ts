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
  const code =
    err && typeof err === "object" && "code" in err
      ? String((err as { code: unknown }).code)
      : "";
  if (code === "EADDRINUSE") {
    console.error(
      `Port ${config.port} is already in use — another TasteVault server is probably still running. Stop it and try again, or set PORT= to pick a free one.`,
    );
  } else {
    app.log.error(err);
  }
  process.exit(1);
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    app.log.info(`${signal} received — shutting down`);
    void app.close().then(() => process.exit(0));
  });
}
