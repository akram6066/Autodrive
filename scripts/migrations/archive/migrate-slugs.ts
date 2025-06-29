import mongoose from "mongoose";
import slugify from "slugify";
import dbConnectScript from "@/lib/dbConnectScript";  // ✅ Correct import

import Category from "@/models/Category";
import Product from "@/models/Product";

async function migrateCategorySlugs() {
  const categories = await Category.find({ slug: { $exists: false } });
  console.log(`Found ${categories.length} categories without slug.`);

  for (const category of categories) {
    const generatedSlug = slugify(category.name, { lower: true, strict: true });

    const duplicate = await Category.findOne({ slug: generatedSlug });
    if (duplicate) {
      console.log(`❌ Duplicate category slug for: ${category.name}`);
      continue;
    }

    category.slug = generatedSlug;
    await category.save();
    console.log(`✅ Updated category: ${category.name} → slug: ${generatedSlug}`);
  }
}

async function migrateProductSlugs() {
  const products = await Product.find({ slug: { $exists: false } });
  console.log(`Found ${products.length} products without slug.`);

  for (const product of products) {
    const generatedSlug = slugify(product.name, { lower: true, strict: true });

    const duplicate = await Product.findOne({ slug: generatedSlug });
    if (duplicate) {
      console.log(`❌ Duplicate product slug for: ${product.name}`);
      continue;
    }

    product.slug = generatedSlug;
    await product.save();
    console.log(`✅ Updated product: ${product.name} → slug: ${generatedSlug}`);
  }
}

async function migrateSlugs() {
  await dbConnectScript();  // ✅ Use correct dbConnectScript here

  await migrateCategorySlugs();
  await migrateProductSlugs();

  console.log("✅ Slug migration complete.");
  mongoose.disconnect();
}

migrateSlugs().catch(err => {
  console.error("Migration failed:", err);
  mongoose.disconnect();
});
