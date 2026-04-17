import mongoose from "mongoose";
import { logger } from "./logger";

let connected = false;

export async function connectDB(): Promise<void> {
  if (connected) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }
  await mongoose.connect(uri);
  connected = true;
  logger.info("Connected to MongoDB");
}
