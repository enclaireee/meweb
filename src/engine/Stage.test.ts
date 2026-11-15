import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Stage } from './Stage';
import type { BeatDef, Manifest } from './types';

const manifest = (slug: string): Manifest => ({
  slug,
  bytes: 0,
  compositions: {
    desktop: { width: 1920, height: 1080, layers: [{ id: 'sky', src: `/art/${slug}/d-sky.webp`, x: 0, y: 0, w: 1920, h: 1080, depth: 0 }] },
    portrait: { width: 1080, height: 1920, layers: [{ id: 'sky', src: `/art/${slug}/p-sky.webp`, x: 0, y: 0, w: 1080, h: 1920, depth: 0 }] },
  },
});
const beat = (slug: string): BeatDef => ({
  slug, screens: 2, manifest: manifest(slug),
  desktop: { layers: { sky: { track: [{ at: 0, x: 96 }, { at: 1, x: 0 }] } }, overlays: [{ node: 'Hello', className: 'left-0' }] },
  portrait: {},
});

describe('Stage SSR (node, no window)', () => {
  it('renders only beat 0 of the initial lane, both compositions, with t=0 poses and the spacer', () => {
    const html = renderToString(createElement(Stage, { beats: [beat('a'), beat('b')], projectBeats: [beat('p')] }));
    expect(html).toContain('/art/a/d-sky.webp');
    expect(html).toContain('/art/a/p-sky.webp');
    expect(html).not.toContain('/art/b/');
    expect(html).toContain('translate3d(5%,0%,0)'); // 96 / 1920
    expect(html).toContain('Hello');
    expect(html).toContain('height:500lvh'); // (2 + 2 + 1) screens
  });

  it('renders the projects lane for a deep link', () => {
    const html = renderToString(
      createElement(Stage, { beats: [beat('a')], projectBeats: [beat('p')], initialLane: 'projects' }),
    );
    expect(html).toContain('/art/p/d-sky.webp');
    expect(html).not.toContain('/art/a/');
  });

  it('server-renders the beat holding initialS, posed at its local t, instead of beat 0', () => {
    const html = renderToString(
      createElement(Stage, {
        beats: [beat('a')], projectBeats: [beat('p0'), beat('p1'), beat('p2')], initialLane: 'projects', initialS: 3,
      }),
    );
    expect(html).toContain('/art/p1/d-sky.webp');
    expect(html).not.toContain('/art/p0/');
    expect(html).not.toContain('/art/p2/');
    expect(html).toContain('translate3d(2.5%,0%,0)'); // t = 0.5: x = 48 of 1920
    expect(html).not.toContain('visibility:hidden');
  });
});
