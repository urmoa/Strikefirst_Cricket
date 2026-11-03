import { t } from "@/lib/i18n";
import { isCricketTargetClosed } from "@/lib/cricket";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { CricketEvent, CricketGame, CricketMatch, CricketState, CricketThrow, CricketLegFormat } from "@/lib/cricket";
import { CricketStatistics } from "./cricket-statistics";
import { CricketScoreboard } from "./cricket-scoreboard";
import { CricketControls } from "./cricket-controls";
import { CricketCompactControls } from "./cricket-compact-controls";
import { CricketMultiplayerScoreboard } from "./cricket-multiplayer-scoreboard";
import { useCricketTextFit } from "./use-cricket-text-fit";
import { useCricketInputMode } from "./use-cricket-input-mode";
import { useCricketFocus } from "./use-cricket-focus";

function throwLabel(dart: CricketThrow) {
  if (dart.type === "miss") return t("cricket.miss");
  if (dart.target === 25) return t("cricket.bullValue", { value: dart.multiplier * 25 });
  return t("cricket.dartNotation", { prefix: t((["cricket.singleSummaryPrefix", "cricket.doublePrefix", "cricket.triplePrefix"] as const)[dart.multiplier - 1]), target: dart.target });
}

function BoardPanel({ bare, children }: { bare: boolean; children: ReactNode }) {
  return bare ? <>{children}</> : <div className="cricket-board-panel">{children}</div>;
}

export function CricketGameView({ match, game, state, series, navigation, alternative1v1View, onNextLeg, onRotateOrder, onRecord: recordEvent, onUndo: undo, onRedo: redo, canRedo, onSetup, onRematch }: {
  match: CricketMatch;
  navigation: ReactNode;
  alternative1v1View: boolean;
  game: CricketGame; state: CricketState; onRecord: (event: CricketEvent) => void;
  series: { bestOf: CricketLegFormat; leg: number; wins: number[]; winnerId: string | null };
  onNextLeg: () => void;
  onRotateOrder: () => void;
  onUndo: () => void; onRedo: () => void; canRedo: boolean; onSetup: () => void; onRematch: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const gameRef = useCricketTextFit();
  const focus = useCricketFocus();
  const [notice, setNotice] = useState("");
  const canUndo = Boolean(game.events.length || series.leg > 1);
  const onUndo = () => { if (canUndo) { undo(); setNotice(t("keyboard.undone")); } };
  const onRedo = () => { if (canRedo) { redo(); setNotice(t("keyboard.redone")); } };
  function onRecord(event: CricketEvent) {
    if (state.winnerId) return;
    recordEvent(event);
    const result = event.type === "hit" || event.type === "miss" ? throwLabel(event)
      : event.type === "mark" ? t("keyboard.previewMark", { target: event.target === 25 ? t("cricket.bull") : event.target }) : t("cricket.endTurn");
    setNotice(t("keyboard.recorded", { result }));
  }
  const winner = state.players.find(player => player.id === state.winnerId);
  const active = state.players[state.activePlayer];
  const multiplayer = state.players.length > 2 || !alternative1v1View;
  const inputMode = useCricketInputMode(state.players.length, state.turnMode);
  const compact = inputMode === "marks";
  const bareBoard = multiplayer && compact;
  useEffect(() => {
    if (state.winnerId) heading.current?.focus();
    else {
      const control = gameRef.current?.querySelector<HTMLElement>(".cricket-hit-grid button:not(:disabled), .cricket-table-input:not(:disabled)");
      (control ?? heading.current)?.focus({ preventScroll: true });
    }
  }, [state.winnerId, series.leg, gameRef]);
  const last = state.lastTurn;
  return <section ref={element => { gameRef.current = element; focus.ref.current = element; }}
    onFocusCapture={focus.onFocusCapture}
    onKeyDown={event => {
      if (event.repeat && (event.key === "Enter" || event.key === " ") && (event.target as HTMLElement).closest("button")) {
        event.preventDefault(); return;
      }
      if (event.defaultPrevented || event.nativeEvent.isComposing || event.repeat || event.altKey || !(event.ctrlKey || event.metaKey)) return;
      const target = event.target as HTMLElement;
      if (target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
      const key = event.key.toLowerCase();
      if (key === "z" && !event.shiftKey && canUndo) { event.preventDefault(); onUndo(); }
      else if ((key === "z" && event.shiftKey || key === "y" && event.ctrlKey && !event.metaKey && !event.shiftKey) && canRedo) { event.preventDefault(); onRedo(); }
    }} className={`cricket-game${multiplayer ? " cricket-multiplayer" : " cricket-headsup"}${compact ? " cricket-table-entry" : ""}`} aria-labelledby="cricket-game-title">
    <h2 id="cricket-game-title" className={!winner ? "cricket-visually-hidden" : undefined} tabIndex={-1} ref={heading}>
      {winner ? series.winnerId ? t("cricket.won", { name: winner.name }) : t("cricket.legWon", { name: winner.name }) : t("cricket.playing")}
    </h2>
    <div className="cricket-match-header">
    {navigation}
    <div className="cricket-series" aria-label={t("cricket.seriesScore")}>
      <p>{t(game.variant === "cutthroat" ? "cricket.cutthroat" : "cricket.standard")}</p>
      <p>{t("cricket.compactLeg", { leg: series.leg, total: series.bestOf })}</p>
    </div>
      <div className="cricket-history-actions" role="group" aria-label={t("cricket.correctInput")}>
        <button className="cricket-button" type="button" disabled={!canUndo} aria-keyshortcuts="Control+z Meta+z" onClick={onUndo}>{t("cricket.undo")}</button>
        <button className="cricket-button" type="button" disabled={!canRedo} aria-keyshortcuts="Control+Shift+z Meta+Shift+z Control+y" onClick={onRedo}>{t("cricket.redo")}</button>
      </div>
    </div>
    <p className="cricket-visually-hidden" aria-live="polite" aria-atomic="true">
      {notice}{" "}
      {winner ? t("cricket.winnerAnnouncement", { label: t(series.winnerId ? "cricket.matchWinner" : "cricket.legWinner"), name: winner.name, score: series.wins.join(" : ") }) : compact
        ? t("cricket.markAnnouncement", { name: active.name, round: state.round, count: state.turnMarks.length })
        : t("cricket.turnAnnouncement", { name: active.name, round: state.round, dart: state.turnThrows.length + 1 })}
      {" "}{state.players.map((player, index) => t("cricket.pointsAnnouncement", { number: index + 1, points: player.points })).join(" ")}
    </p>
    <div className={`cricket-game-layout${winner ? " cricket-finished-layout" : ""}`}>
      <BoardPanel bare={bareBoard}>
        {multiplayer ? <CricketMultiplayerScoreboard state={state} wins={series.wins} showLegs={series.bestOf > 1} /> : <CricketScoreboard state={state} wins={series.wins} showLegs={series.bestOf > 1}
          inputMode={inputMode} onMark={target => onRecord({ type: "mark", target })}
          onPass={() => onRecord({ type: "end-turn", mode: inputMode })} />}
        <div className={`cricket-last-turn${bareBoard ? " cricket-last-turn-panel" : ""}`}>
          <h3>{t("cricket.lastTurn")}</h3>
          <p>{last ? t("cricket.lastTurnSummary", {
            name: state.players.find(player => player.id === last.playerId)?.name ?? "",
            darts: last.mode === "marks" ? state.targets.filter(target => last.marks.includes(target))
              .map(target => t("cricket.markSummary", { target: target === 25 ? t("cricket.bull") : target,
                count: last.marks.filter(mark => mark === target).length })).join(", ") || t("cricket.miss")
              : Array.from({ length: 3 }, (_, index) => throwLabel(last.throws[index] ?? { type: "miss" })).join(", "),
          }) : t("cricket.noLastTurn")}</p>
          {match.legs.length === 1 && game.events.length === 0 && <button className="cricket-button" type="button"
            onClick={() => { setNotice(""); onRotateOrder(); }}>{t("cricket.rotateOrder")}</button>}
        </div>
      </BoardPanel>
      {winner && <CricketStatistics match={match} winnerId={series.winnerId ?? state.winnerId} />}
      {!winner && bareBoard && <CricketCompactControls state={state}
        onMark={target => onRecord({ type: "mark", target })}
        onPass={() => onRecord({ type: "end-turn", mode: "marks" })} />}
      {!winner && !compact && <div className="cricket-input-panel">
      <CricketControls disabled={Boolean(winner)} onRecord={onRecord} turnThrows={state.turnThrows} targets={state.targets}
        closedTargets={state.targets.filter(target => state.players.every(player => isCricketTargetClosed(player, target)))} />
      </div>}
    </div>
    {winner && <div className="cricket-actions">
      {winner && !series.winnerId && <button className="cricket-button cricket-primary" type="button" onClick={() => { setNotice(""); onNextLeg(); }}>{t("cricket.nextLeg")}</button>}
      {series.winnerId && <button className="cricket-button cricket-primary" type="button" onClick={() => { setNotice(""); onRematch(); }}>{t("cricket.rematch")}</button>}
      {series.winnerId && <button className="cricket-button" type="button" onClick={onSetup}>{t("cricket.changeSetup")}</button>}
    </div>}
  </section>;
}
