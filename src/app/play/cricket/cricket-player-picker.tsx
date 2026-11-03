"use client";

import { useLayoutEffect, useRef, type Dispatch, type RefObject, type SetStateAction } from "react";
import { t } from "@/lib/i18n";
import { usePlayerSearch } from "./use-player-search";
import type { CricketSetupPlayer } from "./cricket-setup-state";

export function CricketPlayerPicker({ players, setPlayers, guestName, setGuestName, startButton }: {
  players: CricketSetupPlayer[];
  setPlayers: Dispatch<SetStateAction<CricketSetupPlayer[]>>;
  guestName: string;
  setGuestName: (name: string) => void;
  startButton: RefObject<HTMLButtonElement | null>;
}) {
  const names = players.map(player => player.name);
  const nextPlayerId = useRef(Math.max(0, ...players.map(player => player.id)) + 1);
  const pendingFocus = useRef<"guest" | "start" | number | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const guestInput = useRef<HTMLInputElement>(null);
  const search = usePlayerSearch(guestName, players.length < 6);
  useLayoutEffect(() => {
    const target = pendingFocus.current;
    if (target === null) return;
    pendingFocus.current = null;
    if (target === "start") startButton.current?.focus();
    else if (target === "guest") guestInput.current?.focus();
    else container.current?.querySelector<HTMLInputElement>(`[data-player-id="${target}"] input`)?.focus();
  });

  function addGuest(profile?: { id: number; displayName: string }) {
    const name = profile?.displayName ?? guestName.trim();
    if (!name || names.length >= 6) return;
    if (profile && players.some(player => player.playerId === profile.id)) return;
    const id = nextPlayerId.current++;
    setPlayers(previous => previous.length < 6 ? [...previous, { id, name, marksToClose: 3, playerId: profile?.id }] : previous);
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


  return (
          <div ref={container} className="cricket-panel cricket-player-picker">
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
                    if (next) container.current?.querySelector<HTMLInputElement>(`[data-player-id="${next.id}"] input`)?.focus();
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
          {names.length < 6 && <div className="cricket-guest-entry" aria-busy={search.loading}>
            <input ref={guestInput} className="cricket-guest-input" value={guestName} maxLength={60}
              aria-label={t("cricket.playerSearch")} placeholder={t("cricket.playerSearch")} autoComplete="off"
              onChange={event => setGuestName(event.target.value)}
              onKeyDown={event => {
                if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  if (!event.repeat) addGuest();
                }
              }} />
            {search.query === guestName.trim() && guestName.trim().length >= 2 && <>
              {search.players.filter(profile => !players.some(player => player.playerId === profile.id)).map(profile =>
                <button key={profile.id} className="cricket-guest-option" type="button" onClick={() => addGuest(profile)}>
                  {t("cricket.addFoundPlayer", { name: profile.displayName })}
                </button>)}
              {search.loading && <p role="status">{t("cricket.searchLoading")}</p>}
              {search.failed && <p role="status">{t("cricket.searchUnavailable")}</p>}
            </>}
            {guestName.trim() && <button className="cricket-guest-option" type="button" onClick={() => addGuest()}>
              {t("cricket.addGuest", { name: guestName.trim() })}
            </button>}
          </div>}
          <button className="cricket-button cricket-reorder-players" type="button" disabled={names.length < 2}
            title={t("cricket.orderHelp")}
            onClick={() => setPlayers(previous => previous.length < 2 ? previous : [...previous.slice(1), previous[0]])}>
            {t("cricket.reorder")}
          </button>
          </div>

  );
}
