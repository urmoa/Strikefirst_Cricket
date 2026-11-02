import { t } from "./i18n.ts";
export const CRICKET_TARGETS = [20, 19, 18, 17, 16, 15, 25] as const;
export const CRICKET_AVAILABLE_TARGETS = [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 25] as const;
export type CricketTarget = typeof CRICKET_AVAILABLE_TARGETS[number];

export function normalizeCricketTargets(targets: readonly CricketTarget[] = CRICKET_TARGETS): CricketTarget[] {
  if (!Array.isArray(targets) || targets.length < 1 || targets.length > 8 ||
    new Set(targets).size !== targets.length || targets.some(target => !CRICKET_AVAILABLE_TARGETS.includes(target))) {
    throw new Error(t("cricket.error.targets"));
  }
  return CRICKET_AVAILABLE_TARGETS.filter(target => targets.includes(target));
}
export type CricketThrow =
  | { type: "miss" }
  | { type: "hit"; target: Exclude<CricketTarget, 25>; multiplier: 1 | 2 | 3 }
  | { type: "hit"; target: 25; multiplier: 1 | 2 };
export type CricketInputMode = "darts" | "marks";
export type CricketEvent = CricketThrow | { type: "mark"; target: CricketTarget } |
  { type: "end-turn"; mode?: CricketInputMode };
export type CricketVariant = "standard" | "cutthroat";
export type CricketPlayerSetup = string | { name: string; marksToClose?: number };

export interface CricketGame {
  version: 1;
  variant: CricketVariant;
  players: { id: string; name: string; marksToClose?: number }[];
  startingPlayer: number;
  targets?: readonly CricketTarget[];
  events: CricketEvent[];
}
export interface CricketPlayer {
  id: string;
  name: string;
  marksToClose: number;
  points: number;
  marks: Record<CricketTarget, number>;
  // Extra marks that actually scored, credited to the thrower in either variant.
  scoringMarks: Record<CricketTarget, number>;
}
export interface CricketState {
  targets: readonly CricketTarget[];
  players: CricketPlayer[];
  activePlayer: number;
  round: number;
  turnThrows: CricketThrow[];
  turnMarks: CricketTarget[];
  turnMode: CricketInputMode | null;
  winnerId: string | null;
  lastTurn: { playerId: string; throws: CricketThrow[]; marks: CricketTarget[]; mode: CricketInputMode; endedEarly: boolean } | null;
}

export function isCricketTargetClosed(player: CricketPlayer, target: CricketTarget): boolean {
  return player.marks[target] >= player.marksToClose;
}

export function canRecordCricketMark(state: CricketState, target: CricketTarget): boolean {
  return !state.winnerId && state.turnMode !== "darts" && state.targets.includes(target) &&
    state.turnMarks.length < 9 &&
    (state.turnMarks.includes(target) || new Set(state.turnMarks).size < 3) &&
    !state.players.every(player => isCricketTargetClosed(player, target));
}

export function createCricketGame(players: readonly CricketPlayerSetup[], startingPlayer = 0, variant: CricketVariant = "standard",
  targets: readonly CricketTarget[] = CRICKET_TARGETS): CricketGame {
  const game: CricketGame = {
    version: 1, variant, targets: normalizeCricketTargets(targets),
    players: players.map((player, index) => ({
      id: `player-${index + 1}`,
      name: (typeof player === "string" ? player : player.name).trim() || t("common.player", { number: index + 1 }),
      marksToClose: typeof player === "string" || player.marksToClose === undefined ? 3 : player.marksToClose,
    })),
    startingPlayer, events: [],
  };
  validateGame(game);
  return game;
}

function validateGame(game: CricketGame): void {
  normalizeCricketTargets(game.targets);
  if (game.version !== 1 || (game.variant !== "standard" && game.variant !== "cutthroat") ||
    !Array.isArray(game.players) || game.players.length < 2 ||
    game.players.some(player => !player || typeof player.id !== "string" || !player.id.trim() ||
      typeof player.name !== "string" || !player.name.trim() ||
      (player.marksToClose !== undefined && (!Number.isInteger(player.marksToClose) ||
        player.marksToClose < 1 || player.marksToClose > 9))) ||
    new Set(game.players.map(player => player.id)).size !== game.players.length ||
    !Number.isInteger(game.startingPlayer) || game.startingPlayer < 0 ||
    game.startingPlayer >= game.players.length || !Array.isArray(game.events)) {
    throw new Error(t("cricket.error.setup"));
  }
}

function validateEvent(event: CricketEvent, targets: readonly CricketTarget[]): void {
  if (event && (event.type === "miss" || event.type === "end-turn" &&
    (event.mode === undefined || event.mode === "darts" || event.mode === "marks"))) return;
  if (event && event.type === "mark" && targets.includes(event.target)) return;
  if (event && event.type === "hit" &&
    targets.includes(event.target) && Number.isInteger(event.multiplier) &&
    event.multiplier >= 1 && event.multiplier <= (event.target === 25 ? 2 : 3)) return;
  throw new Error(t("cricket.error.hit"));
}

function nextTurn(state: CricketState, game: CricketGame, endedEarly = false): void {
  state.lastTurn = {
    playerId: state.players[state.activePlayer].id,
    throws: [...state.turnThrows], marks: [...state.turnMarks], mode: state.turnMode ?? "darts", endedEarly,
  };
  state.activePlayer = (state.activePlayer + 1) % state.players.length;
  if (state.activePlayer === game.startingPlayer) state.round += 1;
  state.turnThrows = [];
  state.turnMarks = [];
  state.turnMode = null;
}

// Mutates only the fresh state constructed during replay, never the game log.
function applyEvent(state: CricketState, game: CricketGame, event: CricketEvent): void {
  validateEvent(event, state.targets);
  if (state.winnerId !== null) throw new Error(t("cricket.error.finished"));
  if (event.type === "end-turn") {
    if (event.mode && state.turnMode && event.mode !== state.turnMode) throw new Error(t("cricket.error.inputMode"));
    state.turnMode ??= event.mode ?? "darts";
    nextTurn(state, game, true);
    return;
  }
  const player = state.players[state.activePlayer];
  const mode = event.type === "mark" ? "marks" : "darts";
  if (state.turnMode && state.turnMode !== mode) throw new Error(t("cricket.error.inputMode"));
  if (event.type === "mark" && !canRecordCricketMark(state, event.target)) throw new Error(t("cricket.error.mark"));
  state.turnMode = mode;
  if (event.type === "hit" || event.type === "mark") {
    const multiplier = event.type === "mark" ? 1 : event.multiplier;
    const previous = player.marks[event.target];
    const extra = Math.max(0, previous + multiplier - player.marksToClose);
    const openOpponents = state.players.filter(opponent =>
      opponent.id !== player.id && !isCricketTargetClosed(opponent, event.target));
    player.marks[event.target] = Math.min(player.marksToClose, previous + multiplier);
    const points = extra * event.target;
    if (openOpponents.length) player.scoringMarks[event.target] += extra;
    if (game.variant === "cutthroat") {
      for (const opponent of openOpponents) opponent.points += points;
    } else if (openOpponents.length) player.points += points;
  }
  if (event.type === "mark") state.turnMarks.push(event.target);
  else state.turnThrows.push({ ...event });
  // Penalties can also put an already closed opponent into the winning position.
  const winner = state.players.find(candidate =>
    state.targets.every(target => isCricketTargetClosed(candidate, target)) &&
    state.players.every(opponent => game.variant === "cutthroat"
      ? candidate.points <= opponent.points : candidate.points >= opponent.points));
  if (winner) {
    state.winnerId = winner.id;
  } else if (state.turnMode === "darts" && state.turnThrows.length === 3) {
    nextTurn(state, game);
  }
}

export function getCricketState(game: CricketGame): CricketState {
  validateGame(game);
  const state: CricketState = {
    targets: normalizeCricketTargets(game.targets),
    players: game.players.map(player => ({
      ...player, marksToClose: player.marksToClose === undefined ? 3 : player.marksToClose, points: 0,
      marks: emptyCricketMarks(),
      scoringMarks: emptyCricketMarks(),
    })),
    activePlayer: game.startingPlayer, round: 1, turnThrows: [], turnMarks: [], turnMode: null, winnerId: null, lastTurn: null,
  };
  for (const event of game.events) applyEvent(state, game, event);
  return state;
}

function emptyCricketMarks(): Record<CricketTarget, number> {
  return Object.fromEntries(CRICKET_AVAILABLE_TARGETS.map(target => [target, 0])) as Record<CricketTarget, number>;
}

export function recordCricketEvent(game: CricketGame, event: CricketEvent): CricketGame {
  applyEvent(getCricketState(game), game, event);
  return { ...game, events: [...game.events, { ...event }] };
}

export type CricketLegFormat = 1 | 3 | 5;
export interface CricketMatch {
  bestOf: CricketLegFormat;
  legs: CricketGame[];
}

export function createCricketMatch(players: readonly CricketPlayerSetup[], startingPlayer = 0, bestOf: CricketLegFormat = 1,
  variant: CricketVariant = "standard", targets: readonly CricketTarget[] = CRICKET_TARGETS): CricketMatch {
  if (bestOf !== 1 && bestOf !== 3 && bestOf !== 5) throw new Error(t("cricket.error.format"));
  return { bestOf, legs: [createCricketGame(players, startingPlayer, variant, targets)] };
}

export function getCricketMatchState(match: CricketMatch) {
  const game = match.legs[match.legs.length - 1];
  const state = getCricketState(game);
  const wins = game.players.map(player => match.legs.reduce((total, leg) =>
    total + Number(getCricketState(leg).winnerId === player.id), 0));
  const winnerIndex = wins.findIndex(count => count >= Math.floor(match.bestOf / 2) + 1);
  return { game, state, wins, winnerId: winnerIndex < 0 ? null : game.players[winnerIndex].id };
}

export function recordCricketMatchEvent(match: CricketMatch, event: CricketEvent): CricketMatch {
  const { game } = getCricketMatchState(match);
  return { ...match, legs: [...match.legs.slice(0, -1), recordCricketEvent(game, event)] };
}

export function nextCricketLeg(match: CricketMatch): CricketMatch {
  const { game, state, winnerId } = getCricketMatchState(match);
  if (!state.winnerId || winnerId) return match;
  return { ...match, legs: [...match.legs, createCricketGame(game.players, (game.startingPlayer + 1) % game.players.length, game.variant, state.targets)] };
}

export function undoCricketMatchEvent(match: CricketMatch): CricketMatch {
  // At the start of a new leg, undo the preceding leg's winning dart.
  const legs = [...match.legs];
  if (!legs[legs.length - 1].events.length && legs.length > 1) legs.pop();
  const game = legs[legs.length - 1];
  if (!game.events.length) return match;
  legs[legs.length - 1] = { ...game, events: game.events.slice(0, -1) };
  return { ...match, legs };
}

// Clear the current visit, or the preceding visit when no darts have been entered.
export function undoCricketMatchTurn(match: CricketMatch): CricketMatch {
  const legs = [...match.legs];
  if (!legs[legs.length - 1].events.length && legs.length > 1) legs.pop();
  const game = legs[legs.length - 1];
  if (!game.events.length) return match;
  let visitStart = 0;
  const replay = getCricketState({ ...game, events: [] });
  for (let index = 0; index < game.events.length - 1; index++) {
    applyEvent(replay, game, game.events[index]);
    if (replay.turnMode === null) visitStart = index + 1;
  }
  legs[legs.length - 1] = { ...game, events: game.events.slice(0, visitStart) };
  return { ...match, legs };
}

// Pick history behavior from the visit being restored, including across leg boundaries.
export function undoCricketMatchInput(match: CricketMatch): CricketMatch {
  const leg = match.legs.at(-1)!;
  const game = !leg.events.length && match.legs.length > 1 ? match.legs.at(-2)! : leg;
  const state = getCricketState(game);
  return (state.turnMode ?? state.lastTurn?.mode) === "marks"
    ? undoCricketMatchEvent(match) : undoCricketMatchTurn(match);
}
