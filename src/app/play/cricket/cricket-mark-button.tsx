import { t } from "@/lib/i18n";
import type { CricketState, CricketTarget } from "@/lib/cricket";
import { canRecordCricketMark } from "@/lib/cricket";

export function CricketMarkButton({ state, target, onMark }: {
  state: CricketState; target: CricketTarget; onMark: (target: CricketTarget) => void;
}) {
  const label = target === 25 ? t("cricket.bull") : target;
  return <button type="button" className="cricket-table-input"
    aria-label={t("cricket.addMark", { target: label })}
    disabled={!canRecordCricketMark(state, target)}
    onClick={() => onMark(target)}>{label}
    {state.turnMarks.filter(mark => mark === target).map((_, index) =>
      <span key={index} className="cricket-mark-ring" aria-hidden="true" />)}
  </button>;
}
