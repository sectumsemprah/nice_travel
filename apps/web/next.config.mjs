/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@nice-travel/shared', '@nice-travel/domain', '@nice-travel/providers'],
};

export default nextConfig;

