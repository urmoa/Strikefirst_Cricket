import { getCricketMatchStatistics, type CricketMatch } from "@/lib/cricket";
import { t } from "@/lib/i18n";

export function CricketStatistics({ match, winnerId }: { match: CricketMatch; winnerId: string | null }) {
  const { players } = getCricketMatchStatistics(match);
  const columns = [
    { label: t("cricket.stats.mpr"), values: players.map(player => player.mpr.toLocaleString("et-EE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })) },
    { label: t("cricket.stats.totalScore"), values: players.map(player => player.points) },
    { label: t("cricket.stats.bestRound"), values: players.map(player => player.bestRound) },
    ...(["cricket.stats.zero", "cricket.stats.one", "cricket.stats.two", "cricket.stats.three", "cricket.stats.more"] as const)
      .map((key, index) => ({ label: t(key), values: players.map(player => player.roundsByMarks[index]) })),
    ...match.legs.map((_, index) => ({ label: t("cricket.stats.leg", { leg: index + 1 }), values: players.map(player => player.legPoints[index]) })),
  ];
  return <section className="cricket-statistics cricket-board-panel" aria-labelledby="cricket-statistics-title">
    <h3 id="cricket-statistics-title">{t("cricket.stats.title")}</h3>
    <div className="cricket-statistics-scroll" role="region" aria-labelledby="cricket-statistics-title" tabIndex={0}>
      <table>
        <caption className="cricket-visually-hidden">{t("cricket.stats.title")}</caption>
        <thead><tr><th scope="col">{t("cricket.stats.player")}</th>{columns.map(column =>
          <th scope="col" key={column.label}>{column.label}</th>)}</tr></thead>
        <tbody>{players.map((player, index) => <tr key={player.id}>
          <th scope="row" className={player.id === winnerId ? "cricket-statistics-winner" : undefined}>
            {player.name}{player.id === winnerId && <span className="cricket-statistics-badge">{t("cricket.winner")}</span>}
          </th>
          {columns.map(column => <td key={column.label}>{column.values[index]}</td>)}
        </tr>)}</tbody>
      </table>
    </div>
  </section>;
}
