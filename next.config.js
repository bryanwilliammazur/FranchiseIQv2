/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazonaws.com' },
    ],
  },
}

module.exports = nextConfig

// maxDuration is set per-route via export const maxDuration = N
// in each route file — already done in cron, sync, and ai/chat routes
