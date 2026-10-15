import type { NextConfig } from 'next';
const config: NextConfig = { distDir: process.env.WP_BUILD_DIR || '.next', images: { remotePatterns: [{ protocol: 'https', hostname: 'ddragon.leagueoflegends.com' }] } };
export default config;
