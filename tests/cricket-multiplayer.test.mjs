import test from "node:test";
import assert from "node:assert/strict";
import { createCricketGame, getCricketState, recordCricketEvent, createCricketMatch,
  getCricketMatchState, recordCricketMatchEvent, nextCricketLeg, undoCricketMatchEvent } from "../src/lib/cricket.ts";

const end = { type: "end-turn" };
const hit = (target, multiplier = 3) => ({ type: "hit", target, multiplier });
const play = (game, ...events) => events.reduce(recordCricketEvent, game);

test("multiplayer setup defaults names, preserves unique IDs and rejects fewer than two", () => {
  const game = createCricketGame(["Same", "Same", "", "D"], 3);
  assert.deepEqual(game.players.map(p => p.name), ["Same", "Same", "Mängija 3", "D"]);
  assert.equal(new Set(game.players.map(p => p.id)).size, 4);
  assert.equal(getCricketState(game).activePlayer, 3);
  for (const names of [[], ["A"]]) assert.throws(() => createCricketGame(names), /seadistus/);
});

test("three-dart and early turns rotate through every player before advancing the round", () => {
  let game = createCricketGame(["A", "B", "C", "D"], 2);
  for (const expected of [3, 0, 1, 2]) {
    game = play(game, { type: "miss" }, { type: "miss" }, { type: "miss" });
    assert.equal(getCricketState(game).activePlayer, expected);
    assert.equal(getCricketState(game).round, expected === 2 ? 2 : 1);
  }
  game = play(game, end);
  assert.equal(getCricketState(game).activePlayer, 3);
  assert.equal(getCricketState(game).round, 2);
});

test("points are awarded once while any opponent remains open and stop only when all close", () => {
  let game = createCricketGame(["A", "B", "C"]);
  game = play(game, hit(20), hit(20), end, hit(20), end, end);
  assert.equal(getCricketState(game).players[0].points, 60);
  game = play(game, hit(20), end, end, hit(20), end, hit(20));
  const state = getCricketState(game);
  assert.equal(state.players[0].points, 120);
  assert.ok(state.players.every(player => player.marks[20] === 3));
  assert.equal(state.turnThrows.length, 1);
});

test("closing must match the highest of all opponents; undo reopens a multiplayer victory", () => {
  let game = createCricketGame(["A", "B", "C"]);
  game = play(game, end, end, hit(20), hit(20), end);
  for (const target of [20, 19, 18, 17, 16, 15]) game = play(game, hit(target), end, end, end);
  game = play(game, hit(25, 2), hit(25, 1));
  assert.equal(getCricketState(game).winnerId, null);
  game = play(game, end, end, end, hit(15));
  assert.equal(getCricketState(game).players[0].points, 45);
  const won = play(game, hit(15, 1));
  assert.equal(getCricketState(won).winnerId, "player-1");
  assert.deepEqual(getCricketState({ ...won, events: won.events.slice(0, -1) }), getCricketState(game));
});

test("multiplayer legs cycle starters through everyone and end at the chosen win count", () => {
  let match = createCricketMatch(["Same", "Same", "Same"], 2, 3);
  // Different players each win a leg before player 3 wins their second: four legs total.
  for (const [index, winner] of [2, 0, 1, 2].entries()) {
    assert.equal(getCricketMatchState(match).state.activePlayer, (2 + index) % 3);
    while (getCricketMatchState(match).state.activePlayer !== winner) match = recordCricketMatchEvent(match, end);
    for (const target of [20, 19, 18, 17, 16, 15]) {
      match = recordCricketMatchEvent(match, hit(target));
      for (let i = 0; i < 3; i++) match = recordCricketMatchEvent(match, end);
    }
    match = recordCricketMatchEvent(match, hit(25, 2));
    match = recordCricketMatchEvent(match, hit(25, 1));
    if (index < 3) {
      assert.equal(getCricketMatchState(match).winnerId, null);
      match = nextCricketLeg(match);
      assert.equal(match.legs.at(-1).players.length, 3);
    }
  }
  assert.equal(getCricketMatchState(match).winnerId, "player-3");
  assert.deepEqual(getCricketMatchState(match).wins, [1, 1, 2]);
  assert.equal(nextCricketLeg(match), match);
  assert.equal(getCricketMatchState(undoCricketMatchEvent(match)).winnerId, null);
});
