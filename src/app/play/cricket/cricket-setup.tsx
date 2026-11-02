"use client";

import { t } from "@/lib/i18n";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { CRICKET_AVAILABLE_TARGETS, CRICKET_TARGETS, normalizeCricketTargets,
  createCricketMatch, getCricketMatchState, recordCricketMatchEvent, nextCricketLeg, undoCricketMatchInput,
  type CricketEvent, type CricketMatch, type CricketLegFormat, type CricketVariant, type CricketTarget } from "@/lib/cricket";
import { CricketGameView } from "./cricket-game";

export function CricketSetup() {
  const [players, setPlayers] = useState<{ id: number; name: string; marksToClose: number }[]>([]);
  const names = players.map(player => player.name);
  const nextPlayerId = useRef(1);
  const pendingFocus = useRef<"guest" | "start" | number | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const startButton = useRef<HTMLButtonElement>(null);
  const [guestName, setGuestName] = useState("");
  const [bestOf, setBestOf] = useState<CricketLegFormat>(1);
  const [targets, setTargets] = useState<CricketTarget[]>(() => [...CRICKET_TARGETS]);
  const [alternative1v1View, setAlternative1v1View] = useState(true);
  const [selectedVariant, setVariant] = useState<CricketVariant | null>(null);
  const variant = selectedVariant ?? (names.length > 2 ? "cutthroat" : "standard");
  const [history, setHistory] = useState<{ match: CricketMatch | null; redo: CricketMatch[] }>({ match: null, redo: [] });
  const { match } = history;
  function setMatch(update: CricketMatch | null | ((current: CricketMatch | null) => CricketMatch | null)) {
    setHistory(current => {
      const next = typeof update === "function" ? update(current.match) : update;
      return next === current.match ? current : { match: next, redo: [] };
    });
  }
  const heading = useRef<HTMLHeadingElement>(null);
  const guestInput = useRef<HTMLInputElement>(null);
  useEffect(() => { if (!match) heading.current?.focus(); }, [match]);
  useLayoutEffect(() => {
    const target = pendingFocus.current;
    if (target === null || match) return;
    pendingFocus.current = null;
    if (target === "start") startButton.current?.focus();
    else if (target === "guest") guestInput.current?.focus();
    else form.current?.querySelector<HTMLInputElement>(`[data-player-id="${target}"] input`)?.focus();
  });

  function addGuest() {
    const name = guestName.trim();
    if (!name || names.length >= 6) return;
    const id = nextPlayerId.current++;
    setPlayers(previous => previous.length < 6 ? [...previous, { id, name, marksToClose: 3 }] : previous);
    pendingFocus.current = names.length === 5 ? "start" : "guest";
    setGuestName("");
  }

  function movePlayer(index: number, direction: -1 | 1) {
    if (index + direction === 0 || index + direction === names.length - 1) pendingFocus.current = players[index].id;
    setPlayers(previous => {
      const target = index + direction;
      if (target < 0 || target >= previous.length) return previous;
      const reordered = [...previous];
      [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
      return reordered;
    });
  }

  function mayDiscard() {
    return !match || !match.legs.some(leg => leg.events.length) || getCricketMatchState(match).winnerId !== null ||
      window.confirm(t("cricket.discard"));
  }
  function record(event: CricketEvent) {
    setMatch(current => {
      if (!current || getCricketMatchState(current).state.winnerId !== null) return current;
      try { return recordCricketMatchEvent(current, event); }
      catch { return current; }
    });
  }

  function startGame(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (names.length < 2 || names.length > 6) return;
    setMatch(createCricketMatch(players, 0, bestOf, variant, normalizeCricketTargets(targets)));
  }
  const matchState = match ? getCricketMatchState(match) : null;
  const backLink = <Link href="/play" className="play-back" aria-label={t("games.back")} title={t("games.back")}
    onClick={event => { if (!mayDiscard()) event.preventDefault(); }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m12 19-7-7 7-7M5 12h14" /></svg>
  </Link>;

  return (
    <>
    {!match && <header className="play-header">{backLink}<h1>{t("cricket.name")}</h1></header>}
    <main className={`cricket-main${!match ? " cricket-setup-main" : ""}`}>
    {match && matchState ? <CricketGameView game={matchState.game} state={matchState.state} onRecord={record}
      navigation={backLink}
      alternative1v1View={alternative1v1View}
      series={{ bestOf: match.bestOf, leg: match.legs.length, wins: matchState.wins, winnerId: matchState.winnerId }}
      onNextLeg={() => setMatch(current => current ? nextCricketLeg(current) : current)}
      canRedo={history.redo.length > 0}
      onUndo={() => setHistory(current => {
        if (!current.match) return current;
        const previous = undoCricketMatchInput(current.match);
        return previous === current.match ? current : { match: previous, redo: [...current.redo, current.match] };
      })}
      onRedo={() => setHistory(current => {
        const restored = current.redo.at(-1);
        return restored ? { match: restored, redo: current.redo.slice(0, -1) } : current;
      })}
      onSetup={() => { if (mayDiscard()) setMatch(null); }}
      onRematch={() => setMatch(createCricketMatch(players, 0, bestOf, variant, matchState.state.targets))} /> :
    <section className="cricket-setup" aria-labelledby="cricket-setup-title">
      <h2 id="cricket-setup-title" className="cricket-visually-hidden" tabIndex={-1} ref={heading}>
        {t("cricket.setup")}
      </h2>
        <form ref={form} id="cricket-setup-form" className="cricket-setup-form" onSubmit={startGame}>
          <details className="cricket-advanced cricket-description">
            <summary>{t("cricket.gameDescription")}<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></summary>
            <p className="play-description">{t(variant === "cutthroat" ? "cricket.cutthroatRules" : "cricket.rules")}</p>
          </details>
          <div className="cricket-panel cricket-player-picker">
          <h3 id="cricket-players-title" className="cricket-players-title" aria-live="polite">{t("cricket.playersCount", { count: names.length })}</h3>
          <ol className="cricket-players" aria-labelledby="cricket-players-title">
            {names.map((name, index) => (
              <li className="cricket-player-field" key={players[index].id} data-player-id={players[index].id}>
                <span className="cricket-player-number" aria-hidden="true">{index + 1}</span>
                <input className="cricket-player-name-input" name={`player-${index + 1}`} value={name} maxLength={60}
                  aria-label={t("common.player", { number: index + 1 })} autoComplete="off"
                  required pattern=".*\S.*"
                  onChange={event => setPlayers(previous => previous.map((player, playerIndex) => playerIndex === index ? { ...player, name: event.target.value } : player))}
                  onKeyDown={event => {
                    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
                    event.preventDefault();
                    if (event.repeat) return;
                    const next = players[index + 1];
                    if (next) form.current?.querySelector<HTMLInputElement>(`[data-player-id="${next.id}"] input`)?.focus();
                    else if (names.length < 6) guestInput.current?.focus();
                    else startButton.current?.focus();
                  }} />
                <label className="cricket-handicap-field">
                  <span>{t("cricket.marksToCloseLabel")}</span>
                  <select value={players[index].marksToClose} title={t("cricket.marksToCloseHelp")}
                    aria-label={t("cricket.marksToClosePlayer", { number: index + 1, name })}
                    onChange={event => {
                      const marksToClose = Number(event.target.value);
                      setPlayers(previous => previous.map(player => player.id === players[index].id ? { ...player, marksToClose } : player));
                    }}>
                    {Array.from({ length: 9 }, (_, value) => value + 1).map(value => <option key={value} value={value}>{value}</option>)}
                  </select>
                </label>
                <button className="cricket-player-action" type="button" disabled={index === 0}
                  aria-label={t("cricket.movePlayerUp", { number: index + 1 })} onClick={() => movePlayer(index, -1)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 20V4m-7 7 7-7 7 7" /></svg>
                </button>
                <button className="cricket-player-action" type="button" disabled={index === names.length - 1}
                  aria-label={t("cricket.movePlayerDown", { number: index + 1 })} onClick={() => movePlayer(index, 1)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 4v16m-7-7 7 7 7-7" /></svg>
                </button>
              <button className="cricket-player-action" type="button" aria-label={t("cricket.removePlayer", { number: index + 1 })}
                onClick={() => {
                  pendingFocus.current = "guest";
                  setPlayers(previous => previous.filter((_, playerIndex) => playerIndex !== index));
                }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg></button>
              </li>
            ))}
          </ol>
          <div className="cricket-guest-entry">
            <input ref={guestInput} className="cricket-guest-input" value={guestName} maxLength={60}
              aria-label={t("cricket.playerSearch")} placeholder={t("cricket.playerSearch")} autoComplete="off"
              disabled={names.length >= 6} onChange={event => setGuestName(event.target.value)}
              onKeyDown={event => {
                if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  if (!event.repeat) addGuest();
                }
              }} />
            {guestName.trim() && names.length < 6 && <button className="cricket-guest-option" type="button" onClick={addGuest}>
              {t("cricket.addGuest", { name: guestName.trim() })}
            </button>}
          </div>
          <button className="cricket-button cricket-reorder-players" type="button" disabled={names.length < 2}
            title={t("cricket.orderHelp")}
            onClick={() => setPlayers(previous => previous.length < 2 ? previous : [...previous.slice(1), previous[0]])}>
            {t("cricket.reorder")}
          </button>
          </div>
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
            <fieldset className="cricket-target-picker" aria-describedby="cricket-target-help">
              <legend>{t("cricket.targetsLabel")}</legend>
              <p id="cricket-target-help">{t("cricket.targetsHelp")}</p>
              <button type="button" className="cricket-button" onClick={() => {
                const shuffled = [...CRICKET_AVAILABLE_TARGETS];
                for (let index = shuffled.length - 1; index > 0; index--) {
                  const randomIndex = Math.floor(Math.random() * (index + 1));
                  [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
                }
                setTargets(normalizeCricketTargets(shuffled.slice(0, 8)));
              }}>{t("cricket.randomTargets")}</button>
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
    </section>}
    </main>
    {!match && <footer className="cricket-setup-footer">
      <button ref={startButton} className="cricket-button cricket-primary" type="submit" form="cricket-setup-form" disabled={names.length < 2}>{t("cricket.start")}</button>
    </footer>}
    </>
  );
}
