import Image from "next/image";
import { copy, type ImageRef } from "@/content/site";
import styles from "./ImageSlot.module.css";

type Props = { image?: ImageRef; variant?: "cover" | "thumb" };

/** Fixed, per-slot tilt of +-0.6deg derived from the alt text. */
function tilt(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return ((Math.abs(h) % 13) - 6) / 10;
}

export function ImageSlot({ image, variant = "cover" }: Props) {
  const thumb = variant === "thumb";
  const src = thumb ? image?.thumb : image?.cover;
  const cls = `${styles.slot} ${thumb ? styles.thumb : styles.cover}`;
  if (!image || !src) {
    return (
      <div className={`${cls} ${styles.empty}`}>
        <svg className={styles.art} viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
          <circle cx="116" cy="26" r="9" />
          <path d="M0 90V64l24-20 18 14 30-34 26 30 16-10 46 30v16z" />
        </svg>
        {!thumb && <span className={styles.label}>{copy.imageEmpty}</span>}
      </div>
    );
  }
  return (
    <div className={`${cls} ${styles.filled}`} style={thumb ? undefined : { rotate: `${tilt(image.alt)}deg` }}>
      <Image src={src} alt={image.alt} fill sizes={thumb ? "56px" : "(min-width: 640px) 520px, 90vw"} className={styles.img} />
    </div>
  );
}

export default ImageSlot;
