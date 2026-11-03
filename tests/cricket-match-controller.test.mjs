import test from "node:test";
import assert from "node:assert/strict";
import { createCricketMatch, getCricketMatchState } from "../src/lib/cricket.ts";
import { cricketMatchReducer as reduce, initialCricketMatchHistory } from "../src/app/play/cricket/cricket-match-controller.ts";

const mark = { type: "record", event: { type: "mark", target: 20 } };
const miss = { type: "record", event: { type: "miss" } };
const start = (match = createCricketMatch(["A", "B"])) => reduce(initialCricketMatchHistory, { type: "start", match });

test("rotating the initial order moves the first player last and preserves match settings", () => {
  const initial = start(createCricketMatch([{ name: "A", marksToClose: 1 },
    { name: "B", marksToClose: 5 }, { name: "C", marksToClose: 2 }], 0, 3, "cutthroat", [20, 10]));
  const rotated = reduce(initial, { type: "rotate-order" });
  assert.deepEqual(rotated.match, createCricketMatch([{ name: "B", marksToClose: 5 },
    { name: "C", marksToClose: 2 }, { name: "A", marksToClose: 1 }], 0, 3, "cutthroat", [20, 10]));
  assert.equal(getCricketMatchState(rotated.match).state.players[0].name, "B");
  assert.deepEqual(reduce(reduce(rotated, { type: "rotate-order" }), { type: "rotate-order" }), initial);
  assert.equal(initial.match.legs[0].players[0].name, "A");
});

test("order rotation is rejected after any input or in later legs and clears stale redo", () => {
  for (const event of [mark, miss, { type: "record", event: { type: "end-turn" } }]) {
    const played = reduce(start(), event);
    assert.equal(reduce(played, { type: "rotate-order" }), played);
  }
  const undone = reduce(reduce(start(), mark), { type: "undo" });
  assert.deepEqual(reduce(undone, { type: "rotate-order" }).redo, []);
  const won = reduce(start(createCricketMatch([{ name: "A", marksToClose: 1 }, "B"], 0, 3, "standard", [20])), mark);
  const next = reduce(won, { type: "next-leg" });
  assert.equal(reduce(next, { type: "rotate-order" }), next);
  assert.equal(reduce(initialCricketMatchHistory, { type: "rotate-order" }), initialCricketMatchHistory);
});

test("match controller restores multiple undo steps and clears the redo branch on new input", () => {
  const initial = start();
  const first = reduce(initial, mark);
  const second = reduce(first, mark);
  const undone = reduce(reduce(second, { type: "undo" }), { type: "undo" });
  assert.deepEqual(undone.match, initial.match);
  const redone = reduce(undone, { type: "redo" });
  assert.deepEqual(redone.match, first.match);
  assert.deepEqual(reduce(redone, { type: "redo" }).match, second.match);
  const branched = reduce(redone, { type: "record", event: { type: "mark", target: 19 } });
  assert.deepEqual(branched.redo, []);
  assert.equal(reduce(branched, { type: "redo" }), branched);
  assert.equal(second.match.legs[0].events.length, 2);
});

test("match controller keeps dart visits and mark inputs as distinct undo units", () => {
  const darts = reduce(reduce(start(), miss), miss);
  assert.equal(reduce(darts, { type: "undo" }).match.legs[0].events.length, 0);
  const marks = reduce(reduce(start(), mark), mark);
  assert.equal(reduce(marks, { type: "undo" }).match.legs[0].events.length, 1);
});

test("rejected input and unavailable next leg preserve the redo branch", () => {
  const recorded = reduce(reduce(start(), mark), mark);
  const undone = reduce(recorded, { type: "undo" });
  assert.equal(reduce(undone, miss), undone);
  assert.equal(reduce(undone, { type: "next-leg" }), undone);
  assert.deepEqual(reduce(undone, { type: "redo" }).match, recorded.match);
});

test("undo across a leg boundary can redo the new leg and its starting player", () => {
  const initial = start(createCricketMatch([{ name: "A", marksToClose: 1 }, { name: "B", marksToClose: 1 }], 0, 3, "standard", [20]));
  const won = reduce(initial, mark);
  const next = reduce(won, { type: "next-leg" });
  assert.equal(next.match.legs.length, 2);
  assert.equal(getCricketMatchState(next.match).state.activePlayer, 1);
  const undone = reduce(next, { type: "undo" });
  assert.deepEqual(undone.match, initial.match);
  assert.deepEqual(reduce(undone, { type: "redo" }).match, next.match);
  const replayed = reduce(undone, mark);
  assert.deepEqual(reduce(replayed, { type: "next-leg" }).redo, []);
});

test("completed legs reject more input without changing history", () => {
  const won = reduce(start(createCricketMatch(["A", "B"], 0, 1, "standard", [20])),
    { type: "record", event: { type: "hit", target: 20, multiplier: 3 } });
  assert.equal(getCricketMatchState(won.match).winnerId, "player-1");
  assert.equal(reduce(won, mark), won);
});

test("rematch preserves players, handicaps, variant, targets and format while resetting history", () => {
  const match = createCricketMatch([{ name: "B", marksToClose: 1 }, { name: "A", marksToClose: 5 }], 0, 3, "cutthroat", [20, 10]);
  const undone = reduce(reduce(start(match), mark), { type: "undo" });
  assert.equal(undone.redo.length, 1);
  const rematch = reduce(undone, { type: "rematch" });
  assert.deepEqual(rematch.match, match);
  assert.notEqual(rematch.match, match);
  assert.deepEqual(rematch.redo, []);
});

test("returning to setup or starting a new match clears the old match history", () => {
  const undone = reduce(reduce(start(), mark), { type: "undo" });
  assert.deepEqual(reduce(undone, { type: "setup" }), initialCricketMatchHistory);
  const replacement = createCricketMatch(["C", "D", "E"]);
  assert.deepEqual(reduce(undone, { type: "start", match: replacement }), { match: replacement, redo: [] });
  for (const type of ["undo", "redo", "next-leg", "rematch"]) {
    assert.equal(reduce(initialCricketMatchHistory, { type }), initialCricketMatchHistory);
  }
});
