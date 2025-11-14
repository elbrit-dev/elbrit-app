/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Production optimizations
  compress: true,
  generateEtags: true,
  httpAgentOptions: {
    keepAlive: true,
  },
  
  // Optimize output
  output: 'standalone',
  
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
  
  // Performance optimizations
  swcMinify: true,
  poweredByHeader: false,

  // Reduce client bundle size by stripping console.* in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  experimental: {
    // Enable package import optimization for icon library
    optimizePackageImports: ['lucide-react']
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Production client-side optimizations
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Framework chunk for React/Next.js core
            framework: {
              chunks: 'all',
              name: 'framework',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            // Library chunk for other npm packages
            lib: {
              test(module) {
                return module.size() > 160000 && /node_modules[/\\]/.test(module.identifier());
              },
              name: 'lib',
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            // Commons chunk for shared code
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20,
              reuseExistingChunk: true,
            },
          },
        },
        runtimeChunk: 'single',
      };
    }

    // Prefer smaller ESM builds when available
    config.resolve.conditionNames = [
      'import',
      'module',
      'browser',
      'default'
    ];

    return config;
  },
  
  async headers() {
    return [
      // PWA manifest and service worker
      {
        source: '/manifest.webmanifest',
        headers: [
          { key: 'Content-Type', value: 'application/manifest+json' },
          { key: 'Cache-Control', value: 'public, max-age=86400' },
          { key: 'Access-Control-Allow-Origin', value: 'https://app.elbrit.org' }
        ]
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript' },
          { key: 'Service-Worker-Allowed', value: '/' },
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Access-Control-Allow-Origin', value: 'https://app.elbrit.org' }
        ]
      },
      // Static assets caching
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      },
      {
        source: '/_next/image',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      },
      {
        source: '/fonts/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'Access-Control-Allow-Origin', value: '*' }
        ]
      },
      {
        source: '/img',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      },
      // Loading GIF for PWA
      {
        source: '/elbrit one logo.gif',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'Access-Control-Allow-Origin', value: '*' }
        ]
      },
      // API routes caching
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=10, stale-while-revalidate=59' }
        ]
      },
      // General page caching
      {
        source: '/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=10, stale-while-revalidate=59' }
        ]
      }
    ];
  },
  
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
