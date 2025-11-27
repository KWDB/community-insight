/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: '/community-insight',
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  }
}

export default nextConfig
