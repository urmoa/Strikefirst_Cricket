import { useLayoutEffect, useRef, type FocusEvent } from "react";

// Remember focus before a render can disable or remove its element.
export function useCricketFocus() {
  const focused = useRef<HTMLElement | null>(null);
  const root = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const previous = focused.current;
    if (!previous || !root.current) return;
    if (previous.isConnected && !previous.matches(":disabled") && previous.getClientRects().length) return;
    // A deliberate focus move (for example to the winner heading) takes precedence.
    const active = document.activeElement;
    if (active && active !== document.body && active !== previous && !active.matches(":disabled")) return;
    const fallback = root.current.querySelector<HTMLElement>(".cricket-hit-grid button:not(:disabled), .cricket-table-input:not(:disabled), .cricket-turn-actions button:not(:disabled)")
      ?? root.current.querySelector<HTMLElement>("button:not(:disabled), input:not(:disabled)");
    fallback?.focus();
  });
  return {
    ref: root,
    onFocusCapture: (event: FocusEvent<HTMLElement>) => { focused.current = event.target as HTMLElement; },
  };
}
