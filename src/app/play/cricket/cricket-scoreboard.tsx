import { t } from "@/lib/i18n";
import { isCricketTargetClosed, type CricketState, type CricketInputMode, type CricketTarget } from "@/lib/cricket";
import { cricketTargetStyle } from "./cricket-target-style";
import { CricketMarkButton } from "./cricket-mark-button";

export function CricketScoreboard({ state, wins, showLegs, inputMode, onMark, onPass }: {
  state: CricketState; wins: readonly number[]; showLegs: boolean; inputMode: CricketInputMode;
  onMark: (target: CricketTarget) => void; onPass: () => void;
}) {
  const compact = inputMode === "marks";
  return <table className="cricket-scoreboard" aria-label={t("cricket.scoreboardLabel")}>
    <thead>
    {showLegs && <tr className="cricket-legs-row">
      <td>{wins[0]}</td>
      <th scope="row">{t("cricket.legsLabel")}</th>
      <td>{wins[1]}</td>
    </tr>}
    <tr>
      <th scope="col"><Player index={0} state={state} /></th>
      <th scope="col">{compact ? <button type="button" className="cricket-table-input cricket-table-pass"
        disabled={Boolean(state.winnerId)} onClick={onPass} aria-label={t("cricket.passTurn")}>
        {t("cricket.target")}
        <span className="cricket-mark-count" aria-label={t("cricket.markCount", { count: state.turnMarks.length })}>{state.turnMarks.length}</span>
      </button> : t("cricket.target")}</th>
      <th scope="col"><Player index={1} state={state} /></th>
    </tr></thead>
    <tbody>{state.targets.map(target => {
      const closed = state.players.every(player => isCricketTargetClosed(player, target));
      return <tr key={target} className={closed ? "cricket-closed" : undefined}>
        <td {...cricketTargetStyle(state, 0, target)}>{state.players[0].marks[target] + state.players[0].scoringMarks[target]}/{state.players[0].marksToClose}</td>
        <th scope="row">{compact ? <CricketMarkButton state={state} target={target} onMark={onMark} />
          : target === 25 ? t("cricket.bull") : target}
          <span className="cricket-target-status">{closed ? t("cricket.targetClosed") : "\u00a0"}</span>
        </th>
        <td {...cricketTargetStyle(state, 1, target)}>{state.players[1].marks[target] + state.players[1].scoringMarks[target]}/{state.players[1].marksToClose}</td>
      </tr>;
    })}</tbody>
  </table>;
}

function Player({ index, state }: { index: number; state: CricketState }) {
  const player = state.players[index];
  const status = state.winnerId === player.id ? t("cricket.winner") :
    state.winnerId === null && state.activePlayer === index ? t("cricket.throwing") : "\u00a0";
  const highlighted = state.winnerId === player.id || state.winnerId === null && state.activePlayer === index;
  return <div className={highlighted ? "cricket-active" : undefined}>
    <span className="cricket-player-name" title={player.name}>{player.name}</span>
    <span className="cricket-player-status">{status}</span>
    <strong className="cricket-points">{player.points}</strong><span> {t("common.points")}</span>
  </div>;
}
