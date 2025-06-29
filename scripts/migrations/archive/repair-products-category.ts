import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import dbConnectScript from "@/lib/dbConnectScript";
import Category from "@/models/Category";
import Product from "@/models/Product";

async function repairProductCategories() {
  await dbConnectScript();

  const products = await Product.find({}).lean();

  for (const product of products) {
    if (typeof product.category === "string") {
      console.log(`Repairing product: ${product.name} (invalid category: ${product.category})`);

      // Try to find category by name or slug
      const category = await Category.findOne({
        $or: [{ name: product.category }, { slug: product.category }]
      });

      if (!category) {
        console.log(`❌ Cannot find category "${product.category}" for product: ${product.name}`);
        continue;
      }

      // Update product category to valid ObjectId
      await Product.findByIdAndUpdate(product._id, {
        category: category._id
      });

      console.log(`✅ Updated product: ${product.name} → category: ${category.name}`);
    }
  }

  console.log("✅ Product category repair complete.");
  mongoose.disconnect();
}

repairProductCategories().catch(err => {
  console.error("Repair failed:", err);
  mongoose.disconnect();
});
