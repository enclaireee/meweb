import { ImageResponse } from "next/og";
import { getProjects } from "@/lib/content";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ground = "#141211";
const ink = "#F2EDE6";
const muted = "#A29A90";
const accent = "#FF5C33";

export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProjects().find((x) => x.slug === slug);
  if (!p)
    return new ImageResponse(
      <div style={{ background: ground, width: "100%", height: "100%" }} />,
      size,
    );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: 28,
          background: ground,
          color: ink,
          padding: 80,
        }}
      >
        <span style={{ fontSize: 76, lineHeight: 1.05 }}>{p.title}</span>
        <span style={{ fontSize: 32, color: muted, lineHeight: 1.4, maxWidth: 900 }}>
          {p.summary}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 26, color: muted }}>
          <span style={{ width: 40, height: 3, background: accent }} />
          <span>{p.domain}, {p.period}</span>
        </div>
      </div>
    ),
    size,
  );
}
