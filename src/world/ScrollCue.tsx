'use client';
// Scroll cue (Build decisions c, item 1): a small paper tab with a lantern, bobbing at the bottom of beat 0,
// "Scroll" / "Gulir". Waits for the intro (data-chrome), fades out over the first 5% of the main lane.
import { useEffect, useRef } from 'react';
import { subscribeFrame } from '@/engine';
import { ui } from '@/content';
import { useT } from './lang';

const FADE = 0.05; // lane progress by which it is gone

export function ScrollCue() {
  const t = useT();
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let last = -1;
    return subscribeFrame((f) => {
      const o = f.lane === 'main' ? Math.round(Math.max(0, 1 - f.progress / FADE) * 100) / 100 : 0;
      if (o === last || !el.current) return;
      last = o;
      el.current.style.opacity = String(o);
      el.current.style.visibility = o > 0 ? '' : 'hidden';
    });
  }, []);
  return (
    <div data-chrome aria-hidden className="pointer-events-none fixed inset-x-0 bottom-[calc(7vh+env(safe-area-inset-bottom))] z-40 flex justify-center portrait:bottom-[calc(54px+env(safe-area-inset-bottom))]">
      <div ref={el} className="cue-bob flex flex-col items-center gap-1.5">
        <span className="sheet relative flex items-center gap-2 px-3.5 pt-1.5 pb-1 text-label font-semibold tracking-[0.3em] uppercase shadow-[2px_4px_0_rgb(0_0_0/0.35)] [clip-path:polygon(0_6%,100%_0,98%_100%,3%_94%)]">
          <span className="size-1.5 rounded-full bg-[#c46a1c] shadow-[0_0_6px_2px_rgb(255_170_80/0.7)]" />
          {t(ui.scroll)}
        </span>
        <span className="h-5 w-px bg-linear-to-b from-[#f3ead8] to-transparent opacity-80" />
      </div>
    </div>
  );
}
