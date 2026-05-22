import type { NextConfig } from "next";

// Vercel's preview-comments adapter currently expects a projectDir value that
// Next 16.2.x does not pass to modifyConfig during production builds.
if (process.env.VERCEL) {
  process.env.VERCEL_PREVIEW_COMMENTS_ENABLED = "0";
}

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
