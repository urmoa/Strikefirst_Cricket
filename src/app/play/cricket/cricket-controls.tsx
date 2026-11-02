import { t } from "@/lib/i18n";
import type { CricketEvent, CricketTarget, CricketThrow } from "@/lib/cricket";

export function CricketControls({ disabled, closedTargets, onRecord, turnThrows, targets }: {
  disabled: boolean; onRecord: (event: CricketEvent) => void;
  closedTargets: readonly CricketTarget[];
  targets: readonly CricketTarget[];
  turnThrows: readonly CricketThrow[];
}) {
  function selection(event: CricketThrow) {
    const count = turnThrows.filter(dart => dart.type === event.type &&
      (dart.type === "miss" || event.type === "hit" && dart.target === event.target && dart.multiplier === event.multiplier)).length;
    return {
      "data-selected-count": count || undefined,
      "aria-description": count ? t("cricket.selectedThrows", { count }) : undefined,
    };
  }

  return <fieldset className="cricket-controls" disabled={disabled}>
    <legend className="cricket-visually-hidden">{t("cricket.enterDart")}</legend>
    <div className="cricket-hit-grid">
      {targets.filter(target => target !== 25).map(target => <div className="cricket-hit-row" key={target}>
        {([1, 2, 3] as const).map(multiplier => <button type="button" className="cricket-button" key={multiplier}
          {...selection({ type: "hit", target, multiplier })}
          disabled={closedTargets.includes(target)} title={closedTargets.includes(target) ? t("cricket.closed") : undefined}
          aria-label={t((["cricket.singleHit", "cricket.doubleHit", "cricket.tripleHit"] as const)[multiplier - 1], { target })}
          onClick={() => onRecord({ type: "hit", target, multiplier })}>{t("cricket.dartNotation", {
            prefix: t((["cricket.singlePrefix", "cricket.doublePrefix", "cricket.triplePrefix"] as const)[multiplier - 1]), target,
          })}</button>)}
      </div>)}
    </div>
    {targets.includes(25) && <div className="cricket-bulls">
      <button type="button" className="cricket-button" {...selection({ type: "hit", target: 25, multiplier: 1 })} disabled={closedTargets.includes(25)} title={closedTargets.includes(25) ? t("cricket.closed") : undefined} onClick={() => onRecord({ type: "hit", target: 25, multiplier: 1 })}>{t("cricket.bullValue", { value: 25 })}</button>
      <button type="button" className="cricket-button" {...selection({ type: "hit", target: 25, multiplier: 2 })} disabled={closedTargets.includes(25)} title={closedTargets.includes(25) ? t("cricket.closed") : undefined} onClick={() => onRecord({ type: "hit", target: 25, multiplier: 2 })}>{t("cricket.bullValue", { value: 50 })}</button>
    </div>}
    <div className="cricket-turn-actions">
      <button type="button" className="cricket-button cricket-miss" {...selection({ type: "miss" })} onClick={() => onRecord({ type: "miss" })}>{t("cricket.missButton")}</button>
      <button type="button" className="cricket-button cricket-miss cricket-primary" onClick={() => onRecord({ type: "end-turn" })}>{t("cricket.endTurn")}</button>
    </div>
  </fieldset>;
}
