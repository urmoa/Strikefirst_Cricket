"use client";

import { useEffect, useRef } from "react";
import { t } from "@/lib/i18n";

export function CricketResumeDialog({ names, finished = false, onResume, onNew, onDismiss }: {
  names: string[];
  finished?: boolean;
  onResume: () => void;
  onNew: () => void;
  onDismiss: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const previousFocus = document.activeElement as HTMLElement | null;
    dialog.showModal();
    return () => {
      dialog.close();
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  return <dialog ref={ref} className="cricket-resume-dialog" aria-labelledby="cricket-resume-title"
    aria-describedby="cricket-resume-description cricket-resume-players"
    onKeyDown={event => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); onDismiss(); }
    }}
    onCancel={event => { event.preventDefault(); onDismiss(); }}>
    <h2 id="cricket-resume-title">{t(finished ? "cricket.stats.savedTitle" : "cricket.resumeTitle")}</h2>
    <p id="cricket-resume-description">{t(finished ? "cricket.stats.savedDescription" : "cricket.resumeDescription")}</p>
    <p id="cricket-resume-players" className="cricket-resume-players">{names.join(" – ")}</p>
    <div className="cricket-resume-actions">
      <button type="button" className="cricket-resume-continue" autoFocus onClick={onResume}>{t(finished ? "cricket.stats.open" : "cricket.resume")}</button>
      <button type="button" onClick={onNew}>{t("cricket.startNew")}</button>
    </div>
  </dialog>;
}
