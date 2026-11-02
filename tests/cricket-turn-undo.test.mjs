import test from "node:test";
import assert from "node:assert/strict";
import { createCricketMatch, recordCricketMatchEvent, getCricketMatchState,
  undoCricketMatchTurn, nextCricketLeg } from "../src/lib/cricket.ts";

const hit = { type: "hit", target: 20, multiplier: 3 };
const end = { type: "end-turn" };
const record = (match, ...events) => events.reduce(recordCricketMatchEvent, match);

test("undo clears the entire partial or completed visit and its points", () => {
  for (const names of [["A", "B"], ["A", "B", "C"]]) {
    const initial = createCricketMatch(names);
    assert.equal(undoCricketMatchTurn(initial), initial);
    for (const events of [[hit], [hit, hit], [hit, hit, hit], [hit, end], [end]]) {
      const entered = record(initial, ...events);
      assert.deepEqual(undoCricketMatchTurn(entered), initial);
    }
    const prior = record(initial, hit, end);
    assert.deepEqual(undoCricketMatchTurn(record(prior, hit, hit)), prior);
    assert.deepEqual(undoCricketMatchTurn(undoCricketMatchTurn(record(prior, hit))), initial);
    assert.equal(getCricketMatchState(prior).state.activePlayer, 1);
  }
});

test("undo restores the previous player and round after a completed multiplayer visit", () => {
  const initial = createCricketMatch(["A", "B", "C"]);
  const before = record(initial, end, end);
  const after = record(before, hit, hit, hit);
  assert.equal(getCricketMatchState(after).state.round, 2);
  assert.deepEqual(undoCricketMatchTurn(after), before);
  const state = getCricketMatchState(undoCricketMatchTurn(after)).state;
  assert.equal(state.activePlayer, 2);
  assert.equal(state.round, 1);
  assert.equal(state.players[2].points, 0);
});

test("undo removes the full winning visit, including from the next leg", () => {
  let match = createCricketMatch(["A", "B"], 0, 3);
  for (const target of [20, 19, 18, 17, 16, 15]) {
    match = record(match, { type: "hit", target, multiplier: 3 }, end, end);
  }
  const won = record(match, { type: "hit", target: 25, multiplier: 2 }, { type: "hit", target: 25, multiplier: 1 });
  assert.deepEqual(getCricketMatchState(won).wins, [1, 0]);
  assert.deepEqual(undoCricketMatchTurn(won), match);
  assert.deepEqual(undoCricketMatchTurn(nextCricketLeg(won)), match);
  assert.deepEqual(getCricketMatchState(undoCricketMatchTurn(won)).wins, [0, 0]);
});
