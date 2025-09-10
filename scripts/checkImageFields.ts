// scripts/checkImageFields.ts
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI not found in .env file");
}

// Example: Adjust schemas if your field names differ
const productSchema = new mongoose.Schema({
  name: String,
  images: [String],
});

const categorySchema = new mongoose.Schema({
  name: String,
  image: String,
});

const Product = mongoose.model("Product", productSchema, "products");
const Category = mongoose.model("Category", categorySchema, "categories");

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  const products = await Product.find({ images: { $exists: true, $ne: [] } });
  const categories = await Category.find({ image: { $exists: true, $ne: "" } });

  console.log(`\n📦 Found ${products.length} products with images:`);
  products.forEach((p) => console.log(`- ${p._id}: ${p.images}`));

  console.log(`\n📂 Found ${categories.length} categories with images:`);
  categories.forEach((c) => console.log(`- ${c._id}: ${c.image}`));

  await mongoose.disconnect();
  console.log("\n✅ Done!");
}

run().catch((err) => {
  console.error("❌ Error:", err);
  mongoose.disconnect();
});
