import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["images.ticketmaster.com", "res.cloudinary.com", "s1.ticketm.net"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
