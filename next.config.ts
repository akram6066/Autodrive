/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",  // ✅ Increase upload limit
    },
  },
  images: {
    
     domains: ["lh3.googleusercontent.com"], // ✅ allow Google avatars
  },
};

module.exports = nextConfig;
