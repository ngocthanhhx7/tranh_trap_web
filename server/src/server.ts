import "dotenv/config";
import { app } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { ensureCatalog } from "./services/catalog.js";

async function startServer(): Promise<void> {
  await connectDatabase();
  await ensureCatalog();
  const server = app.listen(env.PORT, () => {
    console.info(`API listening at http://localhost:${env.PORT}`);
  });

  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `Port ${env.PORT} is already in use. Stop the existing server or set another PORT in server/.env.`,
      );
    } else {
      console.error("HTTP server error:", error);
    }
    void disconnectDatabase().finally(() => process.exit(1));
  });

  const shutdown = (signal: NodeJS.Signals) => {
    console.info(`${signal} received; shutting down`);
    server.close(() => {
      void disconnectDatabase().finally(() => process.exit(0));
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

startServer().catch((error: unknown) => {
  console.error("Unable to start server:", error);
  process.exit(1);
});
