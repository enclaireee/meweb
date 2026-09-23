# The Night Workshop

Muhammad Fatih Zamzami's portfolio: a paper-cut diorama of a workshop at night. Scroll, and a small paper worker walks you through eight stations, one per project, to a window where you can say hello.

Everything you read is server-rendered HTML. The 3D scene (three.js + React Three Fiber) loads afterwards, when the page is idle, and only on devices that can run it.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint (Next + React Compiler rules) |
| `npm test` | Unit tests (vitest): cut pipeline, scroll→camera, walk cycle, spring |
| `npm run e2e` | End-to-end tests (Playwright) against a production build on port 3200: no-JS, no-WebGL, reduced motion, anchors, flip, relight, the scene going live |
| `npm run cut` | Bake every art SVG into cut geometry and the UI clip-paths (`cut:check` fails if they're stale) |
| `npm run grain` | Regenerate the paper grain textures |
| `npm run poster` | Render the desk posters and the share card from a running production build (`npm run poster -- http://localhost:3000/`) |

## Where things live

- `src/sections/NN-name/`: one folder per station. `Section.tsx` is the HTML, `Station.tsx` the 3D group, `art/*.svg` the source art, `art/*.cut.json` its baked geometry.
- `src/scene/`: the 3D engine: one loop, one paper material, the camera rig, the lights, the worker.
- `src/ui/`: the HTML paper objects (plates, tags, the depth tag, the relight dial).
- `src/content/`: everything the site says, typed, from the CV.
- `scripts/`: the cut pipeline, the grain generator and the poster renderer.

Add `?debug` to the URL to log draw calls, triangles and GPU memory every two seconds.
