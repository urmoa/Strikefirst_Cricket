import type { CricketState, CricketTarget } from "@/lib/cricket";
import { isCricketTargetClosed } from "@/lib/cricket";
import { t } from "@/lib/i18n";

export function cricketTargetStyle(state: CricketState, playerIndex: number, target: CricketTarget) {
  if (isCricketTargetClosed(state.players[playerIndex], target)) {
    return { className: "cricket-mark-closed", title: t("cricket.ownTargetClosed") };
  }
  if (state.players.some((player, index) => index !== playerIndex && isCricketTargetClosed(player, target))) {
    return { className: "cricket-mark-vulnerable", title: t("cricket.targetVulnerable") };
  }
  return {};
}
