import { t } from "@/lib/i18n";
﻿import Link from "next/link";
import { games } from "@/lib/games";

export function GameSelection() {
  return (
    <section className="play-games" aria-label={t("games.choose")}>
      {games.map(game => (
        <Link className="play-card bg-panel/80 border border-flight/25" href={`/play/${game.slug}`} key={game.slug}>
          <h2>{game.name}</h2>
          <p className="play-description">{game.description}</p>
        </Link>
      ))}
    </section>
  );
}
