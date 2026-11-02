import { t } from "@/lib/i18n";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: t("x01.title"),
  description: t("x01.description"),
};

const gameTypes = [
  { value: "501", name: "501", subtitle: "SI/DO" },
  { value: "1001", name: "1001", subtitle: "SI/DO" },
  { value: "170", name: "170", subtitle: "SI/DO" },
  { value: "301", name: "301", subtitle: "SI/DO" },
  { value: "401", name: "401", subtitle: "SI/DO" },
  { value: "dido-501", name: "DIDO", subtitle: "501" },
] as const;

export default function X01Page() {
  return (
    <div className="x01-shell">
      <Link href="/play" className="play-back"><span aria-hidden="true">←</span> {t("common.back")}</Link>
      <main>
        <h1 id="x01-type-title" className="x01-title">{t("x01.gameType")}</h1>
        <fieldset className="x01-types" aria-labelledby="x01-type-title">
          {gameTypes.map(gameType => (
            <label className="x01-type" key={gameType.value}>
              <input type="radio" name="gameType" value={gameType.value} />
              <span className="x01-type-name">{gameType.name}</span>
              <span className="x01-type-subtitle">{gameType.subtitle}</span>
            </label>
          ))}
        </fieldset>
        <button type="button" className="x01-more" disabled title={t("x01.moreHint")}>{t("x01.more")}</button>
      </main>
      <Link href="/play" className="play-back"><span aria-hidden="true">←</span> {t("common.back")}</Link>
    </div>
  );
}
