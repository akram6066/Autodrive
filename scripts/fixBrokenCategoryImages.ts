// scripts/fixBrokenCategoryImages.ts
import * as dotenv from "dotenv";
import mongoose from "mongoose";

// ✅ load env
dotenv.config({ path: ".env" });

// ✅ simple Category model (isolated, no Next.js types)
const CategorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  image: String,
});

const Category =
  mongoose.models.Category || mongoose.model("Category", CategorySchema);

// ✅ script runner
async function main(dryRun: boolean) {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("✅ Connected to MongoDB");

  const brokenCategories = await Category.find({
    image: /ik\.imagekit\.io/,
  });

  if (!brokenCategories.length) {
    console.log("🎉 No broken category images found.");
    return;
  }

  console.log(`Found ${brokenCategories.length} categories with broken images:`);

  for (const cat of brokenCategories) {
    const fixedUrl = cat.image.replace("ik.imagekit.io/syk5c8kkg/", "ik.imagekit.io/syk5c8kkg/categories/");

    console.log(`- ${cat.slug}: ${cat.image} → ${fixedUrl}`);

    if (!dryRun) {
      cat.image = fixedUrl;
      await cat.save();
    }
  }

  if (dryRun) {
    console.log("💡 Dry run mode — no changes saved.");
  } else {
    console.log("✅ Broken category images fixed and saved.");
  }

  await mongoose.disconnect();
}

// ✅ detect --dry-run
const dryRun = process.argv.includes("--dry-run");
main(dryRun).catch((err) => {
  console.error("❌ Script failed:", err);
  process.exit(1);
});
