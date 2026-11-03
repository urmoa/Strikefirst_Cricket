"use client";

import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { createCricketMatch, getCricketMatchState, normalizeCricketTargets, type CricketEvent } from "@/lib/cricket";
import { cricketMatchReducer, initialCricketMatchHistory, type CricketMatchAction } from "./cricket-match-controller";
import { getCricketSetupVariant, type CricketSetupValues } from "./cricket-setup-state";
import { readCricketSession, writeCricketSession, type CricketSession } from "./cricket-session";

export function useCricketMatch(values: CricketSetupValues, setValues: Dispatch<SetStateAction<CricketSetupValues>>) {
  const [history, setHistory] = useState(initialCricketMatchHistory);
  const current = useRef(history);
  const currentSetup = useRef(values);
  currentSetup.current = values;
  const [saved, setSaved] = useState<CricketSession | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setSaved(readCricketSession(() => window.sessionStorage));
    setReady(true);
  }, []);
  const { match } = history;
  const matchState = useMemo(() => match ? getCricketMatchState(match) : null, [match]);

  function dispatch(action: CricketMatchAction) {
    if (!ready) return;
    const next = cricketMatchReducer(current.current, action);
    if (next === current.current) return;
    current.current = next;
    if (action.type === "rotate-order") {
      const setup = currentSetup.current;
      currentSetup.current = { ...setup, players: [...setup.players.slice(1), setup.players[0]] };
      setValues(currentSetup.current);
    }
    // Persist before navigation can unmount this page, including rapid inputs.
    writeCricketSession(() => window.sessionStorage, next, currentSetup.current);
    setHistory(next);
  }

  function start(values: CricketSetupValues) {
    if (values.players.length < 2 || values.players.length > 6) return;
    dispatch({ type: "start", match: createCricketMatch(values.players, 0, values.bestOf,
      getCricketSetupVariant(values), normalizeCricketTargets(values.targets)) });
  }

  return {
    match, matchState, start, saved, ready,
    dismissSaved: () => setSaved(null),
    resume: () => {
      if (!saved) return;
      current.current = saved.history;
      setHistory(saved.history);
      setValues(saved.setup);
      setSaved(null);
    },
    canRedo: history.redo.length > 0,
    record: (event: CricketEvent) => dispatch({ type: "record", event }),
    nextLeg: () => dispatch({ type: "next-leg" }),
    rotateOrder: () => dispatch({ type: "rotate-order" }),
    undo: () => dispatch({ type: "undo" }),
    redo: () => dispatch({ type: "redo" }),
    rematch: () => dispatch({ type: "rematch" }),
    showSetup: () => dispatch({ type: "setup" }),
  };
}
