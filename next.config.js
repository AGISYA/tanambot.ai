/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  async rewrites() {
    return [
      {
        source: '/api/qr',
        destination: 'https://n8n.tanam.io/webhook/tanam.io/bot/QR'
      }
    ]
  }
};

module.exports = nextConfig;