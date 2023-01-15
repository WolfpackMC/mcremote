/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  publicRuntimeConfig: {
    READ_ACCESS_KEY: process.env.READ_ACCESS_KEY,
    READ_SECRET_KEY: process.env.READ_SECRET_KEY,
  },
  images: {
    domains: ["avatars.githubusercontent.com", "db17gxef1g90a.cloudfront.net"],
  }
}

module.exports = nextConfig
