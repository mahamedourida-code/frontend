import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable client-side router cache to prevent stuck loading states
  // This is the KEY fix for page refresh issues during processing
  experimental: {
    staleTimes: {
      // Set to 0 to completely disable client-side caching for dynamic pages
      // This prevents the router from caching page state across refreshes
      dynamic: 0,
      // Keep static pages cached for 5 minutes (default behavior)
      static: 300,
    },
  },
};

export default nextConfig;
