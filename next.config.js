/** @type {import('next').NextConfig} */
const nextConfig = {
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

module.exports = nextConfig;
