/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",  // ✅ Increase upload limit
    },
  },
  images: {
    domains: [],
  },
};

module.exports = nextConfig;
