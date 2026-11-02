import test from "node:test";
import assert from "node:assert/strict";
import { createCricketGame, getCricketState, recordCricketEvent } from "../src/lib/cricket.ts";

const hit = (target, multiplier = 1) => ({ type: "hit", target, multiplier });
const end = { type: "end-turn" };
const miss = { type: "miss" };
const fresh = () => createCricketGame(["A", "B"]);
const play = (game, ...events) => events.reduce(recordCricketEvent, game);

// Keep A's turn, letting B pass, while A closes the numbered targets.
function closeNumbers(game) {
  for (const target of [20, 19, 18, 17, 16, 15]) {
    game = play(game, hit(target, 3), end, end);
  }
  return game;
}

test("setup trims names, defaults blank names and respects the starter", () => {
  const game = createCricketGame(["  Mari  ", "   "], 1);
  const state = getCricketState(game);
  assert.deepEqual(state.players.map(p => p.name), ["Mari", "Mängija 2"]);
  assert.equal(state.activePlayer, 1);
  assert.equal(state.round, 1);
  assert.equal(state.winnerId, null);
  assert.ok(state.players.every(p => p.points === 0 && Object.values(p.marks).every(n => n === 0)));
});

test("single, double and triple give 1, 2 and 3 marks without closing points", () => {
  for (const multiplier of [1, 2, 3]) {
    const state = getCricketState(play(fresh(), hit(20, multiplier)));
    assert.equal(state.players[0].marks[20], multiplier);
    assert.equal(state.players[0].points, 0);
  }
});

test("a closing triple with two existing marks gives 40 points", () => {
  const state = getCricketState(play(fresh(), hit(20, 2), hit(20, 3)));
  assert.equal(state.players[0].marks[20], 3);
  assert.equal(state.players[0].points, 40);
});

test("an open opponent allows 60 points on a previously closed 20", () => {
  const state = getCricketState(play(fresh(), hit(20, 3), hit(20, 3)));
  assert.equal(state.players[0].points, 60);
  assert.equal(state.players[0].marks[20], 3);
});

test("a target closed by both gives no points but consumes a dart", () => {
  const game = play(fresh(), hit(20, 3), end, hit(20, 3), end, hit(20, 3));
  const state = getCricketState(game);
  assert.deepEqual(state.players.map(p => p.points), [0, 0]);
  assert.equal(state.turnThrows.length, 1);
});

test("bull gives one or two marks and overflow is worth 25 per mark", () => {
  assert.equal(getCricketState(play(fresh(), hit(25))).players[0].marks[25], 1);
  const state = getCricketState(play(fresh(), hit(25, 2), hit(25, 2)));
  assert.equal(state.players[0].marks[25], 3);
  assert.equal(state.players[0].points, 25);
});

test("marks accumulate across turns, including on different targets", () => {
  const state = getCricketState(play(fresh(), hit(20), hit(19), end, end, hit(20, 2)));
  assert.equal(state.players[0].marks[20], 3);
  assert.equal(state.players[0].marks[19], 1);
});

test("three misses switch players and a complete rotation increments the round", () => {
  let game = createCricketGame(["A", "B"], 1);
  game = play(game, miss, miss, miss);
  let state = getCricketState(game);
  assert.equal(state.activePlayer, 0);
  assert.equal(state.round, 1);
  assert.equal(state.turnThrows.length, 0);
  game = play(game, miss, miss, miss);
  state = getCricketState(game);
  assert.equal(state.activePlayer, 1);
  assert.equal(state.round, 2);
});

test("end-turn skips unused darts without inserting fictional throws", () => {
  const game = play(fresh(), hit(18), end);
  const state = getCricketState(game);
  assert.equal(state.activePlayer, 1);
  assert.equal(state.turnThrows.length, 0);
  assert.equal(game.events.length, 2);
  assert.equal(state.players[0].marks[18], 1);
});

test("closing all targets while behind does not win; catching up to a tie wins", () => {
  let game = play(fresh(), end, hit(20, 3), hit(20, 3), end);
  game = closeNumbers(game);
  game = play(game, hit(25, 2), hit(25), end, end);
  let state = getCricketState(game);
  assert.equal(state.players[1].points, 60);
  assert.equal(state.winnerId, null);
  game = play(game, hit(15, 3));
  assert.equal(getCricketState(game).winnerId, null);
  game = play(game, hit(15));
  state = getCricketState(game);
  assert.equal(state.players[0].points, 60);
  assert.equal(state.winnerId, "player-1");
  assert.equal(state.turnThrows.length, 2);
});

test("victory on the first dart stops immediately and rejects subsequent actions", () => {
  let game = closeNumbers(fresh());
  game = play(game, hit(25, 2), end, end, hit(25));
  const state = getCricketState(game);
  assert.equal(state.winnerId, "player-1");
  assert.equal(state.activePlayer, 0);
  assert.equal(state.turnThrows.length, 1);
  for (const event of [miss, end, hit(20)]) {
    assert.throws(() => recordCricketEvent(game, event), /lõppenud/);
  }
  assert.throws(() => getCricketState({ ...game, events: [...game.events, miss] }), /lõppenud/);
});

test("replay is deterministic and appending does not mutate previous game or state", () => {
  const game = play(fresh(), hit(20, 2));
  const snapshot = JSON.stringify(game);
  const before = getCricketState(game);
  const next = recordCricketEvent(game, hit(20, 3));
  assert.equal(JSON.stringify(game), snapshot);
  assert.equal(before.players[0].marks[20], 2);
  assert.deepEqual(getCricketState(JSON.parse(JSON.stringify(next))), getCricketState(next));
  const altered = getCricketState(next);
  altered.players[0].marks[20] = 0;
  altered.turnThrows[0].multiplier = 1;
  assert.equal(getCricketState(next).players[0].marks[20], 3);
  assert.equal(next.events[0].multiplier, 2);
});

test("invalid targets, multipliers and events are rejected at runtime", () => {
  for (const event of [hit(25, 3), hit(14), hit(20, 0), hit(20, 4), hit(20, 1.5),
    hit("20"), { type: "other" }, null]) {
    assert.throws(() => recordCricketEvent(fresh(), event), /tabamus/);
  }
});

test("invalid setup and unsupported versions are rejected", () => {
  for (const starter of [-1, 2, 0.5, NaN]) {
    assert.throws(() => createCricketGame(["A", "B"], starter), /seadistus/);
  }
  for (const change of [{ version: 2 }, { variant: "cut-throat" }, { players: [] },
    { players: [{ id: "same", name: "A" }, { id: "same", name: "B" }] }, { events: null }]) {
    assert.throws(() => getCricketState({ ...fresh(), ...change }), /seadistus/);
  }
});

const undo = game => ({ ...game, events: game.events.slice(0, -1) });

test("undo restores scoring, a third dart and an early turn ending exactly", () => {
  const two = play(fresh(), hit(20, 2), hit(20, 3));
  assert.equal(getCricketState(two).players[0].points, 40);
  assert.equal(getCricketState(undo(two)).players[0].points, 0);
  assert.equal(getCricketState(undo(two)).players[0].marks[20], 2);
  for (const event of [miss, end]) {
    const next = recordCricketEvent(two, event);
    assert.equal(getCricketState(next).activePlayer, 1);
    assert.deepEqual(getCricketState(undo(next)), getCricketState(two));
  }
  const round = play(two, miss, end);
  assert.equal(getCricketState(round).round, 2);
  assert.equal(getCricketState(undo(round)).round, 1);
});

test("third-dart victory does not switch players and undo reopens the game", () => {
  const before = play(closeNumbers(fresh()), hit(25), hit(25));
  const won = recordCricketEvent(before, hit(25));
  const state = getCricketState(won);
  assert.equal(state.winnerId, "player-1");
  assert.equal(state.activePlayer, 0);
  assert.equal(state.turnThrows.length, 3);
  assert.deepEqual(getCricketState(undo(won)), getCricketState(before));
  assert.doesNotThrow(() => recordCricketEvent(undo(won), miss));
});

test("undo first- and second-dart victories restores the exact prior state", () => {
  const numbers = closeNumbers(fresh());
  for (const before of [play(numbers, hit(25, 2), end, end), play(numbers, hit(25, 2))]) {
    const won = recordCricketEvent(before, hit(25));
    assert.equal(getCricketState(won).winnerId, "player-1");
    assert.deepEqual(getCricketState(undo(won)), getCricketState(before));
  }
});

test("last turn is replayed for automatic, early and empty turns, including undo", () => {
  assert.equal(getCricketState(fresh()).lastTurn, null);
  const auto = play(fresh(), hit(20), hit(25, 2), miss);
  assert.deepEqual(getCricketState(auto).lastTurn, {
    playerId: "player-1", throws: [hit(20), hit(25, 2), miss], marks: [], mode: "darts", endedEarly: false,
  });
  const early = play(auto, hit(19), end);
  assert.deepEqual(getCricketState(early).lastTurn, {
    playerId: "player-2", throws: [hit(19)], marks: [], mode: "darts", endedEarly: true,
  });
  assert.deepEqual(getCricketState(undo(early)).lastTurn, getCricketState(auto).lastTurn);
  const empty = recordCricketEvent(early, end);
  assert.deepEqual(getCricketState(empty).lastTurn, { playerId: "player-1", throws: [], marks: [], mode: "darts", endedEarly: true });
  assert.deepEqual(getCricketState(undo(empty)), getCricketState(early));
  assert.equal(getCricketState(undo(auto)).lastTurn, null);
});
