import { createCricketMatch, getCricketMatchState, getCricketState, nextCricketLeg,
  normalizeCricketTargets, type CricketMatch } from "../../../lib/cricket.ts";
import type { CricketMatchHistory } from "./cricket-match-controller.ts";
import { getCricketSetupVariant, type CricketSetupValues } from "./cricket-setup-state.ts";

export const CRICKET_SESSION_KEY = "strike-first:cricket:session:v1";

export interface CricketSession {
  version: 1;
  updatedAt: number;
  setup: CricketSetupValues;
  history: CricketMatchHistory & { match: CricketMatch };
}

type SessionStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
type StorageSource = () => SessionStorage;

function validateSetup(setup: CricketSetupValues) {
  if (!setup || !Array.isArray(setup.players) || setup.players.length < 2 || setup.players.length > 6 ||
    typeof setup.guestName !== "string" || typeof setup.alternative1v1View !== "boolean" ||
    ![null, "standard", "cutthroat"].includes(setup.selectedVariant) ||
    !Array.isArray(setup.targets) || setup.players.some(player => !player ||
      !Number.isInteger(player.id) || typeof player.name !== "string" || !player.name.trim() ||
      !Number.isInteger(player.marksToClose) || player.marksToClose < 1 || player.marksToClose > 9 ||
      (player.playerId !== undefined && !Number.isInteger(player.playerId))) ||
    new Set(setup.players.map(player => player.id)).size !== setup.players.length) {
    throw new Error("Invalid saved setup");
  }
  return createCricketMatch(setup.players, 0, setup.bestOf, getCricketSetupVariant(setup),
    normalizeCricketTargets(setup.targets));
}

function validateMatch(match: CricketMatch, initial: CricketMatch) {
  if (!match || match.bestOf !== initial.bestOf || !Array.isArray(match.legs) ||
    !match.legs.length || match.legs.length > initial.legs[0].players.length * Math.floor(match.bestOf / 2) + 1) {
    throw new Error("Invalid saved match");
  }
  let expected = initial;
  for (let index = 0; index < match.legs.length; index++) {
    const leg = match.legs[index];
    const template = expected.legs[index];
    // Check all legs and replay every event before allowing a restore.
    getCricketState(leg);
    if (leg.players.length !== template.players.length || leg.players.some((player, playerIndex) => {
      const original = template.players[playerIndex];
      return player.id !== original.id || player.name !== original.name || player.marksToClose !== original.marksToClose;
    }) || leg.variant !== template.variant || leg.startingPlayer !== template.startingPlayer ||
      JSON.stringify(leg.targets) !== JSON.stringify(template.targets)) throw new Error("Invalid saved leg");
    expected = { bestOf: match.bestOf, legs: match.legs.slice(0, index + 1) };
    if (index < match.legs.length - 1) {
      const next = nextCricketLeg(expected);
      if (next === expected) throw new Error("Invalid saved leg order");
      expected = next;
    }
  }
  return getCricketMatchState(match);
}

export function readCricketSession(source: StorageSource): CricketSession | null {
  let storage: SessionStorage | undefined;
  try {
    storage = source();
    const raw = storage.getItem(CRICKET_SESSION_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as CricketSession;
    if (!saved || saved.version !== 1 || !Number.isFinite(saved.updatedAt) ||
      !saved.history || !Array.isArray(saved.history.redo)) throw new Error("Invalid saved session");
    const initial = validateSetup(saved.setup);
    validateMatch(saved.history.match, initial);
    for (const match of saved.history.redo) validateMatch(match, initial);
    return saved;
  } catch {
    try { storage?.removeItem(CRICKET_SESSION_KEY); } catch { /* Storage may be unavailable. */ }
    return null;
  }
}

export function writeCricketSession(source: StorageSource, history: CricketMatchHistory, setup: CricketSetupValues) {
  // Entering setup must keep the previous save until a replacement match starts.
  if (!history.match) return;
  try {
    const storage = source();
    storage.setItem(CRICKET_SESSION_KEY, JSON.stringify({
      version: 1, updatedAt: Date.now(), setup, history: { ...history, match: history.match },
    } satisfies CricketSession));
  } catch { /* Gameplay remains available when storage is blocked or full. */ }
}
