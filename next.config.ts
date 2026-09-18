import type { NextConfig } from "next";

// Phase 19.2: baseline security headers for every response.
// Kept minimal and standard; no CSP yet (next/font + inline styles would
// need a nonce setup — deferred deliberately).
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  // Basic permissions policy: deny powerful browser features the app
  // never uses.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
