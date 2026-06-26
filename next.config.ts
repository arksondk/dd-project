import type { NextConfig } from 'next'

const isProduction = process.env.NODE_ENV === 'production'
const REPO_PREFIX = '/multi-twitch-stream'

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // Setting up GitHub Pages
  output: 'export',
  basePath: isProduction ? REPO_PREFIX : '',
  assetPrefix: isProduction ? `${REPO_PREFIX}/` : '',
  images: {
    unoptimized: true,
  },
}

export default nextConfig
