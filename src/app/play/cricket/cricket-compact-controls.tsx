import { t } from "@/lib/i18n";
import type { CricketState, CricketTarget } from "@/lib/cricket";
import { CricketMarkButton } from "./cricket-mark-button";

export function CricketCompactControls({ state, onMark, onPass }: {
  state: CricketState; onMark: (target: CricketTarget) => void; onPass: () => void;
}) {
  return <div className="cricket-compact-controls" role="group" aria-label={t("cricket.enterMarks")}>
    {state.targets.map(target => <CricketMarkButton key={target} state={state} target={target} onMark={onMark} />)}
    <button type="button" className="cricket-table-input cricket-table-pass cricket-submit"
      disabled={Boolean(state.winnerId)} onClick={onPass}>{t("cricket.submitMarks")}</button>
  </div>;
}
