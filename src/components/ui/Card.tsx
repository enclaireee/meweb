"use client";

import { useEffect, useRef } from "react";
import { copy, type Stop } from "@/content/site";
import CardBody from "./CardBody";
import styles from "./Card.module.css";

type Props = { stop: Stop; open: boolean; onClose(): void };

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduced";

export function Card({ stop, open, onClose }: Props) {
  const dlg = useRef<HTMLDialogElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const y0 = useRef<number | null>(null);

  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (open) {
      d.removeAttribute("data-closing");
      if (!d.open) {
        d.showModal();
        // Unfold from the hanging tag: start transform maps the card onto the tag's rect.
        d.style.animation = "none"; // measure the resting box, not the unfold's first frame
        const tag = document.querySelector(`[aria-controls="card-${stop.i}"]`)?.getBoundingClientRect();
        const box = d.getBoundingClientRect();
        if (tag && box.width) {
          d.style.setProperty("--from-x", `${tag.left + tag.width / 2 - (box.left + box.width / 2)}px`);
          d.style.setProperty("--from-y", `${tag.top - box.top}px`);
          d.style.setProperty("--from-s", `${Math.min(1, tag.width / box.width)}`);
        }
        d.style.animation = "";
      }
      const raf = requestAnimationFrame(() => {
        const s = scroller.current;
        if (s) s.toggleAttribute("data-scrollable", s.scrollHeight > s.clientHeight + 1);
      });
      return () => cancelAnimationFrame(raf);
    }
    if (!d.open) return;
    d.setAttribute("data-closing", "");
    const t = setTimeout(() => {
      d.close();
      d.removeAttribute("data-closing");
    }, reducedMotion() ? 0 : 320);
    return () => clearTimeout(t);
  }, [open, stop.i]);

  return (
    <dialog
      ref={dlg}
      id={`card-${stop.i}`}
      className={styles.card}
      data-layout={stop.card.layout}
      data-x={stop.card.at.x}
      data-y={stop.card.at.y}
      data-w={stop.card.at.w}
      aria-labelledby={`card-${stop.i}-title`}
      onCancel={(e) => {
        e.preventDefault(); // parent flips `open`; the effect closes with the exit animation
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose(); // backdrop
      }}
    >
      <div
        className={styles.sheet}
        onTouchStart={(e) => {
          y0.current = e.touches[0]?.clientY ?? null;
        }}
        onTouchEnd={(e) => {
          const y = y0.current;
          y0.current = null;
          if (y !== null && (e.changedTouches[0]?.clientY ?? y) - y > 64 && (scroller.current?.scrollTop ?? 0) === 0) onClose();
        }}
      >
        <button type="button" className={styles.close} onClick={onClose} aria-label={copy.close}>
          <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">
            <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </button>
        <div ref={scroller} className={styles.scroller}>
          <CardBody stop={stop} headingId={`card-${stop.i}-title`} />
        </div>
      </div>
    </dialog>
  );
}

export default Card;
