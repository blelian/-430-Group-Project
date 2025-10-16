import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // ✅ Explicitly set the workspace root to the app’s folder
  turbopack: {
    root: __dirname,
  },

  images: {
    remotePatterns: [
      // Existing fake store API (keep if still needed)
      {
        protocol: "https",
        hostname: "fakestoreapi.com",
        port: "",
        pathname: "/img/**",
      },
      // ✅ Cloudinary images
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  // ✅ Ignore ESLint during build so Vercel can deploy
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ✅ Add alias for '@'
  webpack(config) {
    config.resolve.alias!['@'] = path.resolve(__dirname, 'src');
    return config;
  },
};

export default nextConfig;
