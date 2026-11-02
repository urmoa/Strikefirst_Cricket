import test from "node:test";
import assert from "node:assert/strict";
import { CRICKET_TARGETS, normalizeCricketTargets, createCricketGame, getCricketState, recordCricketEvent,
  createCricketMatch, getCricketMatchState, recordCricketMatchEvent, nextCricketLeg,
  undoCricketMatchInput } from "../src/lib/cricket.ts";

const hit = (target, multiplier = 1) => ({ type: "hit", target, multiplier });
const mark = target => ({ type: "mark", target });
const end = { type: "end-turn" };
const play = (game, ...events) => events.reduce(recordCricketEvent, game);

test("default and legacy games use 15–20 and Bull; custom selections are copied and ordered", () => {
  const game = createCricketGame(["A", "B"]);
  assert.deepEqual(getCricketState(game).targets, CRICKET_TARGETS);
  const { targets: _, ...legacy } = game;
  assert.deepEqual(getCricketState(legacy), getCricketState(game));
  const selected = [25, 10, 16, 13, 14, 11, 15, 12];
  const custom = createCricketGame(["A", "B"], 0, "standard", selected);
  selected[0] = 20;
  assert.deepEqual(getCricketState(custom).targets, [16, 15, 14, 13, 12, 11, 10, 25]);
  assert.ok(Object.values(getCricketState(custom).players[0].marks).every(value => value === 0));
});

test("empty, duplicate, unknown, malformed and nine-target selections are rejected on creation and replay", () => {
  for (const targets of [[], [10, 10], [9], [21], [50], [10.5], ["10"], null, {},
    [10, 11, 12, 13, 14, 15, 16, 17, 25]]) {
    assert.throws(() => normalizeCricketTargets(targets));
    assert.throws(() => createCricketGame(["A", "B"], 0, "standard", targets));
    assert.throws(() => getCricketState({ ...createCricketGame(["A", "B"]), targets }));
  }
});

test("unselected hits and marks are rejected without changing history, including during replay", () => {
  const game = createCricketGame(["A", "B"], 0, "standard", [10, 14]);
  for (const event of [hit(20), hit(25, 2), mark(15), mark(25)]) {
    assert.throws(() => recordCricketEvent(game, event));
    assert.throws(() => getCricketState({ ...game, events: [event] }));
  }
  assert.deepEqual(game.events, []);
  assert.equal(getCricketState(play(game, hit(10, 2))).players[0].marks[10], 2);
});

test("10–14 overflow uses each player's handicap and each open opponent in both variants", () => {
  for (const variant of ["standard", "cutthroat"]) {
    for (const target of [10, 11, 12, 13, 14]) {
      const players = [{ name: "A", marksToClose: 2 }, { name: "B", marksToClose: 4 }, "C"];
      let game = createCricketGame(players, 0, variant, [target, 25]);
      game = play(game, end, end, hit(target, 3), end, hit(target, 3));
      let state = getCricketState(game);
      assert.deepEqual(state.players.map(player => player.marks[target]), [2, 0, 3]);
      assert.equal(state.players[0].scoringMarks[target], 1);
      assert.deepEqual(state.players.map(player => player.points), variant === "standard" ? [target, 0, 0] : [0, target, 0]);
      // B has three marks against a four-mark handicap, so remains open to A's scoring.
      game = play(game, end, hit(target, 3), end, end, hit(target));
      state = getCricketState(game);
      assert.equal(state.players[1].marks[target], 3);
      assert.deepEqual(state.players.map(player => player.points), variant === "standard" ? [target * 2, 0, 0] : [0, target * 2, 0]);
    }
  }
});

test("only the selected targets are required to win with darts or marks in either variant", () => {
  for (const variant of ["standard", "cutthroat"]) {
    for (const targets of [[10], [25], [14, 10], [20, 19, 18, 17, 16, 15, 14, 10], [16, 15, 14, 13, 12, 11, 10, 25]]) {
      for (const mode of ["darts", "marks"]) {
        let game = createCricketGame(["A", "B"], 0, variant, targets);
        for (let index = 0; index < targets.length; index++) {
          const target = targets[index];
          const events = mode === "marks" ? [mark(target), mark(target), mark(target)]
            : target === 25 ? [hit(25, 2), hit(25)] : [hit(target, 3)];
          game = play(game, ...events.slice(0, -1));
          assert.equal(getCricketState(game).winnerId, null);
          game = play(game, events.at(-1));
          assert.equal(getCricketState(game).winnerId, index === targets.length - 1 ? "player-1" : null);
          if (index < targets.length - 1) game = play(game, end, end);
        }
        assert.ok(getCricketState(game).players.every(player => player.points === 0));
      }
    }
  }
});

test("custom targets retain three darts and nine marks per turn, and Bull rejects triples", () => {
  const fresh = () => createCricketGame(["A", "B"], 0, "standard", [10, 25]);
  assert.equal(getCricketState(play(fresh(), hit(10), hit(10), hit(25))).activePlayer, 1);
  let game = fresh();
  for (let count = 0; count < 9; count++) game = play(game, mark(10));
  assert.equal(getCricketState(game).activePlayer, 0);
  assert.equal(getCricketState(game).players[0].points, 60);
  assert.throws(() => play(game, mark(25)));
  assert.throws(() => play(fresh(), hit(25, 3)));
});

test("a custom Cutthroat hit can give an already closed opponent the win", () => {
  let game = createCricketGame(["A", "B", "C"], 0, "cutthroat", [10, 11]);
  game = play(game, end, end, hit(10, 3), hit(10, 3), end, hit(10, 3), hit(11, 3), end);
  assert.equal(getCricketState(game).winnerId, null);
  game = play(game, hit(11, 3), hit(11, 3));
  const state = getCricketState(game);
  assert.deepEqual(state.players.map(player => player.points), [30, 30, 33]);
  assert.equal(state.winnerId, "player-1");
  assert.equal(state.activePlayer, 1);
});

test("next leg, cross-leg undo and redo snapshots keep the custom selection and handicaps", () => {
  for (const mode of ["darts", "marks"]) {
    let match = createCricketMatch([{ name: "A", marksToClose: 1 }, "B"], 0, 3, "cutthroat", [14, 10]);
    match = recordCricketMatchEvent(match, mode === "marks" ? mark(14) : hit(14));
    const beforeWin = match;
    match = recordCricketMatchEvent(match, mode === "marks" ? mark(10) : hit(10));
    assert.deepEqual(getCricketMatchState(match).wins, [1, 0]);
    const next = nextCricketLeg(match);
    assert.deepEqual(next.legs[1].targets, [14, 10]);
    assert.equal(next.legs[1].startingPlayer, 1);
    assert.deepEqual(next.legs[1].players, next.legs[0].players);
    const undone = undoCricketMatchInput(next);
    assert.equal(getCricketMatchState(undone).state.winnerId, null);
    assert.deepEqual(getCricketMatchState(undone).state.targets, [14, 10]);
    if (mode === "marks") assert.deepEqual(undone, beforeWin);
    else assert.deepEqual(undone.legs[0].events, []);
    const restored = JSON.parse(JSON.stringify(next));
    assert.deepEqual(getCricketMatchState(restored), getCricketMatchState(next));
    const rematch = createCricketMatch(next.legs[1].players, 0, next.bestOf, next.legs[1].variant, next.legs[1].targets);
    assert.deepEqual(getCricketMatchState(rematch).state.targets, [14, 10]);
  }
});
