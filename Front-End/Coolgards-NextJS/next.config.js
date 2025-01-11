/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['localhost']
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BASE_URL}/:path*`
      }
    ]
  }
}

module.exports = nextConfig
