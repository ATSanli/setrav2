/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.setraofficial.com' }],
        destination: 'https://setraofficial.com/:path*',
        permanent: true,
      },
      { source: '/favorites', destination: '/favoriler', permanent: true },
      { source: '/hesabim/favorilerim', destination: '/favoriler', permanent: true }
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}



export default nextConfig

