import { t } from "@/lib/i18n";
import type { CricketState } from "@/lib/cricket";
import { cricketTargetStyle } from "./cricket-target-style";

export function CricketMultiplayerScoreboard({ state, wins, showLegs }: {
  state: CricketState; wins: readonly number[]; showLegs: boolean;
}) {
  return <div className="cricket-multi-scoreboard" role="group" aria-label={t("cricket.scoreboardLabel")}>
    <ul className="cricket-player-cards">{state.players.map((player, index) => {
      const highlighted = state.winnerId === player.id || !state.winnerId && state.activePlayer === index;
      return <li key={player.id} className={highlighted ? "cricket-multi-active" : undefined}>
        <div className={`cricket-multi-player-heading${showLegs ? "" : " cricket-multi-player-heading-single-leg"}`}>
          <div className="cricket-multi-name">
            <h4 title={player.name}>{player.name}</h4>
            <span className="cricket-handicap-summary">{t("cricket.marksToCloseSummary", { count: player.marksToClose })}</span>
            {state.winnerId === player.id && <span className="cricket-player-status">{t("cricket.winner")}</span>}
          </div>
          {showLegs && <div className="cricket-multi-legs">
            <span className="cricket-multi-legs-label">{t("cricket.legsLabel")}</span>
            <strong className="cricket-player-legs" aria-label={wins[index] === 1 ? t("cricket.oneWin") : t("cricket.multipleWins", { count: wins[index] })}>{wins[index]}</strong>
          </div>}
          <div className="cricket-multi-points"><strong>{player.points}</strong><span>{t("cricket.pointsLabel")}</span></div>
        </div>
        <dl className="cricket-multi-marks" style={{ gridTemplateColumns: `repeat(${state.targets.length}, minmax(0, 1fr))` }}>{state.targets.map(target => <div key={target} {...cricketTargetStyle(state, index, target)}>
          <dt>{target === 25 ? t("cricket.bull") : target}</dt><dd>{player.marks[target] + player.scoringMarks[target]}/{player.marksToClose}</dd>
        </div>)}</dl>
      </li>;
    })}</ul>
  </div>;
}
