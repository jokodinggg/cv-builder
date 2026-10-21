import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
  // @sparticuz/chromium reads its compressed Chromium from bin/ at runtime; tracing cannot see that.
  outputFileTracingIncludes: {
    "/api/cv/**": ["./node_modules/@sparticuz/chromium/bin/**"],
  },
};

export default nextConfig;
