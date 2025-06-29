import mongoose from "mongoose";
import dotenv from "dotenv";

// ✅ Load your env.local file for standalone
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("MongoDB URI not defined!");
}

export default async function dbConnectScript() {
  if (mongoose.connection.readyState >= 1) return;

  await mongoose.connect(MONGODB_URI);
}
