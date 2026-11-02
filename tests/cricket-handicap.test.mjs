import test from "node:test";
import assert from "node:assert/strict";
import { CRICKET_TARGETS, createCricketGame, getCricketState, recordCricketEvent,
  isCricketTargetClosed, createCricketMatch, getCricketMatchState, recordCricketMatchEvent,
  nextCricketLeg, undoCricketMatchInput } from "../src/lib/cricket.ts";

const hit = (target, multiplier = 1) => ({ type: "hit", target, multiplier });
const mark = target => ({ type: "mark", target });
const end = { type: "end-turn" };
const play = (game, ...events) => events.reduce(recordCricketEvent, game);
const setup = (...limits) => limits.map(marksToClose => ({ name: "Same", marksToClose }));

test("new and legacy games default to three without mutating legacy configuration", () => {
  const fresh = createCricketGame(["A", { name: " B " }]);
  assert.deepEqual(fresh.players.map(p => p.marksToClose), [3, 3]);
  assert.equal(fresh.players[1].name, "B");
  const legacy = { ...fresh, players: fresh.players.map(({ marksToClose, ...p }) => p),
    events: [hit(20, 3), hit(20)] };
  const before = JSON.stringify(legacy);
  const state = getCricketState(legacy);
  assert.deepEqual(state.players.map(p => p.marksToClose), [3, 3]);
  assert.equal(state.players[0].points, 20);
  assert.equal(JSON.stringify(legacy), before);
});

test("invalid explicit limits are rejected by creation and replay", () => {
  for (const value of [0, -1, 1.5, 10, "3", null, NaN, Infinity]) {
    assert.throws(() => createCricketGame(setup(value, 3)), /seadistus/);
    const game = createCricketGame(["A", "B"]);
    game.players[0].marksToClose = value;
    assert.throws(() => getCricketState(game), /seadistus/);
  }
});

test("each limit closes at its own threshold, including overflow and Bull", () => {
  for (const limit of [1, 2, 3, 4, 9]) {
    for (const target of [20, 25]) {
      let game = createCricketGame(setup(limit, 9));
      for (let index = 0; index < limit - 1; index++) {
        game = play(game, mark(target));
      }
      let player = getCricketState(game).players[0];
      assert.equal(isCricketTargetClosed(player, target), false);
      // End both visits to switch to dart input without changing the active player.
      game = play(game, end, end, hit(target, target === 25 ? 2 : 3));
      player = getCricketState(game).players[0];
      assert.equal(player.marks[target], limit);
      assert.equal(isCricketTargetClosed(player, target), true);
      assert.equal(player.scoringMarks[target], target === 25 ? 1 : 2);
      assert.equal(player.points, target * (target === 25 ? 1 : 2));
    }
  }
});

for (const variant of ["standard", "cutthroat"]) {
  test(`${variant}: each opponent's own limit controls scoring and global closure`, () => {
    let game = createCricketGame(setup(2, 1, 4), 1, variant);
    game = play(game, hit(20), end, hit(20, 3), end, hit(20, 3));
    let state = getCricketState(game);
    assert.deepEqual(state.players.map(p => p.marks[20]), [2, 1, 3]);
    assert.deepEqual(state.players.map(p => p.points), variant === "standard" ? [20, 0, 0] : [0, 0, 20]);
    assert.equal(state.players[0].scoringMarks[20], 1);
    // Scoring remains possible despite the thrower already being closed.
    game = play(game, end, end, end, mark(20), end, end, mark(20));
    state = getCricketState(game);
    assert.deepEqual(state.players.map(p => p.points), variant === "standard" ? [40, 0, 0] : [0, 0, 40]);
    assert.ok(state.players.every(p => isCricketTargetClosed(p, 20)));
    const snapshot = JSON.stringify(game);
    assert.throws(() => recordCricketEvent(game, mark(20)), /tabamus/);
    assert.equal(JSON.stringify(game), snapshot);
  });
}

test("handicap does not alter three darts, nine compact marks or mode locking", () => {
  const darts = play(createCricketGame(setup(1, 9)), hit(20, 3), hit(19, 2), { type: "miss" });
  assert.equal(getCricketState(darts).activePlayer, 1);
  let compact = createCricketGame(setup(9, 1));
  for (let index = 0; index < 9; index++) compact = play(compact, mark(20));
  const state = getCricketState(compact);
  assert.equal(state.activePlayer, 0);
  assert.equal(state.turnMarks.length, 9);
  assert.equal(state.players[0].marks[20], 9);
  assert.throws(() => recordCricketEvent(compact, mark(19)), /tabamus/);
  assert.throws(() => recordCricketEvent(compact, hit(19)), /sisestus/);
  assert.equal(getCricketState(play(compact, end)).activePlayer, 1);
});

test("personal closure wins in either variant and limits survive legs, undo, redo and rematch", () => {
  for (const variant of ["standard", "cutthroat"]) {
    let match = createCricketMatch(setup(1, 4), 0, 3, variant);
    for (const [index, target] of CRICKET_TARGETS.entries()) {
      if (index > 0 && index % 3 === 0) {
        match = recordCricketMatchEvent(recordCricketMatchEvent(match, end), end);
      }
      match = recordCricketMatchEvent(match, mark(target));
    }
    const won = getCricketMatchState(match);
    assert.equal(won.state.winnerId, "player-1");
    assert.throws(() => recordCricketMatchEvent(match, end), /lõppenud/);
    const next = nextCricketLeg(match);
    const nextState = getCricketMatchState(next);
    assert.deepEqual(nextState.state.players.map(p => p.marksToClose), [1, 4]);
    assert.equal(nextState.state.activePlayer, 1);
    assert.ok(nextState.state.players.every(p => p.points === 0 && Object.values(p.marks).every(n => n === 0)));
    const undone = undoCricketMatchInput(next);
    assert.equal(undone.legs.length, 1);
    assert.equal(getCricketMatchState(undone).state.winnerId, null);
    assert.equal(getCricketMatchState(undone).state.players[0].marks[25], 0);
    assert.deepEqual(getCricketMatchState(recordCricketMatchEvent(undone, mark(25))), won);
    // Redo restores the same immutable match snapshot, including the next leg.
    assert.deepEqual(getCricketMatchState(JSON.parse(JSON.stringify(next))), nextState);
    const rematch = createCricketMatch(won.game.players, 0, match.bestOf, variant);
    assert.deepEqual(getCricketMatchState(rematch).state.players.map(p => p.marksToClose), [1, 4]);
    assert.equal(rematch.legs[0].events.length, 0);
  }
});

test("a cutthroat penalty can award victory to an opponent with a different limit", () => {
  let game = createCricketGame(setup(1, 2, 4), 0, "cutthroat");
  game = play(game, hit(20), end, hit(20, 3), end, end);
  assert.equal(getCricketState(game).players[0].points, 0);
  // B's triple closed at two and only penalized the still-open C.
  assert.deepEqual(getCricketState(game).players.map(p => p.points), [0, 0, 20]);
  // Give A a deficit on 19, then close A's remaining targets.
  game = play(game, end, hit(19, 3), end, end);
  for (const target of [19, 18, 17, 16, 15, 25]) {
    game = play(game, hit(target), end, end, end);
  }
  assert.equal(getCricketState(game).winnerId, null);
  game = play(game, end, end, hit(20, 3), hit(20, 2));
  // C closes at four and penalizes only open players; both A and B are closed on 20.
  assert.equal(getCricketState(game).winnerId, null);
  // C closes 18 with overflow; B is open and receives enough to catch A's deficit.
  game = play(game, end, end, end, hit(18, 3), hit(18, 3));
  assert.equal(getCricketState(game).winnerId, "player-1");
});
