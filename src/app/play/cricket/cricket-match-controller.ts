import { createCricketMatch, getCricketMatchState, nextCricketLeg, recordCricketMatchEvent,
  undoCricketMatchInput, type CricketEvent, type CricketMatch } from "../../../lib/cricket.ts";

export interface CricketMatchHistory {
  match: CricketMatch | null;
  redo: CricketMatch[];
}

export type CricketMatchAction =
  | { type: "start"; match: CricketMatch }
  | { type: "record"; event: CricketEvent }
  | { type: "next-leg" | "undo" | "redo" | "setup" | "rematch" | "rotate-order" };

export const initialCricketMatchHistory: CricketMatchHistory = { match: null, redo: [] };

export function cricketMatchReducer(current: CricketMatchHistory, action: CricketMatchAction): CricketMatchHistory {
  if (action.type === "start") return { match: action.match, redo: [] };
  if (action.type === "setup") return initialCricketMatchHistory;
  if (action.type === "redo") {
    const restored = current.redo.at(-1);
    return restored ? { match: restored, redo: current.redo.slice(0, -1) } : current;
  }
  if (!current.match) return current;
  const match = current.match;
  if (action.type === "undo") {
    const previous = undoCricketMatchInput(match);
    return previous === match ? current : { match: previous, redo: [...current.redo, match] };
  }
  let next: CricketMatch;
  switch (action.type) {
    case "rotate-order": {
      if (match.legs.length !== 1 || match.legs[0].events.length) return current;
      const firstLeg = match.legs[0];
      const players = [...firstLeg.players.slice(1), firstLeg.players[0]];
      next = createCricketMatch(players, 0, match.bestOf, firstLeg.variant, firstLeg.targets);
      break;
    }
    case "record":
      if (getCricketMatchState(match).state.winnerId !== null) return current;
      try { next = recordCricketMatchEvent(match, action.event); }
      catch { return current; }
      break;
    case "next-leg":
      next = nextCricketLeg(match);
      break;
    case "rematch": {
      const firstLeg = match.legs[0];
      next = createCricketMatch(firstLeg.players, 0, match.bestOf, firstLeg.variant, firstLeg.targets);
      break;
    }
  }
  return next === match ? current : { match: next, redo: [] };
}
