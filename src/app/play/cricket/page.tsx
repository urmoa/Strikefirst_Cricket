// Keep shared styles before component overrides so the cascade is explicit.
import "./cricket-typography.css";
import "./cricket.css";
import "./cricket-setup.css";
import "./cricket-game.css";
import "./cricket-scoreboard.css";
import "./cricket-controls.css";
import "./cricket-resume-dialog.css";
import { t } from "@/lib/i18n";
import type { Metadata } from "next";
import { CricketSetup } from "./cricket-setup";

export const metadata: Metadata = {
  title: t("cricket.title"),
  description: t("cricket.description"),
};

export default function CricketPage() {
  return (
    <div className="play-shell cricket-shell">
      <CricketSetup />
    </div>
  );
}
