'use client';
import { Stage } from '@/engine';
import type { Lang } from '@/content';
import { LangProvider } from './lang';
import { Frame } from './Frame';
import { Nav } from './Nav';
import { Gauge } from './Gauge';
import { ScrollCue } from './ScrollCue';
import { Plain } from './Plain';
import { mainBeats, projectBeats } from './beats';
import { projectS } from './lane-projects';

export function World({ lang, projectId }: { lang: Lang; projectId?: string }) {
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
