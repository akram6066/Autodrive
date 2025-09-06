// scripts/migrateUploadsToImageKit.ts
import dbConnectScript from "@/lib/dbConnectScript";  // use script-safe version
import ImageKit from "imagekit";
import fs from "fs";
import path from "path";
import Product from "../models/ProductType"; // adjust if you have different models

async function migrate() {
  await dbConnectScript(); // ✅ connect safely

  const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
  });

  const uploadsDir = path.join(process.cwd(), "public", "uploads");

  const products = await Product.find({ "images.0": { $exists: true } });

  for (const product of products) {
    const newImages: string[] = [];

    for (const img of product.images) {
      if (img.startsWith("http")) {
        newImages.push(img); // already hosted
        continue;
      }

      const filePath = path.join(uploadsDir, img);
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ Skipping missing file: ${filePath}`);
        continue;
      }

      try {
        const uploaded = await imagekit.upload({
          file: fs.readFileSync(filePath),
          fileName: path.basename(img),
          folder: "/autodrive",
        });

        newImages.push(uploaded.url);
        console.log(`✅ Uploaded ${img} → ${uploaded.url}`);
      } catch (err) {
        console.error(`❌ Failed to upload ${img}`, err);
      }
    }

    product.images = newImages;
    await product.save();
    console.log(`📦 Updated product ${product._id}`);
  }

  console.log("🎉 Migration finished!");
  process.exit(0);
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
