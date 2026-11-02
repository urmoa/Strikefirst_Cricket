import { t } from "@/lib/i18n";
﻿import Link from "next/link";

// The real club homepage belongs to the parent site. This is only a local entry.
export default function LocalHome() {
  return (
    <main className="local-entry">
      <p className="play-eyebrow">{t("site.brand")}</p>
      <h1>{t("home.title")}</h1>
      <p>{t("home.description")}</p>
      <Link className="play-button bg-flight text-white" href="/play">{t("home.openGames")} <span aria-hidden="true">↗</span></Link>
    </main>
  );
}
