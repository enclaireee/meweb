// Visual QA harness (dev only, not shipped). Screenshots N evenly spaced scroll stops per lane and checks each stop:
// console errors, horizontal scroll, text off-screen, overlapping/ghosted text, chrome over text, flat empty frames.
// Writes PNGs, a contact sheet per run and report.json.
//
//   node scripts/qa/shots.mjs --base http://localhost:3000 --out /tmp/qa [--stops 40] [--sizes 1280x800,768x1024,375x812]
//        [--langs en,id] [--lanes main,projects] [--rm] [--nojs] [--contrast]
import { createRequire } from 'node:module';
// Playwright is preinstalled globally (resolved through NODE_PATH, which ESM imports ignore).
const { chromium } = createRequire(import.meta.url)('playwright');
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]);
    return acc;
  }, []),
);
const BASE = args.base ?? 'http://localhost:3000';
const OUT = args.out ?? 'qa-out';
const STOPS = Number(args.stops ?? 40);
const SIZES = String(args.sizes ?? '1280x800,768x1024,375x812').split(',').map((s) => s.split('x').map(Number));
const LANGS = String(args.langs ?? 'en,id').split(',');
const LANES = String(args.lanes ?? 'main,projects').split(',');
const RM = !!args.rm, NOJS = !!args.nojs, CONTRAST = !!args.contrast;
const PROJECT = args.project ?? 'demandx';
const SETTLE = Number(args.settle ?? 700);

/* ---------- in-page probe ---------- */
function probe() {
  const W = innerWidth, H = innerHeight;
  const world = document.querySelector('.world');
  const eff = (el) => {
    let o = 1;
    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden' || e.hasAttribute('data-off')) return 0;
      o *= parseFloat(cs.opacity);
      if (o < 0.01) return 0;
    }
    return o;
  };
  const clipRect = (el) => {
    let r = el.getBoundingClientRect();
    let x0 = r.left, y0 = r.top, x1 = r.right, y1 = r.bottom;
    const area = Math.max(0, x1 - x0) * Math.max(0, y1 - y0);
    for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) {
      const cs = getComputedStyle(e);
      // overflow clips, and so does a clip-path mask (the masked line rows): approximate it with the box.
      if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible' || (cs.clipPath !== 'none' && e.classList.contains('ln'))) {
        const p = e.getBoundingClientRect();
        x0 = Math.max(x0, p.left); y0 = Math.max(y0, p.top); x1 = Math.min(x1, p.right); y1 = Math.min(y1, p.bottom);
      }
    }
    const vis = Math.max(0, x1 - x0) * Math.max(0, y1 - y0);
    return { x0, y0, x1, y1, frac: area ? vis / area : 0, r };
  };
  const owner = (el) => el.closest('[data-slot-item], .at.one, .at.focus, [data-ov]') ?? el.parentElement;
  const texts = [];
  if (world) {
    const walker = document.createTreeWalker(world, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent.trim()) continue;
      const el = n.parentElement;
      if (!el || seen.has(el) || el.closest('.plain, script, style, svg title')) continue;
      seen.add(el);
      const o = eff(el);
      if (o < 0.05) continue;
      const c = clipRect(el);
      if (c.frac < 0.02 || c.x1 <= 0 || c.y1 <= 0 || c.x0 >= W || c.y0 >= H) continue;
      const cs = getComputedStyle(el);
      texts.push({
        el, o, c, txt: n.textContent.trim().slice(0, 40), color: cs.color, size: parseFloat(cs.fontSize),
        weight: Number(cs.fontWeight), chrome: !!el.closest('[data-chrome], .world-nav'),
      });
    }
  }
  const issues = [];
  // Text that pokes outside the viewport while fully shown.
  for (const t of texts) {
    if (t.chrome || t.o < 0.9 || t.c.frac < 0.98) continue;
    const r = t.c.r;
    if (r.left < -1 || r.top < -1 || r.right > W + 1 || r.bottom > H + 1) issues.push(`offscreen "${t.txt}"`);
    if (t.el.scrollWidth > t.el.clientWidth + 2 && getComputedStyle(t.el).overflowX !== 'visible') issues.push(`clipped "${t.txt}"`);
  }
  // Two visible text boxes from different owners on top of each other (ghosting, crossfades, chrome over text).
  const ov = (a, b) => {
    const w = Math.min(a.c.x1, b.c.x1) - Math.max(a.c.x0, b.c.x0), h = Math.min(a.c.y1, b.c.y1) - Math.max(a.c.y0, b.c.y0);
    if (w <= 0 || h <= 0) return 0;
    const sa = (a.c.x1 - a.c.x0) * (a.c.y1 - a.c.y0), sb = (b.c.x1 - b.c.x0) * (b.c.y1 - b.c.y0);
    return (w * h) / Math.min(sa, sb);
  };
  for (let i = 0; i < texts.length; i++)
    for (let j = i + 1; j < texts.length; j++) {
      const a = texts[i], b = texts[j];
      if (owner(a.el) === owner(b.el) || a.el.contains(b.el) || b.el.contains(a.el)) continue;
      if (a.chrome && b.chrome) continue;
      const f = ov(a, b);
      if (f > 0.15) issues.push(`${a.chrome || b.chrome ? 'chrome-over-text' : 'overlap'} "${a.txt}" x "${b.txt}" (${f.toFixed(2)})`);
    }
  // Half-faded text (the ghost look): visible but far from fully opaque, and not in a deliberate dim state.
  for (const t of texts) if (!t.chrome && t.o > 0.12 && t.o < 0.6 && !t.el.closest('.at.lit, .at.focus, [data-dim]')) issues.push(`half-faded "${t.txt}" (${t.o.toFixed(2)})`);
  const hscroll = document.documentElement.scrollWidth > W + 1;
  if (hscroll) issues.push(`horizontal scroll ${document.documentElement.scrollWidth}>${W}`);
  // Chrome controls covering visible text.
  const ctl = [...document.querySelectorAll('[data-chrome] :is(button,a), .world-nav :is(button,a)')]
    .filter((e) => eff(e) > 0.3).map((e) => e.getBoundingClientRect()).filter((r) => r.width && r.height);
  for (const t of texts) {
    if (t.chrome || t.o < 0.5) continue;
    for (const r of ctl) {
      const w = Math.min(r.right, t.c.x1) - Math.max(r.left, t.c.x0), h = Math.min(r.bottom, t.c.y1) - Math.max(r.top, t.c.y0);
      if (w > 2 && h > 2) { issues.push(`chrome-over-text "${t.txt}"`); break; }
    }
  }
  // Minimum sizes over art (body 16, labels 12).
  for (const t of texts) if (!t.chrome && t.o > 0.9 && t.size < 11.5) issues.push(`tiny ${t.size}px "${t.txt}"`);
  return {
    issues: [...new Set(issues)],
    textCount: texts.filter((t) => !t.chrome && t.o > 0.5).length,
    texts: texts.filter((t) => !t.chrome && t.o > 0.9 && t.c.frac > 0.9).map((t) => {
      // Content box: borders and padding (a pill's ring, a stamp's frame) are not behind the glyphs.
      const cs = getComputedStyle(t.el);
      const px = (k) => parseFloat(cs[k]) || 0;
      const l = px('borderLeftWidth') + px('paddingLeft'), r = px('borderRightWidth') + px('paddingRight');
      const tp = px('borderTopWidth') + px('paddingTop'), b = px('borderBottomWidth') + px('paddingBottom');
      const bg = cs.backgroundColor.match(/[\d.]+/g)?.map(Number);
      const own = bg && bg.length >= 3 && (bg.length < 4 || bg[3] >= 0.9) && !cs.backgroundColor.startsWith('lab') ? bg.slice(0, 3) : null;
      return {
        txt: t.txt, color: t.color, size: t.size, weight: t.weight, own, heading: t.el.classList.contains('heading-word'),
        box: [Math.max(0, t.c.x0 + l), Math.max(0, t.c.y0 + tp), Math.min(W, t.c.x1 - r), Math.min(H, t.c.y1 - b)],
      };
    }),
    scrollH: document.documentElement.scrollHeight, H,
  };
}

/* ---------- image checks ---------- */
async function flatShare(buf, W, H) {
  // Inner 88% (skip the frame), downsample, quantise to 8 levels per channel, share of the biggest bucket.
  const ix = Math.round(W * 0.06), iy = Math.round(H * 0.06);
  const { data } = await sharp(buf).extract({ left: ix, top: iy, width: W - 2 * ix, height: H - 2 * iy }).resize(64, 64, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true });
  const m = new Map();
  for (let i = 0; i < data.length; i += 3) {
    const k = (data[i] >> 5) * 64 + (data[i + 1] >> 5) * 8 + (data[i + 2] >> 5);
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  let best = 0, bk = 0;
  for (const [k, v] of m) if (v > best) (best = v), (bk = k);
  const lum = ((bk >> 6) + ((bk >> 3) & 7) + (bk & 7)) / 21;
  return { share: best / (data.length / 3), dark: lum < 0.12 };
}
const lin = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const L = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
async function contrastOf(bg, texts, W, H) {
  const out = [];
  const { data, info } = await sharp(bg).raw().toBuffer({ resolveWithObject: true });
  const sx = info.width / W;
  for (const t of texts) {
    const m = t.color.match(/[\d.]+/g)?.map(Number);
    if (!m) continue;
    const tl = L(m[0], m[1], m[2]);
    const [x0, y0, x1, y1] = t.box.map((v) => Math.round(v * sx));
    const rs = [];
    for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) {
      const i = (y * info.width + x) * info.channels;
      rs.push(ratio(tl, L(data[i], data[i + 1], data[i + 2])));
    }
    if (!rs.length) continue;
    rs.sort((a, b) => a - b);
    // In-scene headings sit BEHIND a sheet by design: the sheet's pixels occlude the text rather than sit behind it,
    // so they are judged on the median of their box; everything else on the worst 5% of pixels.
    const p5 = rs[Math.floor(rs.length * (t.heading ? 0.5 : 0.05))];
    const large = t.size >= 24 || (t.size >= 18.66 && t.weight >= 700);
    const need = large ? 3 : 4.5;
    if (p5 < need) out.push(`contrast ${p5.toFixed(2)}<${need} "${t.txt}"`);
  }
  return out;
}

/* ---------- runner ---------- */
async function run(browser, [w, h], lang, lane) {
  const tag = `${lane}-${lang}-${w}x${h}${RM ? '-rm' : ''}${NOJS ? '-nojs' : ''}`;
  const dir = path.join(OUT, tag);
  await fs.mkdir(dir, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: RM ? 'reduce' : 'no-preference', javaScriptEnabled: !NOJS, deviceScaleFactor: 1, hasTouch: w < 800, isMobile: false });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)));
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  const url = lane === 'main' ? `${BASE}/${lang}` : `${BASE}/${lang}/p/${PROJECT}`;
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(lane === 'main' ? 3200 : 1800); // let an intro finish / the lane flip settle
  const stops = [];
  if (NOJS) {
    const buf = await page.screenshot({ fullPage: true });
    await fs.writeFile(path.join(dir, 'full.png'), buf);
    const hs = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    const r = { tag, errors, hscroll: hs, stops: [] };
    await ctx.close();
    return r;
  }
  const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (let i = 0; i < STOPS; i++) {
    const y = Math.round((max * i) / (STOPS - 1));
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(SETTLE);
    // The engine smooths scroll: wait until every visible beat's --t has stopped changing (max 3 s).
    await page.evaluate(() => new Promise((done) => {
      const read = () => [...document.querySelectorAll('[data-comp]:not([data-off])')].map((e) => e.style.getPropertyValue('--t')).join('|');
      let last = read(), same = 0, n = 0;
      const tick = () => { const v = read(); same = v === last ? same + 1 : 0; last = v; if (same >= 8 || ++n > 180) done(); else requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }));
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const buf = await page.screenshot();
    const file = path.join(dir, `${String(i).padStart(2, '0')}.png`);
    await fs.writeFile(file, buf);
    const p = await page.evaluate(probe);
    const flat = await flatShare(buf, w, h);
    const issues = [...p.issues];
    if (flat.share > 0.6 && p.textCount === 0) issues.push(`empty frame (${Math.round(flat.share * 100)}% one colour${flat.dark ? ', dark' : ''})`);
    if (flat.share > 0.85 && flat.dark) issues.push(`black frame (${Math.round(flat.share * 100)}%)`);
    if (CONTRAST && p.texts.length) {
      await page.addStyleTag({ content: '.world *{color:transparent!important;-webkit-text-fill-color:transparent!important;caret-color:transparent!important}', }).then((h) => h.evaluate((s) => s.setAttribute('data-qa', '')));
      await page.waitForTimeout(50);
      const bg = await page.screenshot();
      await page.evaluate(() => document.querySelectorAll('style[data-qa]').forEach((s) => s.remove()));
      issues.push(...(await contrastOf(bg, p.texts, w, h)));
    }
    stops.push({ i, y, issues });
  }
  const scrollScreens = (max + h) / h;
  await ctx.close();
  await sheet(dir, stops, w, h, tag);
  return { tag, errors: [...new Set(errors)], scrollScreens: +scrollScreens.toFixed(2), stops };
}

async function sheet(dir, stops, w, h, tag) {
  const cols = 8, tw = w >= h ? 280 : 160, th = Math.round((tw * h) / w), pad = 6, lab = 16;
  const rows = Math.ceil(stops.length / cols);
  const W = cols * (tw + pad) + pad, H = rows * (th + lab + pad) + pad + 24;
  const comps = [];
  for (const s of stops) {
    const c = s.i % cols, r = Math.floor(s.i / cols);
    const left = pad + c * (tw + pad), top = 24 + pad + r * (th + lab + pad);
    const img = await sharp(path.join(dir, `${String(s.i).padStart(2, '0')}.png`)).resize(tw, th).toBuffer();
    comps.push({ input: img, left, top: top + lab });
    const bad = s.issues.length > 0;
    const svg = `<svg width="${tw}" height="${lab}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${bad ? '#7a1c1c' : '#222'}"/><text x="4" y="12" font-family="sans-serif" font-size="11" fill="#fff">${s.i} ${bad ? '⚠ ' + s.issues.length : ''}</text></svg>`;
    comps.push({ input: Buffer.from(svg), left, top });
  }
  comps.push({ input: Buffer.from(`<svg width="${W}" height="24" xmlns="http://www.w3.org/2000/svg"><text x="8" y="17" font-family="sans-serif" font-size="14" fill="#ddd">${tag}</text></svg>`), left: 0, top: 0 });
  await sharp({ create: { width: W, height: H, channels: 3, background: '#111' } }).composite(comps).png().toFile(path.join(OUT, `sheet-${tag}.png`));
}

const browser = await chromium.launch();
const jobs = [];
for (const lane of LANES) for (const lang of LANGS) for (const size of SIZES) jobs.push([size, lang, lane]);
const results = [];
const CONC = Number(args.conc ?? 3);
await fs.mkdir(OUT, { recursive: true });
for (let i = 0; i < jobs.length; i += CONC) {
  results.push(...(await Promise.all(jobs.slice(i, i + CONC).map(([s, l, ln]) => run(browser, s, l, ln)))));
}
await browser.close();
await fs.writeFile(path.join(OUT, 'report.json'), JSON.stringify(results, null, 1));
for (const r of results) {
  const bad = r.stops.filter((s) => s.issues.length);
  console.log(`${r.tag}: screens=${r.scrollScreens ?? '-'} errors=${r.errors.length} bad-stops=${bad.length}/${r.stops.length}${r.hscroll ? ' HSCROLL' : ''}`);
  const counts = {};
  for (const s of bad) for (const x of s.issues) { const k = x.split(' "')[0].split(' (')[0].replace(/[\d.]+<[\d.]+/, '<'); counts[k] = (counts[k] ?? 0) + 1; }
  if (Object.keys(counts).length) console.log('   ', JSON.stringify(counts));
  for (const e of r.errors.slice(0, 3)) console.log('    console:', e);
}
