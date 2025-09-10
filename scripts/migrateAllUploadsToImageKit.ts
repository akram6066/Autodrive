import mongoose, { Model, Document } from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import ImageKit from "imagekit";
import Product, { IProduct } from "../models/ProductType";
import Category, { ICategory } from "../models/Category"; // adjust if needed

// Load env
dotenv.config({ path: ".env.local" });

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("MongoDB URI not defined!");

// ✅ Make function generic & type-safe
async function migrateCollection<T extends Document & { image?: string }>(
  Model: Model<T>,
  collectionName: string
): Promise<void> {
  const docs = await Model.find({});

  for (const doc of docs) {
    if (doc.image && doc.image.startsWith("/uploads/")) {
      const localPath = path.join(process.cwd(), "public", doc.image);

      if (!fs.existsSync(localPath)) {
        console.warn(`⚠️ File not found: ${localPath}, skipping...`);
        continue;
      }

      try {
        const buffer = fs.readFileSync(localPath);
        const base64 = buffer.toString("base64");

        const uploadRes = await imagekit.upload({
          file: base64,
          fileName: path.basename(doc.image),
          folder: `/${collectionName.toLowerCase()}`,
        });

        doc.image = uploadRes.url;
        await doc.save();

        console.log(`✅ Migrated ${collectionName} ${doc._id} -> ${uploadRes.url}`);
      } catch (err) {
        console.error(`❌ Failed for ${collectionName} ${doc._id}`, err);
      }
    }
  }
}

async function main() {
  await mongoose.connect(MONGODB_URI);

  console.log("🚀 Starting migration...");

  await migrateCollection<IProduct>(Product, "Products");
  await migrateCollection<ICategory>(Category, "Categories");

  console.log("🎉 Migration finished!");

  process.exit(0);
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
