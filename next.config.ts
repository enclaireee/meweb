import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * The site collapsed from three routes to one page in v3. These two were
   * real routes and may be indexed, so they keep working and pass their link
   * equity to the section that replaced them. /work/<slug> is untouched — the
   * case studies are still real pages.
   */
  async redirects() {
    return [
      { source: "/work", destination: "/#work", permanent: true },
      { source: "/about", destination: "/#about", permanent: true },
    ];
  },
};

export default nextConfig;
