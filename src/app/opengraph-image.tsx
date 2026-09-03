import { ImageResponse } from "next/og";
import { profile } from "@content/meta/profile";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Fatih Zamzami — Electrical engineer";

/* Palette inlined by value — ImageResponse can't read CSS vars. */
const ground = "#141211";
const ink = "#F2EDE6";
const muted = "#A29A90";
const accent = "#FF5C33";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: ground,
          color: ink,
          padding: 80,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <span style={{ fontSize: 64, lineHeight: 1.1, maxWidth: 900 }}>
            {profile.heroBeat}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 28, color: muted }}>
            <span style={{ width: 40, height: 3, background: accent }} />
            <span>{profile.name}, {profile.location}</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
