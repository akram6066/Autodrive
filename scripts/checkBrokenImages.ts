import mongoose, { Document, Model } from "mongoose";
import dotenv from "dotenv";
import Product, { IProductDoc } from "../models/ProductType";
import Category, { ICategoryDoc } from "../models/Category";

// Load environment variables
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("MongoDB URI not defined!");

// Generic check function with proper typing
async function checkCollection<T extends Document>(
  Model: Model<T>,
  collectionName: string
): Promise<void> {
  const docs = await Model.find({});
  console.log(`\n🔎 Checking ${collectionName}...`);

  for (const doc of docs) {
    const image = (doc as any).image as string | undefined; // fallback if schema allows optional

    if (!image || typeof image !== "string") {
      console.warn(`⚠️ ${collectionName} ${doc._id} has no image field`);
      continue;
    }

    // ✅ Valid ImageKit URL should start with https://ik.imagekit.io/
    if (!image.startsWith("https://ik.imagekit.io/")) {
      console.error(`❌ Broken image in ${collectionName} ${doc._id}: ${image}`);
    }
  }
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("🚀 Connected to MongoDB");

  await checkCollection<IProductDoc>(Product, "Products");
  await checkCollection<ICategoryDoc>(Category, "Categories");

  console.log("\n✅ Check finished!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error running script:", err);
  process.exit(1);
});
