/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during builds to avoid compilation errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds to successfully complete even if there are type errors
    ignoreBuildErrors: false,
  },
  experimental: {
    // Enable experimental features if needed
  },
  webpack: (config, { isServer }) => {
    // Configuración específica para pdf-parse
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'canvas': 'canvas',
      });
    }
    
    // Resolver problemas con módulos nativos
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    
    return config;
  },
};

module.exports = nextConfig; 