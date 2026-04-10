import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../shared/utils/logger";

export const connectDB = async (): Promise<void> => {
  try {
    // Extra options required for Azure Cosmos DB for MongoDB API:
    // - tls/ssl is enforced by Cosmos DB; the driver must honour the URI param
    // - directConnection:false lets the driver use the SRV/host list properly
    // - serverSelectionTimeoutMS raised so cold-start doesn't time out too fast
    await mongoose.connect(env.MONGODB_URI, {
      tls: true,
      directConnection: false,
      serverSelectionTimeoutMS: 10000,
    });
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error("MongoDB connection error:", err);
    process.exit(1);
  }
};
