"use client";

import Link from "next/link";
import { useState } from "react";
import { t } from "@/lib/i18n";
import { CricketGameView } from "./cricket-game";
import { CricketSetupForm } from "./cricket-setup-form";
import { createCricketSetupValues } from "./cricket-setup-state";
import { useCricketMatch } from "./use-cricket-match";
import { CricketResumeDialog } from "./cricket-resume-dialog";
import { getCricketMatchState } from "@/lib/cricket";

export function CricketSetup() {
  // Keep the draft here so returning from a match preserves every form choice.
  const [values, setValues] = useState(createCricketSetupValues);
  const controller = useCricketMatch(values, setValues);
  const { match, matchState } = controller;
  const backLink = <Link href="/play" className="play-back" aria-label={t("games.back")} title={t("games.back")}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m12 19-7-7 7-7M5 12h14" /></svg>
  </Link>;

  if (match && matchState) return <main className="cricket-main">
    <CricketGameView match={match} game={matchState.game} state={matchState.state}
      navigation={backLink} alternative1v1View={values.alternative1v1View}
      series={{ bestOf: match.bestOf, leg: match.legs.length, wins: matchState.wins, winnerId: matchState.winnerId }}
      onRecord={controller.record} onNextLeg={controller.nextLeg}
      onRotateOrder={controller.rotateOrder}
      canRedo={controller.canRedo} onUndo={controller.undo} onRedo={controller.redo}
      onSetup={controller.showSetup} onRematch={controller.rematch} />
  </main>;

  return <>
    <header className="play-header">{backLink}<h1>{t("cricket.name")}</h1></header>
    {controller.ready && <CricketSetupForm values={values} setValues={setValues} onStart={controller.start} />}
    {controller.saved && <CricketResumeDialog names={controller.saved.setup.players.map(player => player.name)}
      finished={Boolean(getCricketMatchState(controller.saved.history.match).winnerId)}
      onResume={controller.resume} onNew={controller.dismissSaved} onDismiss={controller.dismissSaved} />}
  </>;
}
