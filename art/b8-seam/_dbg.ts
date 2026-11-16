import sharp, { type OverlayOptions } from "sharp";
import { readFileSync } from "node:fs";
const ids = process.argv.slice(3), which = process.argv[2] as "desktop"|"portrait";
const m = JSON.parse(readFileSync("public/art/b8-seam/manifest.json","utf8")).compositions[which];
const ops: OverlayOptions[] = [];
for (const l of m.layers) if (ids.includes(l.id)) {
  const w=Math.round(l.w),h=Math.round(l.h),x=Math.round(l.x),y=Math.round(l.y);
  const sx=Math.max(0,-x),sy=Math.max(0,-y),cw=Math.min(w,m.width-x)-sx,ch=Math.min(h,m.height-y)-sy;
  ops.push({input: await sharp(`public/art/b8-seam/${l.id}.webp`).resize(w,h).extract({left:sx,top:sy,width:cw,height:ch}).png().toBuffer(), left:x+sx, top:y+sy});
}
await sharp({create:{width:m.width,height:m.height,channels:4,background:"#808080"}}).composite(ops).png().toFile("/private/tmp/claude-501/-Users-taufan-zamzami-Development-Coding-Personal-meweb/e7d3ff68-5b17-4cea-9cd5-eaa6c62e2002/scratchpad/dbg.png");
