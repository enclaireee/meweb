'use client';
import { useEffect, useRef, useState } from 'react';
import { enterLane, exitLane, subscribeFrame, useLane } from '@/engine';
import { ui } from '@/content';
import { useLang, useT } from './lang';

const btn =
  'rounded-full border border-current/30 bg-black/25 px-3.5 py-2 text-[0.7rem] tracking-[0.25em] uppercase backdrop-blur-sm transition-colors hover:bg-black/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current';

export function Nav() {
  const t = useT();
  const { lang, toggle } = useLang();
  const lane = useLane();
  const [sound, setSound] = useState(false); // off by default; starts only on a click
  const audio = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    if (!sound) return a.pause();
    // Wind outside the mountain (beats 0-1 and the projects lane), cavern hum inside.
    return subscribeFrame((f) => {
      const src = f.lane === 'main' && f.beat >= 2 ? '/audio/inside.mp3' : '/audio/outside.mp3';
      if (a.src.endsWith(src) && !a.paused) return;
      if (!a.src.endsWith(src)) a.src = src;
      a.play().catch(() => {});
    });
  }, [sound]);

  return (
    <nav className="world-nav fixed inset-x-0 top-0 z-50 flex items-center justify-end gap-2 p-4 text-[#f3ead8]">
      <a href="#content" className={`${btn} sr-only focus:not-sr-only`}>
        {t(ui.nav.skip)}
      </a>
      <button type="button" className={btn} onClick={() => (lane === 'main' ? enterLane('projects') : exitLane())}>
        {t(lane === 'main' ? ui.nav.projects : ui.nav.exitProjects)}
      </button>
      <button type="button" className={btn} aria-pressed={sound} onClick={() => setSound(!sound)}>
        {t(sound ? ui.nav.soundOn : ui.nav.soundOff)}
      </button>
      <button type="button" className={btn} onClick={toggle} aria-label={t(ui.nav.language)}>
        {lang === 'en' ? 'ID' : 'EN'}
      </button>
      <audio ref={audio} loop preload="none" />
    </nav>
  );
}
