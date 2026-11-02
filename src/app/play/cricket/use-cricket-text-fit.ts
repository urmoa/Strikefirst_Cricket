"use client";

import { useEffect, useRef } from "react";

/** Measure with the normal font scale so compact text cannot toggle itself off. */
export function useCricketTextFit() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const game = ref.current;
    if (!game) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        game.removeAttribute("data-compact-text");
        const main = game.closest("main");
        const shell = game.closest(".cricket-shell");
        const bottomSpace = [main, shell].reduce((total, element) =>
          total + (element ? parseFloat(getComputedStyle(element).paddingBottom) || 0 : 0), 0);
        const viewport = document.documentElement;
        const overflow = game.getBoundingClientRect().bottom + window.scrollY + bottomSpace > viewport.clientHeight ||
          viewport.scrollWidth > viewport.clientWidth;
        game.toggleAttribute("data-compact-text", overflow);
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(game);
    window.addEventListener("resize", measure);
    document.fonts.addEventListener("loadingdone", measure);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", measure);
      document.fonts.removeEventListener("loadingdone", measure);
    };
  }, []);

  return ref;
}
