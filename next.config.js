/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
},
};

module.exports = nextConfig;
