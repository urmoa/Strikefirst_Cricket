"use client";

import { useEffect, useRef, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { t } from "@/lib/i18n";
import { CRICKET_AVAILABLE_TARGETS, CRICKET_TARGETS, normalizeCricketTargets, type CricketLegFormat, type CricketTarget, type CricketVariant } from "@/lib/cricket";
import { CricketPlayerPicker } from "./cricket-player-picker";
import { getCricketSetupVariant, type CricketSetupPlayer, type CricketSetupValues } from "./cricket-setup-state";

export function CricketSetupForm({ values, setValues, onStart }: {
  values: CricketSetupValues;
  setValues: Dispatch<SetStateAction<CricketSetupValues>>;
  onStart: (values: CricketSetupValues) => void;
}) {
  const { players, bestOf, targets, alternative1v1View } = values;
  const names = players.map(player => player.name);
  const variant = getCricketSetupVariant(values);
  const form = useRef<HTMLFormElement>(null);
  const startButton = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);

  const setPlayers: Dispatch<SetStateAction<CricketSetupPlayer[]>> = update => setValues(current => ({
    ...current, players: typeof update === "function" ? update(current.players) : update,
  }));
  const setTargets: Dispatch<SetStateAction<CricketTarget[]>> = update => setValues(current => ({
    ...current, targets: typeof update === "function" ? update(current.targets) : update,
  }));
  const setBestOf = (bestOf: CricketLegFormat) => setValues(current => ({ ...current, bestOf }));
  const setVariant = (selectedVariant: CricketVariant) => setValues(current => ({ ...current, selectedVariant }));
  const setAlternative1v1View = (alternative1v1View: boolean) => setValues(current => ({ ...current, alternative1v1View }));

  function startGame(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (players.length < 2 || players.length > 6 || !event.currentTarget.reportValidity()) return;
    onStart({ ...values, targets: normalizeCricketTargets(targets) });
  }

  return <>
    <main className="cricket-main cricket-setup-main">
    <section className="cricket-setup" aria-labelledby="cricket-setup-title">
      <h2 id="cricket-setup-title" className="cricket-visually-hidden" tabIndex={-1} ref={heading}>
        {t("cricket.setup")}
      </h2>
        <form ref={form} id="cricket-setup-form" className="cricket-setup-form" onSubmit={startGame}>
          <details className="cricket-advanced cricket-description">
            <summary>{t("cricket.gameDescription")}<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></summary>
            <p className="play-description">{t(variant === "cutthroat" ? "cricket.cutthroatRules" : "cricket.rules")}</p>
          </details>
          <CricketPlayerPicker players={players} setPlayers={setPlayers}
            guestName={values.guestName} setGuestName={guestName => setValues(current => ({ ...current, guestName }))}
            startButton={startButton} />
          <div className="cricket-setup-block">
          <fieldset className="cricket-leg-format">
            <legend className="cricket-visually-hidden">{names.length === 2 ? t("cricket.legFormat") : t("cricket.legsRequired")}</legend>
            {([1, 3, 5] as const).map(format => <label key={format}>
              <input type="radio" name="leg-format" value={format} checked={bestOf === format}
                onChange={() => setBestOf(format)} />
              <span>{names.length > 2 ? format === 1 ? t("cricket.oneWin") : t("cricket.multipleWins", { count: Math.floor(format / 2) + 1 }) : format === 1 ? t("cricket.oneLeg") : t("cricket.bestOf", { legs: format, wins: Math.floor(format / 2) + 1 })}</span>
            </label>)}
          </fieldset>
          </div>
          <details className="cricket-advanced">
            <summary>{t("cricket.advanced")}<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></summary>
            <label className="cricket-checkbox-option">
              <input type="checkbox" checked={alternative1v1View}
                onChange={event => setAlternative1v1View(event.target.checked)} />
              <span>{t("cricket.alternative1v1View")}</span>
            </label>
            <fieldset className="cricket-starter">
              <legend>{t("cricket.scoringMode")}</legend>
              {(["standard", "cutthroat"] as const).map(mode => <label key={mode}>
                <input type="radio" name="scoring-mode" value={mode} checked={variant === mode}
                  onChange={() => setVariant(mode)} />
                {t(mode === "standard" ? "cricket.standard" : "cricket.cutthroat")}
              </label>)}
            </fieldset>
            <fieldset className="cricket-target-picker">
              <legend>{t("cricket.targetsLabel")}</legend>
              <div className="cricket-target-actions">
              <button type="button" className="cricket-button" onClick={() => {
                const shuffled = [...CRICKET_AVAILABLE_TARGETS];
                for (let index = shuffled.length - 1; index > 0; index--) {
                  const randomIndex = Math.floor(Math.random() * (index + 1));
                  [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
                }
                setTargets(normalizeCricketTargets(shuffled.slice(0, 8)));
              }}>{t("cricket.randomTargets")}</button>
              <button type="button" className="cricket-button" onClick={() => setTargets([...CRICKET_TARGETS])}>
                {t("cricket.standardTargets")}
              </button>
              </div>
              <p role="status" aria-live="polite" aria-atomic="true">{t("cricket.targetsCount", { count: targets.length })}</p>
              <div className="cricket-target-options">
                {([...CRICKET_AVAILABLE_TARGETS.filter(target => target !== 25).reverse(), 25] as const).map(target => {
                  const selected = targets.includes(target);
                  return <button key={target} type="button" className="cricket-button" aria-pressed={selected}
                    disabled={selected ? targets.length === 1 : targets.length >= 8}
                    onClick={() => setTargets(current => {
                      const exists = current.includes(target);
                      if (exists ? current.length <= 1 : current.length >= 8) return current;
                      return normalizeCricketTargets(exists ? current.filter(value => value !== target) : [...current, target]);
                    })}>{target === 25 ? t("cricket.bull") : target}</button>;
                })}
              </div>
            </fieldset>
          </details>
        </form>
    </section>
    </main>
    <footer className="cricket-setup-footer">
      <button ref={startButton} className="cricket-button cricket-primary" type="submit" form="cricket-setup-form" disabled={names.length < 2}>{t("cricket.start")}</button>
    </footer>
  </>;
}
