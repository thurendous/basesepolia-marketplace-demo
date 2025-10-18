/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["pino-pretty"],
  output: "standalone",
};

export default nextConfig;
