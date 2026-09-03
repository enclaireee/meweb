const page = (await (await fetch("http://127.0.0.1:9222/json/list")).json()).find(t=>t.type==="page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener("open",r));
let id=0; const pending=new Map();
ws.addEventListener("message",e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);}});
const send=(m,p={})=>new Promise(res=>{const i=++id;pending.set(i,res);ws.send(JSON.stringify({id:i,method:m,params:p}));});
const ev=async e=>(await send("Runtime.evaluate",{expression:e,awaitPromise:true,returnByValue:true})).result?.result?.value;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const key=async(k,code,vk)=>{await send("Input.dispatchKeyEvent",{type:"keyDown",key:k,code,windowsVirtualKeyCode:vk});await send("Input.dispatchKeyEvent",{type:"keyUp",key:k,code,windowsVirtualKeyCode:vk});};

await send("Page.enable"); await send("Runtime.enable");
await send("Emulation.setEmulatedMedia",{features:[]});
await send("Emulation.setCPUThrottlingRate",{rate:1});
await send("Emulation.setDeviceMetricsOverride",{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await send("Page.navigate",{url:"http://127.0.0.1:3211/"});
await wait(2500);

console.log("=== KEYBOARD-ONLY PASS ===");
await ev("document.body.focus(); 'ok'");
const seen=[];
for (let i=0;i<14;i++){ await key("Tab","Tab",9); await wait(90);
  seen.push(await ev(`(()=>{const a=document.activeElement;if(!a)return 'none';const t=(a.textContent||'').trim().replace(/\\s+/g,' ').slice(0,42);return a.tagName+(a.getAttribute('data-project-card')?'['+a.getAttribute('data-project-card')+']':'')+': '+t})()`));
}
seen.forEach((s,i)=>console.log(`  tab ${String(i+1).padStart(2)}  ${s}`));
console.log("  focus ring visible on current element:", await ev(`(()=>{const s=getComputedStyle(document.activeElement);return s.outlineStyle!=='none'&&s.outlineWidth!=='0px'})()`));

console.log("\n=== KEYBOARD OPENS AND CLOSES THE EXPAND ===");
await ev(`document.querySelector('[data-project-card="komat-unpar"]').focus(); 'ok'`);
await key("Enter","Enter",13);
await wait(1500);
console.log("  opened by Enter:", await ev("location.pathname"), "| dialog:", await ev("!!document.querySelector('[role=dialog]')"));
console.log("  focus trapped inside:", await ev("document.querySelector('[role=dialog]')?.contains(document.activeElement)"));
await key("Tab","Tab",9); await wait(120);
console.log("  after Tab, still inside:", await ev("document.querySelector('[role=dialog]')?.contains(document.activeElement)"));
await key("Escape","Escape",27); await wait(1400);
console.log("  closed by Escape:", await ev("location.pathname"), "| focus:", await ev(`document.activeElement?.getAttribute('data-project-card')`));

console.log("\n=== SCROLL FRAMERATE (hero on screen, canvas running) ===");
await ev("window.scrollTo(0,0); 'ok'");
await wait(400);
await ev(`window.__f=[];(function loop(t){window.__f.push(t);if(window.__f.length<400)requestAnimationFrame(loop)})(performance.now()); 'ok'`);
await send("Input.synthesizeScrollGesture",{x:700,y:450,yDistance:-2400,speed:1200});
await wait(2600);
const fps = await ev(`(()=>{const f=window.__f;if(f.length<10)return null;const d=[];for(let i=1;i<f.length;i++)d.push(f[i]-f[i-1]);d.sort((a,b)=>a-b);const med=d[Math.floor(d.length/2)];const p95=d[Math.floor(d.length*0.95)];const long=d.filter(x=>x>20).length;return {frames:f.length,medianMs:+med.toFixed(2),p95Ms:+p95.toFixed(2),medianFps:+(1000/med).toFixed(1),framesOver20ms:long}})()`);
console.log("  ", JSON.stringify(fps));

console.log("\n=== SCROLL FRAMERATE, 4x CPU THROTTLE ===");
await send("Emulation.setCPUThrottlingRate",{rate:4});
await ev("window.scrollTo(0,0); 'ok'"); await wait(500);
await ev(`window.__g=[];(function loop(t){window.__g.push(t);if(window.__g.length<300)requestAnimationFrame(loop)})(performance.now()); 'ok'`);
await send("Input.synthesizeScrollGesture",{x:700,y:450,yDistance:-2400,speed:1200});
await wait(3200);
const fps2 = await ev(`(()=>{const f=window.__g;if(f.length<10)return null;const d=[];for(let i=1;i<f.length;i++)d.push(f[i]-f[i-1]);d.sort((a,b)=>a-b);const med=d[Math.floor(d.length/2)];return {frames:f.length,medianMs:+med.toFixed(2),medianFps:+(1000/med).toFixed(1),framesOver20ms:d.filter(x=>x>20).length}})()`);
console.log("  ", JSON.stringify(fps2));
await send("Emulation.setCPUThrottlingRate",{rate:1});
ws.close();
