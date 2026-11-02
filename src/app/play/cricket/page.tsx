import "../../../../styles/cricket-typography.css";
import "../../../../styles/cricket.css";
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
