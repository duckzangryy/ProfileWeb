/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  compress: true,

  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
  },

  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "date-fns",
    ],
  },
}

export default nextConfig
