/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    // Strip console output from production builds, but keep console.error: a
    // server-side failure such as a missing PDF signature asset must stay
    // visible in the production logs instead of failing silently.
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'profitmart.in',
      },
    ],
  },
  // Old flat admin pages now live under /admin-dashboard/* sub-routes.
  // Redirect permanently so bookmarks/links keep working.
  async redirects() {
    return [
      {
        source: "/admin-analytics",
        destination: "/admin-dashboard/analytics",
        permanent: true,
      },
      {
        source: "/admin-payment-audit",
        destination: "/admin-dashboard/payments",
        permanent: true,
      },
      {
        source: "/admin-subscriptions",
        destination: "/admin-dashboard/subscriptions",
        permanent: true,
      },
      {
        source: "/admin-plans",
        destination: "/admin-dashboard/plans",
        permanent: true,
      },
      {
        source: "/admin-coupons",
        destination: "/admin-dashboard/coupons",
        permanent: true,
      },
      {
        source: "/admin-plan-details",
        destination: "/admin-dashboard/plans",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
