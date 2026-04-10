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
      serverSelectionTimeoutMS: 30000,  // 30s — Cosmos DB cold start can be slow
    });
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error("MongoDB connection error:", err);
    // Do NOT exit — let Mongoose retry and let the HTTP server keep responding
    throw err;
  }
};
