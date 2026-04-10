import { env } from "./config/env";
import { connectDB } from "./config/database";
import app from "./app";
import { logger } from "./shared/utils/logger";

const start = async () => {
  await connectDB();
  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
};

start();
