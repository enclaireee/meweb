/**
 * art/lib: shared toolkit for procedural papercut art. Dev-only; src/ must never import from art/.
 * Run from the repo root: `npx tsx art/<beat>/build.ts`; import from "../lib/index.ts".
 * art/package.json sets "type":"module": top-level await and import.meta work; imports need the .ts extension.
 *
 * Coordinates: SVG units = design pixels of the composition canvas (desktop 1920x1080, portrait 1080x1920).
 * Everything is deterministic: same seed -> same bytes. Make one rng per beat/layer: `const r = rng(1234)`.
 * Colours are never hard-coded here; pass hex tokens from the art bible (`Palette`).
 *
 * TYPES   Pt = [x,y]; Poly = Pt[] (one ring); Shape = Poly[] (rings, may contain holes); Palette = Record<string,string>
 *         Frag = { svg, x0,y0,x1,y1 } painter-ordered SVG piece with bounds (sheet/glow return this)
 * RNG     rng(seed): Rng  -- r() in [0,1), r.range(a,b), r.int(a,b), r.pick(xs), r.vary(k=0.1)
 *         noise(seed): (x,y)=>[-1,1] simplex      mix(hexA, hexB, t): hex
 * SHAPES  ridge(r, {x0,x1,y,base,amp,step?,peaky?,seed?}): Poly   mountain silhouette closed down to `base`
 *         hills(r, same opts): Poly                                  rolling hills
 *         arch(r, cx, baseY, w, h): Poly                             cavern/door arch
 *         tree(r, cx, baseY, h): Shape                               trunk + canopy
 *         roots(r, cx, y, w, len, n?, dir?): Shape                   tapering strands (dir 1 down, -1 up)
 *         stairs(x, y, w, h, steps, dir?): Poly                      filled staircase profile
 *         rect(x,y,w,h): Poly   ellipse(cx,cy,rx,ry,n?): Poly       plain polygons
 *         cut(poly, r, jitter?, seg?): Poly                          scissor-cut jitter (use on rect/ellipse)
 *         union(...polysOrShapes): Shape   difference(a, ...cuts): Shape   (clipper2 booleans)
 * PAPER   sheet(shapeOrPoly, fill, {holes?, shadow?, edge?, opacity?}): Frag
 *           holes: (Poly|Shape)[] really cut out; shadow {dx,dy,blur,opacity,color}|false baked drop shadow;
 *           edge {light:[-1,-1] (toward light), width, color} thin lighter stroke on the lit side.
 *           inner {blur?,opacity?,color?}: soft inner shadow over the body (paper thickness); combines with edge.
 *         glow(cx, cy, r, color, {opacity?, core?}): Frag            radial glow on transparent bg
 *         stack(shape, fills[], inset, sheetOpts?): Frag[]           same silhouette repeated, each `inset` smaller, next fill
 *         shaft(x, y, w0, w1, len, angleDeg, color, opacity?): Frag  soft light ray (angle 0 = down, + leans right)
 *         mist(x, y, w, h, color, opacity?): Frag                    soft haze ellipse centred at x,y
 *         offset(shapeOrPoly, d): Shape                              grow (d>0) / shrink (d<0), clipper round joins
 * GENERATORS (all take rng first; jittered; return Shape unless noted; `{body,holes}` = pass holes to sheet())
 *         pine(r,cx,baseY,h)  fern(r,cx,baseY,h,lean=.3)  vine(r,x,y,len,sway=14)  crystal(r,cx,baseY,h)
 *         strata(r,{x0,x1,y,base,bands}): Shape[]   stepped cliff bands, back to front, each closed to `base`
 *         column(r,cx,baseY,w,h,broken=false)  bridge(r,x0,x1,y,thickness,arches)  cloud(r,cx,cy,w,h)
 *         tower(r,cx,baseY,w,h,{windows?}): {body,holes}   ruinWall(r,x,baseY,w,h): {body,holes}  (x = left edge)
 *         lantern(cx,cy,s): {body,holes}   no rng; holes are 3 panes to put a glow behind
 *         stalactites(r,x0,x1,y,maxLen,n,dir=1)   dir 1 hangs down, -1 stalagmites rising
 *         flock(r,cx,cy,spread,n,size)   canopy(r,x0,x1,y,depth): Poly   leaf-mass edge hanging below y
 *         scatter(r,{x0,y0,x1,y1},n,(x,y,i)=>Poly|Shape,minDist?): Shape   union of n placed items
 * BAKE    layer(id, depth, ...frags): Layer                          depth 0 = farthest
 *         bakeLayer(slug, layer, {quality=82, scale=1}): Promise<{id,depth,bytes,x,y,w,h}|null>
 *         bakeBeat(slug, layers, {desktop, portrait}, {quality?, scale?, preview=true}): Promise<Manifest>
 *           Composition = { width, height, include?: string[] (layer ids), place?: {[id]: {x?,y?,s?}} }
 *           Sprites are trimmed to their alpha box; one file may be reused by both compositions with
 *           different `place`. Writes public/art/<slug>/<id>.webp, manifest.json, art/<slug>/preview-*.png.
 *         composite(slug, "desktop"|"portrait", bg?): Promise<pngPath>  re-flatten a baked beat for checking
 *         bakeSpriteSheet(slug, id, frames, {frameW, frameH, anchor?, quality?, scale?}): Promise<meta>
 *           frames: Frag|Frag[] per frame, drawn in cell coords (0,0 top-left); row layout, untrimmed;
 *           writes public/art/<slug>/<id>.webp + <id>.json {id,src,scale,frameW,frameH,anchor,frames:[{x,y,w,h}],bytes}
 *
 *         grain(): Promise<path>  writes tileable 256x256 paper-fibre tile public/art/_grain.webp (CSS overlay blend)
 *
 * MANIFEST (public/art/<slug>/manifest.json, depended on by src/):
 *   { slug, compositions: { desktop:{width,height,layers:[{id,src:"/art/<slug>/<id>.webp",x,y,w,h,depth}]},
 *                           portrait:{...} }, bytes }
 *   x/y/w/h = sprite rect in that composition's design canvas (may exceed it as bleed); layers sorted by depth.
 */
export * from "./shapes.ts";
export * from "./bake.ts";
export * from "./gen.ts";
