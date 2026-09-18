// TEMPORARY verification script for the redesigned PageIntroLoader.
// Proves the splash behaviour asked for: it always plays its complete fixed
// timeline on a full page load (covering the app's first data requests), it is
// centred / non-layout-breaking, and the page is fully usable right after it.
//   node scripts/_tmp-loader-check.mjs      (needs `npm run dev` on :3000)
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = process.env.SHOT_DIR || path.join(process.env.TEMP, "gi-loader-shots");
fs.mkdirSync(OUT, { recursive: true });

// Must match --page-intro-hold / --page-intro-fade in globals.css.
const HOLD_MS = 2000;
const FADE_MS = 700;
const TIMELINE_MS = HOLD_MS + FADE_MS;

const VIEWPORTS = [
  ["mobile-360", 360, 780],
  ["mobile-390", 390, 844],
  ["tablet-768", 768, 1024],
  ["desktop-1440", 1440, 900],
];

const SPLASH = "[data-page-intro]";

// Installed in every document before any page script runs.
const WATCHER = `
  window.__intro = { addedAt: null, firstVisibleAt: null, hiddenAt: null, goneAt: null };
  const seen = () => window.__intro;

  const isVisible = (el) => {
    const cs = getComputedStyle(el);
    return (
      cs.display !== "none" &&
      cs.visibility !== "hidden" &&
      Number(cs.opacity) > 0.01
    );
  };

  let sawVisible = false;
  const tick = () => {
    const el = document.querySelector("[data-page-intro]");
    const t = performance.now();
    if (el) {
      if (seen().addedAt === null) seen().addedAt = t;
      if (isVisible(el)) {
        if (seen().firstVisibleAt === null) seen().firstVisibleAt = t;
        sawVisible = true;
      } else if (sawVisible && seen().hiddenAt === null) {
        seen().hiddenAt = t;
      }
    } else if (sawVisible && seen().goneAt === null) {
      seen().goneAt = t;
      if (seen().hiddenAt === null) seen().hiddenAt = t;
    }
    requestAnimationFrame(tick);
  };

  // documentElement does not exist yet when this init script runs.
  const boot = () => {
    if (!document.documentElement) return false;
    new MutationObserver(() => {
      if (seen().addedAt === null && document.querySelector("[data-page-intro]")) {
        seen().addedAt = performance.now();
      }
    }).observe(document, { childList: true, subtree: true });
    requestAnimationFrame(tick);
    return true;
  };

  if (!boot()) {
    const bootObserver = new MutationObserver(() => {
      if (boot()) bootObserver.disconnect();
    });
    bootObserver.observe(document, { childList: true });
  }
`;

const measure = () => {
  const r = (n) => Math.round(n * 10) / 10;
  const overlay = document.querySelector("[data-page-intro]");
  if (!overlay) return { present: false };
  const wordmark = overlay.querySelector("p");
  const bar = overlay.querySelector(".intro-splash__bar");
  const wr = wordmark.getBoundingClientRect();
  const br = bar ? bar.getBoundingClientRect() : null;
  const or = overlay.getBoundingClientRect();
  const cs = getComputedStyle(overlay);
  const animations = overlay.getAnimations().map((a) => ({
    name: a.animationName,
    delay: a.effect.getTiming().delay,
    duration: a.effect.getTiming().duration,
  }));
  return {
    present: true,
    text: wordmark.textContent.trim(),
    label: overlay.querySelectorAll("p")[1]?.textContent.trim() ?? null,
    wordmarkCenterDx: r(wr.left + wr.width / 2 - window.innerWidth / 2),
    barWidth: br ? r(br.width) : null,
    barHeight: br ? r(br.height) : null,
    opacity: r(Number(cs.opacity)),
    visibility: cs.visibility,
    background: cs.backgroundColor,
    overlayCovers:
      or.left === 0 && or.top === 0 && or.width === window.innerWidth,
    ariaHidden: overlay.getAttribute("aria-hidden"),
    zIndex: cs.zIndex,
    hScroll: document.documentElement.scrollWidth > window.innerWidth,
    clipped:
      wr.left < -0.5 ||
      wr.right > window.innerWidth + 0.5 ||
      wr.top < -0.5 ||
      wr.bottom > window.innerHeight + 0.5,
    animations,
    timelineMs: animations.reduce(
      (max, a) => Math.max(max, a.delay + a.duration),
      0,
    ),
  };
};

const readTiming = (page) =>
  page.evaluate(() => window.__intro || null).catch(() => null);

const readState = (page) =>
  page
    .evaluate(() => {
      const html = document.documentElement;
      let introFlag = null;
      try {
        introFlag = window.sessionStorage.getItem("gi:page-intro-played");
      } catch {
        introFlag = "unavailable";
      }
      return {
        scrollLocked: html.classList.contains("intro-scroll-lock"),
        bodyOverflow: document.body.style.overflow,
        introFlag,
        splashPresent: !!document.querySelector("[data-page-intro]"),
      };
    })
    .catch(() => null);

async function waitForGone(page, timeout) {
  await page
    .waitForFunction(() => !document.querySelector("[data-page-intro]"), null, {
      timeout,
    })
    .catch(() => {});
}

async function launchBrowser() {
  try {
    return await chromium.launch({ channel: "chrome" });
  } catch {
    return chromium.launch();
  }
}

const browser = await launchBrowser();
const results = [];
const errors = [];
const checks = [];
const check = (name, pass, detail) =>
  checks.push({ name, pass, detail: detail ?? "" });

// Warm the dev route so the first measurement is not compiler noise.
{
  const warm = await browser.newContext();
  const warmPage = await warm.newPage();
  await warmPage.goto(BASE, { waitUntil: "load" }).catch(() => {});
  await warm.close();
}
for (const [name, width, height] of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  await ctx.addInitScript(WATCHER);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${name} pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`${name} console: ${m.text()}`);
  });

  // ---- full page load: the splash must play its complete timeline ----------
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(SPLASH, { timeout: 30000 });
  const geometry = await page.evaluate(measure);
  await page.screenshot({ path: path.join(OUT, `${name}-intro.png`) });

  // Mid-timeline: the overlay must still be fully opaque, so whatever the page
  // behind it is doing (skeletons, "Loading plans…") stays hidden.
  await page
    .waitForFunction(() => performance.now() > 1200, null, { timeout: 5000 })
    .catch(() => {});
  const mid = await page.evaluate(measure);
  await page.screenshot({ path: path.join(OUT, `${name}-mid.png`) });

  await waitForGone(page, 15000);
  await page.waitForTimeout(200);
  const timing = await readTiming(page);
  const after = await readState(page);
  // End-to-end proof that the page is usable again: a real wheel scroll must
  // move the viewport (a leftover `overflow:hidden` would keep it at 0).
  await page.mouse.wheel(0, 700);
  await page.waitForTimeout(350);
  const scrolledY = await page.evaluate(() => window.scrollY);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(OUT, `${name}-after.png`) });

  const onScreen = timing
    ? Math.round(timing.hiddenAt - timing.firstVisibleAt)
    : 0;
  results.push({
    viewport: name,
    geometry,
    mid,
    timing,
    onScreenMs: onScreen,
    scrolledY,
    after,
  });

  check(`${name}: painted on a full page load`, geometry.present === true);
  check(
    `${name}: CSS timeline is the configured ${TIMELINE_MS}ms`,
    geometry.timelineMs >= TIMELINE_MS - 50 &&
      geometry.timelineMs <= TIMELINE_MS + 50,
    `${geometry.timelineMs}ms timeline`,
  );
  check(
    `${name}: runs the whole animation on screen`,
    onScreen >= TIMELINE_MS - 200 && onScreen <= TIMELINE_MS + 500,
    `${onScreen}ms visible`,
  );
  check(
    `${name}: still opaque mid-timeline (nothing behind is visible)`,
    mid.present === true &&
      mid.opacity >= 0.99 &&
      mid.visibility === "visible" &&
      mid.background === "rgb(255, 255, 255)" &&
      mid.overlayCovers === true,
    `opacity=${mid.opacity} bg=${mid.background}`,
  );
  check(
    `${name}: bar is determinate progress (grows while shown)`,
    mid.barWidth > geometry.barWidth,
    `${geometry.barWidth}px -> ${mid.barWidth}px`,
  );
  check(
    `${name}: wordmark centred + not clipped, no h-scroll`,
    Math.abs(geometry.wordmarkCenterDx) <= 1 &&
      !geometry.clipped &&
      !geometry.hScroll &&
      geometry.overlayCovers === true,
    `dx=${geometry.wordmarkCenterDx}px`,
  );
  check(
    `${name}: decorative + on top`,
    geometry.ariaHidden === "true" && geometry.zIndex === "999",
  );
  check(
    `${name}: unmounted, unlocked and scrollable afterwards`,
    timing?.goneAt !== null &&
      after.scrollLocked === false &&
      after.bodyOverflow === "" &&
      scrolledY > 0,
    `goneAt=${Math.round(timing?.goneAt ?? -1)}ms, wheel scrollY=${scrolledY}`,
  );

  // ---- reload: the splash must play again (previous behaviour) -------------
  await page.reload({ waitUntil: "domcontentloaded" });
  const replayed = await page
    .waitForSelector(SPLASH, { timeout: 15000 })
    .then(() => true)
    .catch(() => false);
  const reloadGeometry = replayed ? await page.evaluate(measure) : null;
  await waitForGone(page, 15000);
  await page.waitForTimeout(200);
  const reloadTiming = await readTiming(page);
  const reloadAfter = await readState(page);
  check(
    `${name}: reload plays the splash again (full timeline)`,
    replayed === true &&
      reloadTiming?.firstVisibleAt !== null &&
      reloadTiming?.goneAt !== null,
    `visibleAt=${Math.round(reloadTiming?.firstVisibleAt ?? -1)}ms`,
  );
  check(
    `${name}: reload uses the same timeline, page usable after`,
    reloadGeometry?.timelineMs >= TIMELINE_MS - 50 &&
      reloadGeometry?.timelineMs <= TIMELINE_MS + 50 &&
      reloadAfter?.scrollLocked === false &&
      reloadAfter?.splashPresent === false,
    `${reloadGeometry?.timelineMs}ms`,
  );
  check(
    `${name}: no session flag shortcuts the splash`,
    after.introFlag === null && reloadAfter?.introFlag === null,
    `introFlag=${after.introFlag}`,
  );
  results.push({
    viewport: `${name}-reload`,
    replayed,
    reloadGeometry,
    reloadTiming,
    reloadAfter,
  });

  await ctx.close();
}

// ---- reduced motion: no rise/scale, much shorter hold ---------------------
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  await ctx.addInitScript(WATCHER);
  const page = await ctx.newPage();
  page.on("pageerror", (e) =>
    errors.push(`reduced-motion pageerror: ${e.message}`),
  );
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(SPLASH, { timeout: 30000 });
  const geometry = await page.evaluate(measure);
  await page.screenshot({ path: path.join(OUT, "reduced-motion-intro.png") });
  await waitForGone(page, 15000);
  const rmTiming = await readTiming(page);
  const rmOnScreen = rmTiming
    ? Math.round(rmTiming.hiddenAt - rmTiming.firstVisibleAt)
    : 0;
  await ctx.close();
  const defaultOnScreen = results.find((r) => r.viewport === "desktop-1440")
    ?.onScreenMs;
  results.push({ viewport: "reduced-motion", geometry, rmTiming, rmOnScreen });
  check(
    "reduced motion: shorter than the default splash",
    rmOnScreen > 300 && defaultOnScreen > 0 && rmOnScreen < defaultOnScreen,
    `${rmOnScreen}ms vs ${defaultOnScreen}ms`,
  );
  check(
    "reduced motion: only the fade-out animates",
    geometry.animations.length === 1 &&
      geometry.animations[0].name === "pageIntroOut",
    JSON.stringify(geometry.animations),
  );
}

// ---- client-side navigation must not re-trigger the splash ----------------
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  await ctx.addInitScript(WATCHER);
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await waitForGone(page, 15000);
  await page.locator('a[href="/services"]').first().click();
  await page.waitForTimeout(1500);
  const overlayAfterNav = await page.evaluate(
    () => !!document.querySelector("[data-page-intro]"),
  );
  await ctx.close();
  check("client-side navigation: no splash replay", overlayAfterNav === false);
  results.push({ viewport: "spa-navigation", overlayAfterNav });
}

await browser.close();

const report = { base: BASE, results, checks, errors };
fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify(report, null, 2));

console.log(`SHOT_DIR=${OUT}`);
for (const c of checks) {
  console.log(
    `${c.pass ? "PASS" : "FAIL"}  ${c.name}${c.detail ? `  (${c.detail})` : ""}`,
  );
}
console.log(`ERRORS=${errors.length}`);
if (errors.length) console.log(errors.join("\n"));
console.log(`ALL_PASS=${checks.every((c) => c.pass) && errors.length === 0}`);

