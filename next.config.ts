import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },

  images: {
    remotePatterns: [
      {
        // Supabase Storage — replace <project-ref> with your actual project ref
        // e.g. 'abcdefghijklmnop.supabase.co'
        // This is set via NEXT_PUBLIC_SUPABASE_URL in .env.local
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
