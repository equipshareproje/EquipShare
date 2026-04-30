import { env } from "./config/env";
import { connectDB } from "./config/database";
import app from "./app";
import { logger } from "./shared/utils/logger";

const start = () => {
  // Bind the port FIRST so Container Apps health check passes immediately
  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  // Connect to MongoDB asynchronously — server stays up even if initial connection
  // takes a few seconds (Cosmos DB cold start can be slow)
  connectDB().catch((err) => {
    logger.error(
      "MongoDB initial connection failed, retrying via Mongoose...",
      err,
    );
    // Mongoose will keep retrying automatically via its built-in reconnect logic
  });
};

start();
