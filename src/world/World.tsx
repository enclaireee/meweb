'use client';
import { useEffect } from 'react';
import { Stage, subscribeFrame } from '@/engine';
import type { Lang } from '@/content';
import { LangProvider } from './lang';
import { Frame } from './Frame';
import { Nav } from './Nav';
import { Gauge } from './Gauge';
import { ScrollCue } from './ScrollCue';
import { Plain } from './Plain';
import { mainBeats, projectBeats } from './beats';
import { projectS } from './lane-projects';

/** html[data-scrolling] while the stage moves: CSS pauses the ambient loops, so scroll frames only pay for the
 *  scene itself. The attribute flips twice per gesture (not per frame). */
function useScrollingFlag() {
  useEffect(() => {
    const html = document.documentElement;
    let last = NaN, timer = 0;
    const unsub = subscribeFrame((f) => {
      if (f.s === last) return;
      last = f.s;
      if (!html.hasAttribute('data-scrolling')) html.setAttribute('data-scrolling', '');
      clearTimeout(timer);
      timer = window.setTimeout(() => html.removeAttribute('data-scrolling'), 180);
    });
    return () => (unsub(), clearTimeout(timer), html.removeAttribute('data-scrolling'));
  }, []);
}

export function World({ lang, projectId }: { lang: Lang; projectId?: string }) {
  useScrollingFlag();
  return (
    <LangProvider initial={lang}>
      <div className="world">
        <Stage beats={mainBeats} projectBeats={projectBeats} initialLane={projectId ? 'projects' : 'main'} initialFocusId={projectId} initialS={projectId ? projectS(projectId) : undefined} smoothing={0.12}>
          <Nav />
          <Gauge />
          <ScrollCue />
          <Frame />
        </Stage>
      </div>
      <Plain />
    </LangProvider>
  );
}
