import "./game-selection.css";
import { t } from "@/lib/i18n";
﻿import Link from "next/link";
import { games } from "@/lib/games";
import Image from "next/image";
import { cricketIconSrc } from "./cricket-icon";

export function GameSelection() {
  return (
    <section className="play-games" aria-label={t("games.choose")}>
      {games.map(game => (
        <Link className={`play-card bg-panel/80 border border-flight/25${game.slug === "cricket" ? " play-card-cricket" : ""}`} href={`/play/${game.slug}`} key={game.slug}>
          {game.slug === "cricket" && (
            <span className="play-game-icon-frame" aria-hidden="true">
              <Image
                className="play-game-icon"
                src={cricketIconSrc}
                alt=""
                width={40}
                height={40}
                unoptimized
              />
            </span>
          )}
          <h2>{game.name}</h2>
          <p className="play-description">{game.description}</p>
          {game.slug === "cricket" && (
            <>
              <div className="play-game-tags">
                <span>{t("games.cricketPlayers")}</span>
                <span>{t("games.cricketFormat")}</span>
              </div>
              <span className="play-game-open">
                {t("games.open")}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M4 12h15M12 5l7 7-7 7" />
                </svg>
              </span>
            </>
          )}
        </Link>
      ))}
    </section>
  );
}
