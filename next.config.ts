import type { NextConfig } from 'next'

const isGitHubPages = process.env.GITHUB_PAGES === 'true'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_SITE_BASE_PATH: isGitHubPages ? '/WhisMap' : '',
  },
  ...(isGitHubPages
    ? {
        basePath: '/WhisMap',
        assetPrefix: '/WhisMap/',
      }
    : {}),
}

export default nextConfig
