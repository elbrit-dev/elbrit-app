/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Speed up image responses by skipping Next.js optimizer and using remote CDNs directly
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'img.plasmic.app' },
      { protocol: 'https', hostname: 'img.plasmiccdn.com' },
      { protocol: 'https', hostname: 'images.plasmic.app' },
    ],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    formats: ['image/avif', 'image/webp']
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/_next/image',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, s-maxage=31536000, stale-while-revalidate=600' }
        ]
      },
      {
        source: '/img',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, s-maxage=31536000, stale-while-revalidate=600' }
        ]
      }
    ];
  }
  ,
  async redirects() {
    return [
      {
        source: '/img',
        destination: 'https://img.plasmic.app',
        permanent: false
      }
    ];
  }
};

export default nextConfig;
