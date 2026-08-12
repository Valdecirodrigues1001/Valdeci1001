import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pyicvtbmucvokijlkdnf.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/landing-pages/**",
      },
      {
        protocol: "https",
        hostname: "pyicvtbmucvokijlkdnf.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/campaign-media/**",
      },
    ],
  },
};

export default nextConfig;