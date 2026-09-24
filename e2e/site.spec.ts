import { expect, test } from "@playwright/test";

const titles = ["DemandX", "OT Observability Lab", "Refocus", "KOMAT UNPAR 2025", "Solar-Powered Lighting"];

test.describe("readable first (no JavaScript)", () => {
  test.use({ javaScriptEnabled: false });

  test("every station, plate and both plate faces are real, visible HTML", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Muhammad Fatih Zamzami");
    for (const t of titles) await expect(page.getByRole("heading", { level: 2, name: t })).toBeVisible();
    await expect(page.locator("section[data-station]")).toHaveCount(8);
    // the back of every plate is readable without JS (both faces stack)
    await expect(page.getByText("schema-agnostic ingestion pipeline", { exact: false })).toBeVisible();
    await expect(page.getByRole("link", { name: /muhfatihzamzami@gmail\.com/ })).toBeVisible();
  });
});

test.describe("no WebGL", () => {
  test("the 3D chunk never loads; the poster and the plates remain", async ({ page }) => {
    const scripts: string[] = [];
    page.on("response", (r) => r.request().resourceType() === "script" && scripts.push(r.url()));
    await page.goto("/");
    await page.waitForTimeout(3000);
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.locator("html")).not.toHaveAttribute("data-scene", "live");
    await expect(page.locator(".poster")).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Refocus" })).toBeAttached();
    // the scene chunk is the only one that carries three.js
    for (const url of scripts) {
      const body = await (await page.request.get(url)).text();
      expect(body.includes("WebGLRenderer"), url).toBe(false);
    }
  });
});

test.describe("interaction", () => {
  test.use({ reducedMotion: "reduce" });

  test("the navigation's anchors land on their room", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name: "Contact" }).click();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.getByRole("heading", { level: 2, name: "Say hello" })).toBeInViewport();
  });

  test("arriving at a room lowers its cards into view", async ({ page }) => {
    await page.goto("/#ot-observability-lab");
    await expect(page.locator("#ot-observability-lab")).toHaveAttribute("data-active", "");
    await expect(page.getByRole("heading", { level: 2, name: "OT Observability Lab" })).toBeInViewport();
    await expect(page.getByText("What I built", { exact: true }).first()).toBeAttached();
  });

  test("the relight dial is a switch that remembers", async ({ page }) => {
    await page.goto("/");
    const dial = page.getByRole("switch", { name: "Morning light" });
    const before = await page.locator("html").getAttribute("data-light");
    await dial.click();
    const after = await page.locator("html").getAttribute("data-light");
    expect(after).not.toBe(before);
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-light", after!);
  });

  test("skip link, one h1, a heading per station", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to the plates" })).toBeFocused();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("section[data-station] h2")).toHaveCount(7);
  });
});

test("dev routes are 404 in production", async ({ request }) => {
  for (const p of ["/dev/art", "/dev/tokens", "/dev/worker"]) expect((await request.get(p)).status()).toBe(404);
});

test.describe("the scene", () => {
  test("loads after the page is readable, goes live, and never throws", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-scene", "live", { timeout: 60_000 });
    await expect(page.locator("canvas")).toHaveCount(1);
    expect(errors).toEqual([]);
  });
});
