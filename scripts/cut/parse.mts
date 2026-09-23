/**
 * Parse an art SVG into sheet records (architecture.md §7.3). Paths are flattened to polylines
 * in world units: y is flipped so y grows upward (three.js), unless `flipY` is off (UI clips).
 */
import { DOMParser, type Element } from "@xmldom/xmldom";
import svgpath from "svgpath";

export type Pt = { x: number; y: number };
export type Poly = Pt[];

export type SheetSource = {
  id: string;
  stock: string;
  z: number;
  cut: "knife" | "scissors";
  cast: boolean;
  hinge?: string;
  pivot?: Pt;
  hang?: Pt;
  parent?: string;
  solids: Poly[];
  holes: Poly[];
  /** authored path commands, for the complexity lint */
  nodes: number;
  /** document order within the file */
  order: number;
};

export type FileSource = {
  file: string;
  viewBox: { x: number; y: number; w: number; h: number };
  /** "closed": the aisle rule doesn't apply (the terminal window wall, the worker) */
  aisle: "open" | "closed";
  /** data-backing on <svg>: every sheet gets an ink mount offset by this much (design.md §8) */
  backing: number;
  sheets: SheetSource[];
  /** structural problems found while parsing (forbidden elements, bad attributes) */
  errors: string[];
};

const ALLOWED = new Set(["svg", "path", "g", "title", "desc"]);
const FORBIDDEN_ATTRS = ["stroke", "transform", "filter", "clip-path", "mask", "style"];

/** Flatten one path `d` into closed polylines. Curves are sampled finely; resampling happens later. */
export function flatten(d: string, toWorld: (x: number, y: number) => Pt): Poly[] {
  const polys: Poly[] = [];
  let cur: Poly = [];
  let cx = 0;
  let cy = 0;
  let sx = 0;
  let sy = 0;
  const push = (x: number, y: number) => cur.push(toWorld(x, y));
  const close = () => {
    if (cur.length >= 3) polys.push(cur);
    cur = [];
  };

  const segs = (svgpath(d).abs().unarc().unshort() as unknown as { segments: (string | number)[][] }).segments;
  for (const seg of segs) {
    const cmd = seg[0] as string;
    const n = seg.slice(1) as number[];
    if (cmd === "M") {
      close();
      cx = sx = n[0]!;
      cy = sy = n[1]!;
      push(cx, cy);
      continue;
    }
    if (cur.length === 0) push(cx, cy); // drawing after Z without M restarts at the subpath start
    if (cmd === "L" || cmd === "H" || cmd === "V") {
      const x = cmd === "V" ? cx : n[0]!;
      const y = cmd === "H" ? cy : cmd === "V" ? n[0]! : n[1]!;
      push(x, y);
      cx = x;
      cy = y;
    } else if (cmd === "C" || cmd === "Q") {
      const pts = cmd === "C" ? [cx, cy, n[0]!, n[1]!, n[2]!, n[3]!, n[4]!, n[5]!] : [cx, cy, n[0]!, n[1]!, n[2]!, n[3]!];
      const ex = pts[pts.length - 2]!;
      const ey = pts[pts.length - 1]!;
      const approx = Math.hypot(ex - cx, ey - cy) + Math.hypot(pts[2]! - cx, pts[3]! - cy);
      const steps = Math.max(6, Math.ceil(approx / 0.08));
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const u = 1 - t;
        let x: number;
        let y: number;
        if (cmd === "C") {
          x = u * u * u * pts[0]! + 3 * u * u * t * pts[2]! + 3 * u * t * t * pts[4]! + t * t * t * pts[6]!;
          y = u * u * u * pts[1]! + 3 * u * u * t * pts[3]! + 3 * u * t * t * pts[5]! + t * t * t * pts[7]!;
        } else {
          x = u * u * pts[0]! + 2 * u * t * pts[2]! + t * t * pts[4]!;
          y = u * u * pts[1]! + 2 * u * t * pts[3]! + t * t * pts[5]!;
        }
        push(x, y);
      }
      cx = ex;
      cy = ey;
    } else if (cmd === "Z") {
      close();
      cx = sx;
      cy = sy;
    }
  }
  close();
  return polys.map(dedupe);
}

function dedupe(p: Poly): Poly {
  const out: Poly = [];
  for (const q of p) {
    const last = out[out.length - 1];
    if (!last || Math.hypot(q.x - last.x, q.y - last.y) > 1e-6) out.push(q);
  }
  const first = out[0]!;
  const last = out[out.length - 1]!;
  if (out.length > 1 && Math.hypot(first.x - last.x, first.y - last.y) < 1e-6) out.pop();
  return out;
}

const countNodes = (d: string) => (d.match(/[a-df-z]/gi) ?? []).length;

function parsePt(v: string | null, toWorld: (x: number, y: number) => Pt): Pt | undefined {
  if (!v) return undefined;
  const [x, y] = v.split(/[\s,]+/).map(Number);
  return Number.isFinite(x) && Number.isFinite(y) ? toWorld(x!, y!) : undefined;
}

export function parseSvg(file: string, text: string, { flipY = true } = {}): FileSource {
  const errors: string[] = [];
  let svg: Element;
  try {
    const doc = new DOMParser({
      onError: (level, msg) => {
        if (level !== "warning") errors.push(`xml: ${msg}`);
      },
    }).parseFromString(text, "image/svg+xml");
    svg = doc.documentElement as unknown as Element;
  } catch (err) {
    return { file, viewBox: { x: 0, y: 0, w: 1, h: 1 }, aisle: "open", backing: 0, sheets: [], errors: [`${file}: ${(err as Error).message}`] };
  }
  const vb = (svg.getAttribute("viewBox") ?? "").split(/[\s,]+/).map(Number);
  if (vb.length !== 4 || vb.some((n) => !Number.isFinite(n))) errors.push("svg: missing or bad viewBox");
  const [vx = 0, vy = 0, vw = 1, vh = 1] = vb;
  const toWorld = flipY ? (x: number, y: number) => ({ x, y: vy + vh - y }) : (x: number, y: number) => ({ x, y });

  const sheets: SheetSource[] = [];
  const ids = new Set<string>();
  let order = 0;

  const walk = (el: Element, depth: number) => {
    const children = Array.from(el.childNodes as unknown as Element[]).filter((n) => n.nodeType === 1);
    for (const node of children) {
      const tag = node.nodeName;
      if (!ALLOWED.has(tag)) {
        errors.push(`<${tag}> is not allowed (fills in <path> only)`);
        continue;
      }
      if (tag === "g") {
        if (depth >= 1) errors.push(`<g> nested deeper than one level`);
        walk(node, depth + 1);
        continue;
      }
      if (tag !== "path") continue;
      const id = node.getAttribute("id") ?? "";
      const where = id || `path #${order}`;
      for (const a of FORBIDDEN_ATTRS) if (node.hasAttribute(a)) errors.push(`${where}: attribute "${a}" is forbidden`);
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) errors.push(`${where}: id must be kebab-case`);
      if (ids.has(id)) errors.push(`${where}: duplicate id`);
      ids.add(id);

      const d = node.getAttribute("d") ?? "";
      const holesD = node.getAttribute("data-holes");
      const cut = node.getAttribute("data-cut") ?? "scissors";
      if (cut !== "knife" && cut !== "scissors") errors.push(`${where}: data-cut must be knife|scissors`);
      const z = Number(node.getAttribute("data-z") ?? "0");
      if (!Number.isFinite(z)) errors.push(`${where}: data-z must be a number`);

      sheets.push({
        id,
        stock: node.getAttribute("data-stock") ?? "",
        z,
        cut: cut as "knife" | "scissors",
        cast: node.getAttribute("data-cast") !== "false",
        hinge: node.getAttribute("data-hinge") ?? undefined,
        pivot: parsePt(node.getAttribute("data-pivot"), toWorld),
        hang: parsePt(node.getAttribute("data-hang"), toWorld),
        parent: node.getAttribute("data-parent") ?? undefined,
        solids: flatten(d, toWorld),
        holes: holesD ? flatten(holesD, toWorld) : [],
        nodes: countNodes(d) + (holesD ? countNodes(holesD) : 0),
        order: order++,
      });
    }
  };
  walk(svg, 0);

  return {
    file,
    viewBox: { x: vx, y: vy, w: vw, h: vh },
    aisle: svg.getAttribute("data-aisle") === "closed" ? "closed" : "open",
    backing: Number(svg.getAttribute("data-backing") ?? 0) || 0,
    sheets,
    errors,
  };
}
