import { beforeEach, describe, expect, it } from 'vitest';
import { enterLane, exitLane, getState, initLane, laneIO, scrollToS, setState, subscribeFrame, emitFrame } from './store';

// S4: lane flip and exact return. A fake window: scroll position + viewport unit.
let y = 0;
let unit = 800;
let length = 10; // screens of the rendered lane
const setYCalls: number[] = [];
const scrolls: [number, boolean][] = [];

beforeEach(() => {
  y = 0;
  unit = 800;
  length = 10;
  setYCalls.length = 0;
  scrolls.length = 0;
  laneIO.getLength = () => length;
  laneIO.scrollTo = (v, smooth) => void scrolls.push([v, smooth]);
  setState({ reducedMotion: false });
  laneIO.getY = () => y;
  laneIO.setY = (v) => {
    setYCalls.push(v);
    y = v;
  };
  laneIO.getUnit = () => unit;
  laneIO.turn = async (swap) => swap();
  laneIO.commit = (fn) => fn();
  initLane('main');
});

describe('lanes', () => {
  it('enters projects from 0 and restores the exact main scrollY on exit', async () => {
    y = 4321.75;
    await enterLane('projects', { focusId: 'p1' });
    expect(getState()).toMatchObject({ lane: 'projects', focusId: 'p1', turning: false });
    expect(y).toBe(0);
    y = 2500; // scroll around inside the projects lane
    await exitLane();
    expect(getState().lane).toBe('main');
    expect(y).toBe(4321.75);
  });

  it('swaps lane and scroll at mid-turn, in that order', async () => {
    const order: string[] = [];
    laneIO.commit = (fn) => {
      fn();
      order.push(`commit:${getState().lane}`);
    };
    const setY = laneIO.setY;
    laneIO.setY = (v) => {
      order.push(`setY:${v}`);
      setY(v);
    };
    laneIO.turn = async (swap) => {
      order.push(`turning:${getState().turning}`);
      swap();
      order.push('reveal');
    };
    y = 900;
    await enterLane('projects');
    expect(order).toEqual(['turning:true', 'commit:projects', 'setY:0', 'reveal']);
  });

  it('scales the restore if the viewport height changed while in projects', async () => {
    y = 1600;
    await enterLane('projects');
    unit = 1000;
    await exitLane();
    expect(y).toBe(2000);
  });

  it('ignores re-entry and calls while turning', async () => {
    let release!: () => void;
    laneIO.turn = (swap) => new Promise<void>((r) => (release = () => { swap(); r(); }));
    y = 500;
    const first = enterLane('projects');
    await enterLane('main'); // ignored: turning
    await enterLane('projects'); // ignored: turning
    release();
    await first;
    expect(setYCalls).toEqual([0]);
    await enterLane('projects', { focusId: 'p2' }); // same lane: only focus changes
    expect(getState()).toMatchObject({ lane: 'projects', focusId: 'p2' });
    expect(setYCalls).toEqual([0]);
  });

  it('enters at a given s (clamped to the new lane) and still restores the exact main scrollY', async () => {
    y = 4321.75;
    laneIO.commit = (fn) => {
      fn();
      length = getState().lane === 'projects' ? 6 : 20; // length is read after the lane swap
    };
    await enterLane('projects', { focusId: 'p4', s: 2.5 });
    expect(y).toBe(2000);
    await exitLane();
    expect(y).toBe(4321.75);
    await enterLane('projects', { s: 99 });
    expect(y).toBe(6 * 800);
    await exitLane();
    await enterLane('projects', { s: -1 });
    expect(y).toBe(0);
  });

  it('deep link starting in projects exits to the top of main', async () => {
    initLane('projects', 'p3');
    y = 700;
    await exitLane();
    expect(getState().lane).toBe('main');
    expect(y).toBe(0);
  });

  it('does nothing before the stage initialises the lane', async () => {
    initLane(null);
    await enterLane('projects');
    expect(getState().lane).toBe(null);
    expect(setYCalls).toEqual([]);
  });

  it('clears turning even if the turn throws', async () => {
    laneIO.turn = async () => {
      throw new Error('boom');
    };
    await expect(enterLane('projects')).rejects.toThrow('boom');
    expect(getState().turning).toBe(false);
  });
});

describe('scrollToS', () => {
  it('scrolls the current lane to s, clamped, smooth only when asked and motion is allowed', () => {
    scrollToS(1.5);
    scrollToS(3, { smooth: true });
    scrollToS(42, { smooth: true });
    scrollToS(-2);
    setState({ reducedMotion: true });
    scrollToS(2, { smooth: true });
    expect(scrolls).toEqual([[1200, false], [2400, true], [8000, true], [0, false], [1600, false]]);
  });
});

describe('frame channel', () => {
  it('replays the last frame to new subscribers', () => {
    const f = { lane: 'main' as const, s: 1, progress: 0.1, velocity: 0, beat: 0, t: 0.5, unit: 800, pointer: { x: 0, y: 0 } };
    emitFrame(f);
    const got: number[] = [];
    const off = subscribeFrame((fr) => got.push(fr.s));
    emitFrame({ ...f, s: 2 });
    off();
    emitFrame({ ...f, s: 3 });
    expect(got).toEqual([1, 2]);
  });
});
