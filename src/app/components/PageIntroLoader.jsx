"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Page intro (brand splash).
 *
 * A short, calm brand beat: one wordmark, one hairline progress bar. Nothing
 * spins and nothing loops, so the splash never reads as "this website is slow".
 *
 * Behaviour:
 * - It runs its full fixed timeline on every full page load and is deliberately
 *   NOT tied to network/data readiness — the app's first requests settle behind
 *   it, so the user never sees a half-built "Loading…" page. Timings live in one
 *   place: `--page-intro-hold` / `--page-intro-fade` in globals.css.
 * - Client-side navigation does not replay it (this component lives in AppFrame,
 *   which is mounted once per full load).
 * - The timeline is CSS-driven, so it starts with the first paint and completes
 *   even if hydration is slow; JS only unmounts the overlay and releases the
 *   scroll lock.
 *
 * Accessibility: decorative (`aria-hidden`), never focusable, no infinite
 * motion, and no rise/scale motion for `prefers-reduced-motion` users.
 */

const SPLASH_SELECTOR = "[data-page-intro]";
const SCROLL_LOCK_CLASS = "intro-scroll-lock"; // defined in globals.css
const FALLBACK_MS = 3000; // only used when the CSS timeline cannot be read

// Layout effect on the client, plain effect on the server where it never runs.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * How much of the CSS timeline is still left. Reading it from the element keeps
 * JS and globals.css in sync and lets this timer simply be a safety net for the
 * (rare) case where `animationend` never arrives.
 */
function splashRemainingMs() {
  const splash = document.querySelector(SPLASH_SELECTOR);
  if (!splash || typeof splash.getAnimations !== "function") return FALLBACK_MS;
  const animations = splash.getAnimations();
  if (animations.length === 0) return FALLBACK_MS; // e.g. stylesheet not applied
  const now = performance.now();
  const remaining = animations.reduce((max, animation) => {
    const timing = animation.effect.getTiming();
    const end = (animation.startTime ?? now) + timing.delay + timing.duration;
    return Math.max(max, end - now);
  }, 0);
  return remaining + 400; // small grace so `animationend` wins the race
}

// True while the splash can still be seen. With a very slow bundle the CSS
// timeline may already be over by now, and then nothing should be locked.
function isSplashOnScreen() {
  const splash = document.querySelector(SPLASH_SELECTOR);
  if (!splash) return false;
  if (typeof splash.getAnimations !== "function") return true;
  return splash.getAnimations().every((a) => a.playState !== "finished");
}

export default function PageIntroLoader() {
  const [visible, setVisible] = useState(true);
  const safetyTimer = useRef(null);

  const dismiss = useCallback(() => {
    window.clearTimeout(safetyTimer.current);
    // The component stays mounted (it only renders nothing), so the effect
    // cleanup below does not run here — release the lock explicitly.
    document.documentElement.classList.remove(SCROLL_LOCK_CLASS);
    setVisible(false);
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (isSplashOnScreen()) {
      document.documentElement.classList.add(SCROLL_LOCK_CLASS);
    }

    safetyTimer.current = window.setTimeout(dismiss, splashRemainingMs());

    return () => {
      window.clearTimeout(safetyTimer.current);
      // Idempotent release: no captured `overflow` value to restore, so React
      // StrictMode's duplicate effect runs can never leave the page locked.
      document.documentElement.classList.remove(SCROLL_LOCK_CLASS);
    };
  }, [dismiss]);

  if (!visible) return null;

  return (
    <div
      data-page-intro=""
      aria-hidden="true"
      className="intro-splash fixed inset-0 z-[999] flex items-center justify-center overflow-hidden bg-white"
      // `animationend` bubbles, so ignore the bar/content animations.
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      {/* One soft brand glow — the only decoration on screen. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_40%_at_50%_48%,rgba(155,231,73,0.16),transparent_70%)]" />

      <div className="intro-splash__content relative flex w-full max-w-xs flex-col items-center px-6 text-center">
        <p className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
          Good Investor
        </p>
        <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.28em] text-neutral-500">
          Market Insights
        </p>

        {/* Determinate hairline: shows real progress instead of spinning. */}
        <div className="mt-7 h-0.5 w-40 overflow-hidden rounded-full bg-neutral-200 sm:w-48">
          <div className="intro-splash__bar h-full w-full rounded-full bg-[#4a8018]" />
        </div>
      </div>
    </div>
  );
}