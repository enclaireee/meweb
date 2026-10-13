// The traveller as one inline SVG (agents/traveller.md).
// Contract: viewBox "-200 -220 400 300", origin = boat centre on the waterline (artboard y 620).
// Groups: tr-wake | tr-boat > (hull, tr-body > (torso, tr-head, tr-arm > tr-pole), tr-lpole > tr-lantern).
// transform-origin pivots are user-space (viewBox) px. Body/lantern pole sit inside tr-boat so they rock with it.
import { C, darken, ellipse, kawung, lighten, mix, poly, rng, sheet, type Pt } from "./helpers";

const f = (n: number) => (Math.round(n * 10) / 10).toString();
const g = (cls: string, pivot: string, inner: string, extra = "") => `<g class="${cls}" style="transform-origin:${pivot}"${extra}>${inner}</g>`;

export default function traveller(): string {
  const r = rng(4417);
  const S = (shape: Pt[] | string, fill: string, o: { holes?: string[]; rim?: boolean } = {}) => sheet(shape, fill, r, o).svg;

  /* wake: two paper arcs trailing behind the stern (left) */
  const arcBand = (x0: number, y: number, w: number, t: number, fill: string, op: number) => {
    const top: Pt[] = [];
    const bot: Pt[] = [];
    for (let k = 0; k <= 5; k++) {
      const x = x0 - (w * k) / 5;
      const s = Math.sin((Math.PI * k) / 5);
      top.push([x, y - t * s]);
      bot.push([x, y + t * 0.25 * s]);
    }
    return `<path d="${poly([...top, ...bot.reverse().slice(1, -1)])}" fill="${fill}" opacity="${op}"/>`;
  };
  const wake =
    arcBand(-118, 8, 70, 5, C.waterHi, 0.65) + arcBand(-124, 15, 54, 4, C.waterHi, 0.45) + arcBand(-130, 22, 36, 3.2, C.waterHi, 0.3);

  /* boat: upswept flat-bottomed sampan, ember stripe, gunwale, basket */
  const hull: Pt[] = [[-132, -26], [-8, -22], [136, -38], [112, 6], [-108, 6]];
  const boatHull =
    S(hull, C.ramp2) +
    S([[-132, -26], [-8, -22], [136, -38], [135, -34], [-8, -18], [-131, -22]], lighten(C.ramp2, 0.22), { rim: false }) +
    S([[-122, -14], [-4, -11], [126, -26], [124, -22.5], [-4, -7.5], [-121, -10.5]], C.ember, { rim: false }) +
    // lantern warms the bow's near edge
    `<path d="${poly([[70, -30], [136, -38], [134, -32], [70, -25]])}" fill="${C.lantern}" opacity=".35"/>` +
    S([[-104, -46], [-60, -46], [-64, -24], [-100, -24]], darken(C.bamboo, 0.62)) + // basket
    S([[-106, -49], [-58, -49], [-58, -45], [-106, -45]], darken(C.bamboo, 0.45), { rim: false });
  // waterline lip over the hull bottom so the boat sits in the water
  const lip = `<path d="${poly([[-140, 4], [-110, 2], [-80, 4], [-50, 2], [-20, 4], [10, 2], [40, 4], [70, 2], [100, 4], [130, 2], [142, 5], [142, 12], [-140, 12]])}" fill="${mix(C.water2, C.waterHi, 0.25)}"/>`;

  /* lantern pole at the bow (bamboo, hooked), lantern hangs from the hook */
  const lpole =
    S([[112, -26], [118, -26], [155, -194], [150, -195]], darken(C.bamboo, 0.45)) +
    S([[150, -195], [155, -194], [150, -200], [140, -199], [134, -192], [137, -190], [142, -194], [150, -195]], darken(C.bamboo, 0.45), { rim: false });
  const lcx = 137;
  const lcy = -150;
  const lantern =
    S([[lcx - 1.5, -192], [lcx + 1.5, -192], [lcx + 1.5, -176], [lcx - 1.5, -176]], C.ramp1, { rim: false }) +
    S(ellipse(lcx, lcy, 11, 13, 16), C.lanternCore, { rim: false }) +
    S(ellipse(lcx, lcy, 14, 17, 18), C.lantern, { holes: kawung(lcx - 8, lcy - 9, 16, 18, 4.5) }) +
    S([[lcx - 7, lcy - 21], [lcx + 7, lcy - 21], [lcx + 7, lcy - 16], [lcx - 7, lcy - 16]], C.ramp1) +
    S([[lcx - 7, lcy + 15], [lcx + 7, lcy + 15], [lcx + 7, lcy + 20], [lcx - 7, lcy + 20]], C.ramp1);

  /* body: cloak, back three-quarter turned to the right */
  const cloak: Pt[] = [[-6, -128], [12, -128], [22, -114], [28, -90], [38, -28], [-32, -28], [-26, -84], [-18, -116]];
  const torso =
    S(cloak, C.ramp1) +
    S([[10, -126], [22, -114], [28, -90], [38, -28], [14, -28], [16, -90]], darken(C.ramp1, 0.35), { rim: false }) + // shaded right fold
    S([[-26, -84], [-32, -28], [-24, -28], [-18, -84]], lighten(C.ramp1, 0.14), { rim: false }) + // moonlit left edge
    S([[-2, -112], [26, -112], [27, -106], [-3, -106]], mix(C.ramp1, C.ember, 0.28), { rim: false }); // sash hint of warm
  /* head + hat: cone is the strongest silhouette */
  const hat =
    S([[-37, -130], [4, -184], [41, -130]], C.bamboo) +
    S([[4, -184], [41, -130], [8, -130]], darken(C.bamboo, 0.22), { rim: false }) + // shaded half
    S([[-31, -142], [-27, -138], [37, -138], [33, -142]], darken(C.bamboo, 0.42), { rim: false }) + // weave band
    S([[-37, -130], [41, -130], [34, -124], [-30, -124]], darken(C.bamboo, 0.35));
  const head = S([[-9, -126], [10, -126], [12, -112], [-8, -112]], darken(C.bamboo, 0.72), { rim: false }) + hat;
  /* arm + pole (pole is a separate piece so the stroke can animate) */
  const hand: [number, number] = [-36, -80];
  const pole = `<defs><linearGradient id="tr-pf" gradientUnits="userSpaceOnUse" x1="0" y1="14" x2="0" y2="52"><stop offset="0" stop-color="${darken(C.bamboo, 0.5)}"/><stop offset="1" stop-color="${darken(C.bamboo, 0.5)}" stop-opacity="0"/></linearGradient></defs>` +
    S([[-11, -124], [-7, -122], [-92, 14], [-96, 12]], darken(C.bamboo, 0.5)) +
    `<path d="${poly([[-96, 12], [-92, 14], [-86, 52], [-90, 52]])}" fill="url(#tr-pf)"/>`;
  const arm = S([[-4, -116], [-14, -111], [-40, -88], [-37, -76], [-27, -83], [-2, -102]], C.ramp1) +
    S([[-41, -86], [-33, -74], [-30, -80]].map((p) => p as Pt), darken(C.bamboo, 0.7), { rim: false });

  const wakeG = g("tr-wake", "-120px 8px", wake);
  const bodyG = g("tr-body", "0px -28px", torso + g("tr-head", "0px -120px", head) + g("tr-arm", "-6px -110px", arm + g("tr-pole", `${hand[0]}px ${hand[1]}px`, pole)));
  const lpoleG = g("tr-lpole", "115px -26px", lpole + g("tr-lantern", "137px -190px", lantern, ` data-glow="${f(lcx)},${f(lcy)}"`));
  const boatG = g("tr-boat", "0px 6px", boatHull + bodyG + lpoleG + lip);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-200 -220 400 300">${wakeG}${boatG}</svg>`;
}
