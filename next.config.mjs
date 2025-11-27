/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  },
  async rewrites() {
    return [
      { source: '/@vite/client', destination: '/api/vite-client' }
    ]
  }
}

export default nextConfig
