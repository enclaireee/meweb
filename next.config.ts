import type { NextConfig } from "next";

// The poster and grain files keep their names when the scripts regenerate them, so they can't be
// `immutable`: a day fresh, then revalidated in the background for a week.
const longCache = [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }];

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: { formats: ["image/avif", "image/webp"] },
  async headers() {
    return [
      { source: "/textures/:path*", headers: longCache },
      { source: "/poster/:path*", headers: longCache },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "accelerometer=(self), gyroscope=(self), camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
