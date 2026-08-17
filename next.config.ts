import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      { protocol: "https", hostname: "plus.unsplash.com", pathname: "/**" },
      {
        protocol: "https",
        hostname: "impartial-rabbit-961.convex.cloud",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname:
          "hallomadabucket.0d4906dac03a764c5a074b5f240d5d02.r2.cloudflarestorage.com",
        pathname: "/**",
      },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    ],
  },
};

export default withNextIntl(nextConfig);
