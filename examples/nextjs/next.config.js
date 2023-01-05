/** @type {import('next').NextConfig} */
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    transpilePackages: ['@visheratin/web-ai'],
  },
  webpack: (config, { }) => {
    config.resolve.fallback = { 
      fs: false,
    };
    config.plugins.push(
      new NodePolyfillPlugin(),
    );
    return config;
  },
}

module.exports = nextConfig
