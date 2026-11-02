import test from "node:test";
import assert from "node:assert/strict";
import { createCricketGame, getCricketState, recordCricketEvent, createCricketMatch,
  getCricketMatchState, nextCricketLeg, recordCricketMatchEvent, undoCricketMatchTurn } from "../src/lib/cricket.ts";

const hit = (target, multiplier = 1) => ({ type: "hit", target, multiplier });
const end = { type: "end-turn" };
const play = (game, ...events) => events.reduce(recordCricketEvent, game);
const fresh = (names = ["A", "B"]) => createCricketGame(names, 0, "cutthroat");

function closeNumbers(game) {
  for (const target of [20, 19, 18, 17, 16, 15]) game = play(game, hit(target, 3), end, end);
  return game;
}

test("cutthroat closing overflow and bull penalties go to opponents, never the thrower", () => {
  let game = play(fresh(), hit(20, 2), hit(20, 3));
  assert.deepEqual(getCricketState(game).players.map(p => p.points), [0, 40]);
  game = play(game, end, end, hit(25, 2), hit(25, 2));
  assert.deepEqual(getCricketState(game).players.map(p => p.points), [0, 65]);
  assert.equal(getCricketState(game).players[0].marks[25], 3);
});

test("every open opponent gets the full penalty; closed opponents are protected", () => {
  const game = play(fresh(["A", "B", "C", "D"]), end, hit(20, 3), end, end, end,
    hit(20, 3), hit(20, 3));
  assert.deepEqual(getCricketState(game).players.map(p => p.points), [0, 0, 60, 60]);
});

test("a target closed by everyone consumes a dart without penalties", () => {
  const game = play(fresh(), hit(20, 3), end, hit(20, 3), end, hit(20, 3));
  assert.deepEqual(getCricketState(game).players.map(p => p.points), [0, 0]);
  assert.equal(getCricketState(game).turnThrows.length, 1);
});

test("closing with more points cannot win; penalizing the opponent to a tie wins immediately", () => {
  let game = play(fresh(), end, hit(20, 3), hit(20, 3), end);
  game = play(closeNumbers(game), hit(25, 2), hit(25));
  assert.equal(getCricketState(game).winnerId, null);
  game = play(game, hit(15, 3), end, hit(15));
  const state = getCricketState(game);
  assert.deepEqual(state.players.map(p => p.points), [60, 60]);
  assert.equal(state.winnerId, "player-1");
  assert.equal(state.turnThrows.length, 1);
  assert.throws(() => recordCricketEvent(game, end), /lõppenud/);
});

test("an already closed player can win when another player's penalty removes their deficit", () => {
  let game = fresh(["A", "B", "C"]);
  game = play(game, end, end, hit(20, 3), hit(20, 3), end); // A and B receive 60.
  for (const target of [20, 19, 18, 17, 16, 15]) {
    game = play(game, hit(target, 3), end, end, end);
  }
  game = play(game, hit(25, 2), hit(25), end, hit(19, 3), hit(19, 3), hit(19, 3));
  const state = getCricketState(game);
  assert.deepEqual(state.players.map(p => p.points), [60, 60, 114]);
  assert.equal(state.winnerId, "player-1");
  assert.equal(state.activePlayer, 1);
});

test("cutthroat variant and replay survive next leg, full-turn undo and redo snapshots", () => {
  let match = createCricketMatch(["A", "B"], 0, 3, "cutthroat");
  match = { ...match, legs: [play(closeNumbers(match.legs[0]), hit(25, 2), hit(25))] };
  assert.deepEqual(getCricketMatchState(match).wins, [1, 0]);
  const next = nextCricketLeg(match);
  assert.equal(next.legs[1].variant, "cutthroat");
  assert.equal(next.legs[1].startingPlayer, 1);
  const scored = [hit(20, 2), hit(20, 3)].reduce(recordCricketMatchEvent, next);
  assert.deepEqual(getCricketMatchState(scored).state.players.map(p => p.points), [40, 0]);
  assert.deepEqual(undoCricketMatchTurn(scored), next);
  assert.deepEqual(getCricketMatchState(JSON.parse(JSON.stringify(scored))), getCricketMatchState(scored));
  const undoneWin = undoCricketMatchTurn(next);
  assert.equal(undoneWin.legs[0].variant, "cutthroat");
  assert.equal(getCricketMatchState(undoneWin).winnerId, null);
  assert.deepEqual(getCricketMatchState(undoneWin).wins, [0, 0]);
});

test("unknown variants are rejected and standard remains the default", () => {
  assert.equal(createCricketGame(["A", "B"]).variant, "standard");
  assert.throws(() => createCricketGame(["A", "B"], 0, "unknown"), /seadistus/);
});
