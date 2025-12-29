const nextConfig = {
  reactStrictMode: false, // Disable for react-beautiful-dnd compatibility
  async rewrites() {
    return [
      {
        source: "/socket.io/:path*",
        destination: "/api/socket",
      },
      // Add other rewrite rules as needed
    ];
  },
  // Ensure compatibility with Edge Runtime
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "*.vercel.app"],
    },
  },
  // Optimize images
  images: {
    domains: ["localhost"],
    formats: ["image/avif", "image/webp"],
  },
  // Webpack configuration for Clerk compatibility
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error on build --> Error: Can't resolve 'fs'
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
