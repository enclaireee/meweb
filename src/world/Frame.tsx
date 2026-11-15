'use client';
// Paper frame: 4 nested torn sheets on the screen edges, always on screen, tinted per scene
// (masks + tints from public/art/frame, spec in agents/art-beats/frame.md). Also the paper grain.
import { useEffect, useRef } from 'react';
import { subscribeFrame } from '@/engine';
import frame from '../../public/art/frame/manifest.json';
import { mainBeats, projectBeats } from './beats';

const tints = frame.tints as Record<string, string[]>;
const url = (f: string) => `url(/art/frame/${f})`;
// Lit from the front: the sheet nearest the viewer (screen edge) is the lightest, so the frame reads as
// paper, not a dark vignette. Built from the scene's two lightest frame tints; the near-black ones are unused.
const steps = (slug: string) => {
  const [a = '#333', b = a] = tints[slug] ?? [];
  return [b, a, `color-mix(in srgb, ${a}, #fff 10%)`, `color-mix(in srgb, ${a}, #fff 20%)`];
};

export function Frame() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sheets = [...root.current!.querySelectorAll<HTMLElement>('.frame-sheet')];
    let scene = 'b0-outside';
    return subscribeFrame((f) => {
      const slug = (f.lane === 'main' ? mainBeats : projectBeats)[f.beat]?.slug ?? '';
      if (slug === scene || !tints[slug]) return;
      scene = slug;
      steps(slug).forEach((c, i) => sheets[i] && (sheets[i].style.backgroundColor = c));
    });
  }, []);

  const first = steps('b0-outside');
  return (
    <>
    {/* Outside the z-40 box: a stacking context would isolate the blend and turn the grain into a grey wash. */}
    <div aria-hidden className="frame-grain pointer-events-none fixed inset-0 z-40" />
    <div ref={root} aria-hidden className="pointer-events-none fixed inset-0 z-40">
      {frame.desktop.map((d, i) => {
        const mask = { '--d': url(d), '--p': url(frame.portrait[i] ?? d) } as React.CSSProperties;
        return [
          // ponytail: hard offset copy as the shadow; a drop-shadow filter over a mask flickers and costs a full-screen layer each
          <div key={`s${d}`} className="frame-mask frame-shade absolute inset-0" style={mask} />,
          <div key={d} className="frame-mask frame-sheet absolute inset-0" style={{ ...mask, backgroundColor: first[i] }} />,
        ];
      })}
    </div>
    </>
  );
}
