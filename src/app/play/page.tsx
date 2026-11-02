import { t } from "@/lib/i18n";
import type { Metadata } from "next";
import Link from "next/link";
import { GameSelection } from "./game-selection";

export const metadata: Metadata = {
  title: t("games.metadataTitle"),
  description: t("games.description"),
};

export default function PlayPage() {
  return (
    <div className="play-shell">
      <header className="play-header">
        <Link href="/" className="play-brand" aria-label={t("home.brandLink")}>STRIKE<span>FIRST</span></Link>
        <Link href="/" className="play-back"><span aria-hidden="true">←</span> {t("common.back")}</Link>
      </header>
      <main>
        <div className="play-intro">
          <h1>{t("games.title")}</h1>
        </div>
        <GameSelection />
      </main>
      <footer className="play-footer">{t("games.footer")}</footer>
    </div>
  );
}
