import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  // Disable image optimization for self-hosted (we serve raw images)
  images: {
    unoptimized: true,
  },

  // Exclude media volume from output file tracing (avoids broad pattern warnings)
  outputFileTracingExcludes: {
    '/api/media/[...path]': ['./**/*'],
  },

  // Experimental features
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
