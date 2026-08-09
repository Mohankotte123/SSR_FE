/** @type {import('next').NextConfig} */
const backend = (
  process.env.NEXT_PUBLIC_API_URL || "https://ssr-be.onrender.com"
).replace(/\/$/, "");

const nextConfig = {
  async rewrites() {
    // Browser calls /api/* on the FE origin; Next proxies to the backend.
    // Avoids cross-origin CORS failures (especially with credentials).
    return [
      {
        source: "/api/:path*",
        destination: `${backend}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
