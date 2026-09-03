const BASE = "http://127.0.0.1:3211";
const list = async () => (await fetch("http://127.0.0.1:9222/json/list")).json();

let targets = await list();
let page = targets.find(t => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener("open", r));

let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
const send = (method, params = {}) => new Promise(res => {
  const myId = ++id;
  pending.set(myId, res);
  ws.send(JSON.stringify({ id: myId, method, params }));
});
const evaluate = async (expr) => {
  const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
  return r.result?.result?.value;
};
const wait = ms => new Promise(r => setTimeout(r, ms));

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

const shot = async (name) => {
  const r = await send("Page.captureScreenshot", { format: "png" });
  const fs = await import("node:fs");
  fs.writeFileSync(name, Buffer.from(r.result.data, "base64"));
};

console.log("1. load the page");
await send("Page.navigate", { url: BASE + "/" });
await wait(2500);

console.log("2. scroll down to the work index, then remember where we are");
await evaluate(`document.getElementById('work').scrollIntoView(); window.scrollBy(0, 900); 'ok'`);
await wait(600);
const scrollBefore = await evaluate("Math.round(window.scrollY)");
console.log("   scrollY before:", scrollBefore);

console.log("3. click the KOMAT row (an unfeatured index row)");
await evaluate(`document.querySelector('[data-project-card="komat-unpar"]').click(); 'ok'`);
await wait(1400);
console.log("   url:              ", await evaluate("location.pathname"));
console.log("   dialog present:   ", await evaluate("!!document.querySelector('[role=dialog][aria-modal=true]')"));
console.log("   dialog labelled:  ", await evaluate(`(()=>{const d=document.querySelector('[role=dialog]');if(!d)return false;const t=document.getElementById(d.getAttribute('aria-labelledby'));return t?t.textContent.trim():false})()`));
console.log("   page scroll locked:", await evaluate("getComputedStyle(document.documentElement).overflow"));
console.log("   focus inside dialog:", await evaluate("!!document.querySelector('[role=dialog]')?.contains(document.activeElement)"));
console.log("   index still in DOM (page behind kept):", await evaluate("!!document.getElementById('work')"));
await shot("expand-open.png");

console.log("4. press Escape");
await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
await wait(1400);
console.log("   url:              ", await evaluate("location.pathname"));
console.log("   dialog gone:      ", await evaluate("!document.querySelector('[role=dialog]')"));
console.log("   scrollY after:    ", await evaluate("Math.round(window.scrollY)"), "(was", scrollBefore + ")");
console.log("   scroll unlocked:  ", await evaluate("getComputedStyle(document.documentElement).overflow"));
console.log("   focus returned to:", await evaluate("document.activeElement?.getAttribute('data-project-card') || document.activeElement?.tagName"));
await shot("expand-closed.png");

console.log("5. open a featured card, then use the back button");
await evaluate(`document.querySelector('[data-project-card="nest-ui"]')?.click() ?? document.querySelector('a[href="/work/nest-ui"]').click(); 'ok'`);
await wait(1400);
console.log("   url:              ", await evaluate("location.pathname"));
await evaluate("history.back(); 'ok'");
await wait(1400);
console.log("   after back, url:  ", await evaluate("location.pathname"));
console.log("   dialog gone:      ", await evaluate("!document.querySelector('[role=dialog]')"));

ws.close();
