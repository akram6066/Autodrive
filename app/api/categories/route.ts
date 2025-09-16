// scripts/fixBrokenCategoryImages.ts
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";

async function fixBrokenCategoryImages() {
  await dbConnect();

  // Find all categories where the image has "categories/categories"
  const brokenCategories = await Category.find({ image: /categories\/categories/ });

  if (brokenCategories.length === 0) {
    console.log("🎉 No broken category images found!");
    process.exit(0);
  }

  for (const category of brokenCategories) {
    const oldUrl = category.image;
    const newUrl = oldUrl.replace("categories/categories", "categories");

    category.image = newUrl;
    await category.save();

    console.log(`✅ Fixed ${category.slug}: ${oldUrl} → ${newUrl}`);
  }

  console.log("🚀 Broken category images fixed and saved.");
  process.exit(0);
}

fixBrokenCategoryImages().catch((err) => {
  console.error("❌ Fix script failed:", err);
  process.exit(1);
});
