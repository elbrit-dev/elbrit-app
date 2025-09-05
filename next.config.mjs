/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // PERFORMANCE OPTIMIZATIONS
  // Enable compression
  compress: true,
  
  // PERFORMANCE: Enable experimental features for better performance
  poweredByHeader: false,
  
  // PERFORMANCE: Optimize bundle size
  generateEtags: true,
  
  // Note: largePageDataBytes is only available in Next.js 15+
  // For Next.js 14, the 128kB threshold is built-in and cannot be configured
  
  // PERFORMANCE: Enable SWC minification for faster builds
  swcMinify: true,
  
  // PERFORMANCE: Enable static optimization
  trailingSlash: false,
  
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Enable experimental features for better performance
  experimental: {
    // optimizeCss: true, // Disabled - requires critters package
    optimizePackageImports: ['@plasmicapp/loader-nextjs', 'primereact'],
    // ppr: true, // Disabled - requires Next.js canary
    // PERFORMANCE: Enable modern bundling
    esmExternals: true,
    // PERFORMANCE: Enable faster builds
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimize bundle splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          plasmic: {
            test: /[\\/]node_modules[\\/]@plasmicapp[\\/]/,
            name: 'plasmic',
            chunks: 'all',
            priority: 20,
          },
          prime: {
            test: /[\\/]node_modules[\\/]primereact[\\/]/,
            name: 'prime',
            chunks: 'all',
            priority: 15,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
        },
      };
    }
    return config;
  },
  
  // Add headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          // Allow iframe embedding for all domains to prevent site crashes
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          // Content Security Policy for iframe embedding - allow all
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *; frame-src *;",
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=60',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      // PERFORMANCE: Add compression headers
      {
        source: '/api/erpnext/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, max-age=300, s-maxage=60',
          },
          {
            key: 'Content-Encoding',
            value: 'gzip',
          },
        ],
      },
      {
        source: '/api/plasmic-cms/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, max-age=120, s-maxage=60',
          },
          {
            key: 'Content-Encoding',
            value: 'gzip',
          },
        ],
      },
      // Special headers for Plasmic host page to allow iframe embedding
      {
        source: '/plasmic-host',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *; frame-src *;",
          },
        ],
      },
      // Allow iframe embedding for all catchall routes (Plasmic pages) - allow all to prevent crashes
      {
        source: '/((?!api|_next|favicon.ico).*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *; frame-src *;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
