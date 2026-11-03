import "./play.css";
import { t } from "@/lib/i18n";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { clubLogoSrc } from "./club-logo";
import { GameSelection } from "./game-selection";

export const metadata: Metadata = {
  title: t("games.metadataTitle"),
  description: t("games.description"),
};

export default function PlayPage() {
  return (
    <div className="play-shell game-selection-page">
      <header className="play-header">
        <Link href="/" className="play-brand" aria-label={t("home.brandLink")}>
          <Image className="play-club-logo" src={clubLogoSrc} width={40} height={40} alt="" unoptimized />
          {t("site.brand")}
        </Link>
        <details className="play-menu">
          <summary aria-label={t("games.menu")}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M5 6h14M5 12h14M5 18h14" />
            </svg>
          </summary>
          <nav aria-label={t("games.menu")}>
            <Link href="/">{t("home.title")}</Link>
            <Link href="/play" aria-current="page">{t("games.title")}</Link>
          </nav>
        </details>
      </header>
      <main className="play-selection-main">
        <div className="play-intro">
          <p className="play-intro-eyebrow">{t("games.eyebrow")}</p>
          <h1>{t("games.selectionTitle")}</h1>
          <p className="play-intro-description">{t("games.selectionDescription")}</p>
        </div>
        <GameSelection />
      </main>
      <footer className="play-footer">{t("games.footer")}</footer>
    </div>
  );
}
