import test from "node:test";
import assert from "node:assert/strict";
import { createCricketMatch, recordCricketMatchEvent, getCricketMatchStatistics,
  nextCricketLeg, undoCricketMatchInput } from "../src/lib/cricket.ts";

const hit = (target, multiplier = 1) => ({ type: "hit", target, multiplier });
const mark = target => ({ type: "mark", target });
const miss = { type: "miss" };
const pass = { type: "end-turn", mode: "marks" };
const play = (match, ...events) => events.reduce(recordCricketMatchEvent, match);

test("round buckets are disjoint, empty visits count, and skipped darts count as misses", () => {
  let match = createCricketMatch(["A", "B"]);
  for (const count of [0, 1, 2, 3, 4]) {
    match = play(match, ...Array.from({ length: count }, () => mark(20)), pass, pass);
  }
  const { players: [a, b], estimatedDarts } = getCricketMatchStatistics(match);
  assert.deepEqual(a.roundsByMarks, [1, 1, 1, 1, 1]);
  assert.deepEqual(b.roundsByMarks, [5, 0, 0, 0, 0]);
  assert.equal(a.mpr, 2);
  assert.equal(a.bestRound, 4);
  assert.equal(a.points, 140);
  assert.equal(b.mpr, 0);
  assert.equal(estimatedDarts, true);
  const darts = play(createCricketMatch(["A", "B"]), hit(20, 2), { type: "end-turn" });
  assert.equal(getCricketMatchStatistics(darts).players[0].mpr, 2);
});

test("winning partial visit uses actual darts and statistics survive serialization, undo and redo", () => {
  const initial = createCricketMatch(["A", "B"], 0, 3, "standard", [20, 19]);
  const before = play(initial, hit(20, 3), miss, miss, miss, miss, miss);
  const won = play(before, hit(19, 3));
  const stats = getCricketMatchStatistics(won);
  assert.equal(stats.players[0].mpr, 4.5);
  assert.equal(stats.players[0].darts, 4);
  assert.equal(stats.players[0].bestRound, 3);
  assert.deepEqual(stats.players[0].roundsByMarks, [0, 0, 0, 2, 0]);
  assert.equal(stats.estimatedDarts, false);
  assert.deepEqual(getCricketMatchStatistics(JSON.parse(JSON.stringify(won))), stats);
  assert.deepEqual(getCricketMatchStatistics(undoCricketMatchInput(won)), getCricketMatchStatistics(before));
  assert.deepEqual(getCricketMatchStatistics(play(before, hit(19, 3))), stats);
  const next = nextCricketLeg(won);
  const finished = play(next, hit(20, 3), hit(20, 3), miss, hit(20, 3), hit(19, 3));
  const [a, b] = getCricketMatchStatistics(finished).players;
  assert.deepEqual(a.legPoints, [0, 0]);
  assert.deepEqual(b.legPoints, [0, 60]);
  assert.equal(b.points, 60);
  assert.equal(b.bestRound, 6);
});

test("closed target darts do not add effective marks and Bull overflow counts", () => {
  let match = play(createCricketMatch(["A", "B"]), hit(20, 3), miss, miss, hit(20, 3), miss, miss);
  match = play(match, hit(20, 3), hit(25, 2), hit(25, 2));
  const a = getCricketMatchStatistics(match).players[0];
  assert.equal(a.marks, 7);
  assert.equal(a.points, 25);
  assert.equal(a.bestRound, 4);
});

test("cutthroat counts thrower's marks once and assigns penalty points to opponents", () => {
  const match = play(createCricketMatch(["A", "B", "C"], 0, 1, "cutthroat"),
    hit(20, 3), hit(20, 3), hit(20, 3));
  const [a, b, c] = getCricketMatchStatistics(match).players;
  assert.equal(a.marks, 9);
  assert.equal(a.points, 0);
  assert.deepEqual([b.points, c.points], [120, 120]);
  assert.equal(b.mpr, 0);
});
