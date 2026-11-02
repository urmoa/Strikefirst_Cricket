import test from "node:test";
import assert from "node:assert/strict";
import { CRICKET_TARGETS, createCricketMatch, getCricketMatchState, recordCricketMatchEvent,
  undoCricketMatchInput, nextCricketLeg } from "../src/lib/cricket.ts";

const mark = target => ({ type: "mark", target });
const pass = { type: "end-turn", mode: "marks" };
const state = match => getCricketMatchState(match).state;
const record = (match, ...events) => events.reduce(recordCricketMatchEvent, match);

test("nine marks stay in one visit, the tenth is rejected without changing history", () => {
  let match = createCricketMatch(["A", "B"]);
  for (let count = 1; count <= 9; count++) {
    match = record(match, mark(20));
    assert.equal(state(match).activePlayer, 0);
    assert.equal(state(match).turnMarks.length, count);
    assert.equal(state(match).turnThrows.length, 0);
  }
  assert.equal(state(match).players[0].points, 120);
  const snapshot = structuredClone(match);
  assert.throws(() => record(match, mark(19)));
  assert.deepEqual(match, snapshot);
  assert.equal(match.legs[0].events.length, 9);
});

test("explicit handover supports zero, one and nine marks and advances rounds", () => {
  for (const count of [0, 1, 9]) {
    let match = createCricketMatch(["A", "B"]);
    for (let index = 0; index < count; index++) match = record(match, mark(20));
    match = record(match, pass);
    assert.equal(state(match).activePlayer, 1);
    assert.equal(state(match).round, 1);
    assert.equal(state(match).turnMode, null);
    assert.deepEqual(state(match).turnMarks, []);
    assert.equal(state(match).lastTurn.mode, "marks");
    assert.equal(state(match).lastTurn.marks.length, count);
    assert.deepEqual(state(match).lastTurn.throws, []);
    assert.equal(state(record(match, pass)).round, 2);
  }
});

test("compact input shares standard and cutthroat scoring, including Bull and closed targets", () => {
  for (const variant of ["standard", "cutthroat"]) {
    let match = createCricketMatch(["A", "B"], 0, 1, variant);
    match = record(match, ...Array.from({ length: 4 }, () => mark(20)),
      ...Array.from({ length: 4 }, () => mark(25)));
    assert.equal(state(match).players[variant === "standard" ? 0 : 1].points, 45);
    assert.equal(state(match).players[0].marks[20], 3);
    assert.equal(state(match).players[0].scoringMarks[25], 1);
    match = record(match, pass, mark(20), mark(20), mark(20));
    assert.throws(() => record(match, mark(20)));
    assert.equal(state(match).turnMarks.length, 3);
  }
});

test("visit mode rejects mixing and remains recoverable through replay and undo", () => {
  const initial = createCricketMatch(["A", "B"]);
  const compact = record(initial, mark(20));
  assert.throws(() => record(compact, { type: "miss" }));
  assert.throws(() => record(compact, { type: "hit", target: 20, multiplier: 3 }));
  assert.throws(() => record(compact, { type: "end-turn", mode: "darts" }));
  const darts = record(initial, { type: "hit", target: 20, multiplier: 2 });
  assert.throws(() => record(darts, mark(19)));
  assert.deepEqual(undoCricketMatchInput(darts), initial);
  assert.deepEqual(undoCricketMatchInput(compact), initial);
  assert.deepEqual(undoCricketMatchInput(record(compact, pass)), compact);
  assert.deepEqual(undoCricketMatchInput(record(initial, pass)), initial);
  assert.equal(state(record(createCricketMatch(["A", "B", "C"]), mark(20))).players[0].marks[20], 1);
});

for (const count of [3, 6]) {
  const names = Array.from({ length: count }, (_, index) => `Player ${index + 1}`);
  const cycle = Array.from({ length: count }, () => pass);
  test(`${count} players: nine marks, immutable rejection, handover and nonzero starter rotation`, () => {
    for (const marks of [0, 1, 9]) {
      const initial = createCricketMatch(names, count - 1);
      let match = initial;
      for (let index = 0; index < marks; index++) match = record(match, mark(CRICKET_TARGETS[index % 7]));
      assert.equal(state(match).activePlayer, count - 1);
      assert.equal(state(match).turnMarks.length, marks);
      if (marks === 9) {
        const snapshot = structuredClone(match);
        assert.throws(() => record(match, mark(20)));
        assert.deepEqual(match, snapshot);
        assert.equal(state(undoCricketMatchInput(match)).turnMarks.length, 8);
      }
      const beforePass = match;
      match = record(match, pass);
      assert.deepEqual(undoCricketMatchInput(match), beforePass);
      assert.deepEqual(state(match).lastTurn.marks, state(beforePass).turnMarks);
      assert.equal(state(match).activePlayer, 0);
      assert.equal(state(match).round, 1);
      assert.equal(state(match).turnMode, null);
      assert.deepEqual(state(match).turnMarks, []);
      for (let index = 1; index < count; index++) {
        match = record(match, pass);
        assert.equal(state(match).activePlayer, index);
        assert.equal(state(match).round, index === count - 1 ? 2 : 1);
      }
    }
  });

  test(`${count} players: Bull scoring, protected opponents and globally closed targets`, () => {
    for (const variant of ["standard", "cutthroat"]) {
      let match = createCricketMatch(names, 0, 1, variant);
      // Player 2 closes Bull; the remaining opponents keep it open.
      match = record(match, pass, mark(25), mark(25), mark(25),
        ...Array.from({ length: count - 1 }, () => pass));
      match = record(match, mark(25), mark(25), mark(25), mark(25));
      assert.deepEqual(state(match).players.map(player => player.points),
        names.map((_, index) => variant === "standard" ? (index === 0 ? 25 : 0) : (index >= 2 ? 25 : 0)));
      assert.equal(state(match).players[0].scoringMarks[25], 1);
      match = record(match, pass, pass);
      for (let index = 2; index < count; index++) match = record(match, mark(25), mark(25), mark(25), pass);
      assert.throws(() => record(match, mark(25)));
      assert.equal(state(match).turnMarks.length, 0);
    }
  });

  test(`${count} players: mixed visits, replay, victory and undo from next leg`, () => {
    let match = createCricketMatch(names, 0, 3);
    const compact = record(match, mark(20));
    assert.throws(() => record(compact, { type: "miss" }));
    match = record(compact, pass);
    const beforeDarts = match;
    match = record(match, { type: "miss" }, { type: "miss" });
    assert.throws(() => record(match, mark(20)));
    assert.deepEqual(undoCricketMatchInput(match), beforeDarts);
    match = record(match, { type: "miss" }, ...Array.from({ length: count - 2 }, () => pass));
    for (const target of CRICKET_TARGETS.slice(0, -1)) {
      const needed = 3 - state(match).players[0].marks[target];
      match = record(match, ...Array.from({ length: needed }, () => mark(target)), ...cycle);
    }
    const before = record(match, mark(25), mark(25));
    const won = record(before, mark(25));
    assert.equal(state(won).winnerId, "player-1");
    assert.throws(() => record(won, mark(20)));
    assert.throws(() => record(won, pass));
    assert.deepEqual(undoCricketMatchInput(won), before);
    assert.deepEqual(undoCricketMatchInput(nextCricketLeg(won)), before);
    assert.deepEqual(state(JSON.parse(JSON.stringify(won))), state(won));
  });

  test(`${count} players: a cutthroat mark can award victory to another player`, () => {
    let match = createCricketMatch(names, 0, 3, "cutthroat");
    // Last player gives everyone else 60 points, then player 1 closes everything.
    match = record(match, ...Array.from({ length: count - 1 }, () => pass),
      ...Array.from({ length: 6 }, () => mark(20)), pass);
    for (const target of CRICKET_TARGETS.slice(0, -1)) {
      match = record(match, mark(target), mark(target), mark(target), ...cycle);
    }
    match = record(match, mark(25), mark(25), mark(25), pass,
      ...Array.from({ length: 6 }, () => mark(19)));
    assert.equal(state(match).winnerId, null);
    const won = record(match, mark(19));
    assert.equal(state(won).winnerId, "player-1");
    assert.equal(state(won).activePlayer, 1);
    assert.deepEqual(undoCricketMatchInput(won), match);
    assert.deepEqual(undoCricketMatchInput(nextCricketLeg(won)), match);
  });
}

test("compact history undoes one mark or handover, including a win and the next leg", () => {
  let match = createCricketMatch(["A", "B"], 0, 3);
  for (const target of CRICKET_TARGETS) {
    if (target === 25) break;
    match = record(match, mark(target), mark(target), mark(target), pass, pass);
  }
  const before = record(match, mark(25), mark(25));
  const won = record(before, mark(25));
  assert.equal(state(won).winnerId, "player-1");
  assert.throws(() => record(won, mark(20)));
  assert.throws(() => record(won, pass));
  assert.deepEqual(undoCricketMatchInput(won), before);
  assert.deepEqual(undoCricketMatchInput(nextCricketLeg(won)), before);
  assert.deepEqual(getCricketMatchState(before).wins, [0, 0]);
  const ninth = record(createCricketMatch(["A", "B"]), ...Array.from({ length: 9 }, () => mark(20)));
  const eighth = undoCricketMatchInput(ninth);
  assert.equal(state(eighth).turnMarks.length, 8);
  assert.deepEqual(record(eighth, mark(20)), ninth);
});
