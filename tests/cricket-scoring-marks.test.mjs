import test from "node:test";
import assert from "node:assert/strict";
import { createCricketGame, getCricketState, recordCricketEvent,
  createCricketMatch, recordCricketMatchEvent, undoCricketMatchTurn, getCricketMatchState } from "../src/lib/cricket.ts";

const hit = (target, multiplier) => ({ type: "hit", target, multiplier });
const end = { type: "end-turn" };
const play = (game, ...events) => events.reduce(recordCricketEvent, game);
const shown = (player, target) => player.marks[target] + player.scoringMarks[target];

for (const variant of ["standard", "cutthroat"]) {
  test(`${variant}: scoring overflow counts once for the thrower, even with multiple opponents`, () => {
    const game = play(createCricketGame(["A", "B", "C"], 0, variant), hit(20, 2), hit(20, 3), hit(20, 3));
    const state = getCricketState(game);
    assert.equal(shown(state.players[0], 20), 8);
    assert.equal(state.players[0].marks[20], 3);
    assert.deepEqual(state.players.map(p => p.scoringMarks[20]), [5, 0, 0]);
    assert.deepEqual(state.players.map(p => p.points), variant === "standard" ? [100, 0, 0] : [0, 100, 100]);
    assert.deepEqual(getCricketState(JSON.parse(JSON.stringify(game))), state);
  });
}

test("bull overflow counts and all-closed targets never increase the display", () => {
  let game = play(createCricketGame(["A", "B"]), hit(25, 2), hit(25, 2));
  assert.equal(shown(getCricketState(game).players[0], 25), 4);
  game = play(game, end, hit(25, 2), hit(25, 2), end, hit(25, 2));
  const state = getCricketState(game);
  assert.deepEqual(state.players.map(p => shown(p, 25)), [4, 3]);
  assert.deepEqual(state.players.map(p => p.points), [25, 0]);
});

test("full-turn undo removes scoring marks and replaying the redo snapshot restores them", () => {
  const before = createCricketMatch(["A", "B"], 0, 1, "cutthroat");
  const scored = [hit(20, 2), hit(20, 3)].reduce(recordCricketMatchEvent, before);
  assert.equal(shown(getCricketMatchState(scored).state.players[0], 20), 5);
  assert.deepEqual(undoCricketMatchTurn(scored), before);
  assert.equal(shown(getCricketMatchState(before).state.players[0], 20), 0);
  assert.equal(shown(getCricketMatchState(scored).state.players[0], 20), 5);
});
