/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.worldofbooks.com',
      },
      {
        protocol: 'https',
        hostname: 'images.worldofbooks.com',
      },
      {
        protocol: 'https',
        hostname: 'images.worldofrarebooks.co.uk',
      },
      {
        protocol: 'https',
        hostname: 'ci.worldofbooks.com',
      },
      // --- NEW FIX BELOW ---
      {
        protocol: 'https',
        hostname: 'image-server.worldofbooks.com',
      },
    ],
  },
};

module.exports = nextConfig;