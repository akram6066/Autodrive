import mongoose from "mongoose";
import dotenv from "dotenv";


dotenv.config({ path: ".env.local" });

import dbConnectScript from "@/lib/dbConnectScript";
import Category from "@/models/Category";
import Product from "@/models/Product";

async function scanCategories() {
  console.log("🔎 Scanning Categories...");

  const categories = await Category.find().lean();

  const missingSlugs = categories.filter(c => !c.slug);
  const slugSet = new Set<string>();
  const duplicateSlugs: string[] = [];

  for (const cat of categories) {
    if (cat.slug) {
      if (slugSet.has(cat.slug)) {
        duplicateSlugs.push(cat.slug);
      } else {
        slugSet.add(cat.slug);
      }
    }
  }

  console.log(`- Categories total: ${categories.length}`);
  console.log(`- Missing slugs: ${missingSlugs.length}`);
  if (missingSlugs.length > 0) {
    missingSlugs.forEach(c => console.log(`  ❌ Missing slug: ${c.name} (${c._id})`));
  }

  console.log(`- Duplicate slugs: ${duplicateSlugs.length}`);
  if (duplicateSlugs.length > 0) {
    duplicateSlugs.forEach(slug => console.log(`  ❌ Duplicate slug: ${slug}`));
  }
}

async function scanProducts() {
  console.log("🔎 Scanning Products...");

  const products = await Product.find().lean();

  const missingSlugs = products.filter(p => !p.slug);
  const slugSet = new Set<string>();
  const duplicateSlugs: string[] = [];
  const invalidCategories: string[] = [];

  for (const prod of products) {
    if (prod.slug) {
      if (slugSet.has(prod.slug)) {
        duplicateSlugs.push(prod.slug);
      } else {
        slugSet.add(prod.slug);
      }
    }

    // Check if category reference valid ObjectId
    if (!mongoose.isValidObjectId(prod.category)) {
      invalidCategories.push(prod.name);
    }
  }

  console.log(`- Products total: ${products.length}`);
  console.log(`- Missing slugs: ${missingSlugs.length}`);
  if (missingSlugs.length > 0) {
    missingSlugs.forEach(p => console.log(`  ❌ Missing slug: ${p.name} (${p._id})`));
  }

  console.log(`- Duplicate slugs: ${duplicateSlugs.length}`);
  if (duplicateSlugs.length > 0) {
    duplicateSlugs.forEach(slug => console.log(`  ❌ Duplicate slug: ${slug}`));
  }

  console.log(`- Products with invalid category reference: ${invalidCategories.length}`);
  if (invalidCategories.length > 0) {
    invalidCategories.forEach(name => console.log(`  ❌ Invalid category: ${name}`));
  }
}

async function runScanner() {
  await dbConnectScript();

  await scanCategories();
  await scanProducts();

  console.log("✅ Admin Scan Complete ✅");
  mongoose.disconnect();
}

runScanner().catch(err => {
  console.error("Scanner failed:", err);
  mongoose.disconnect();
});
