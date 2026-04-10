import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../shared/utils/logger";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error("MongoDB connection error:", err);
    process.exit(1);
  }
};
