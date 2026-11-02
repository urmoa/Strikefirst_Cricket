import test from "node:test";
import assert from "node:assert/strict";
import { createCricketMatch, getCricketMatchState, recordCricketMatchEvent,
  nextCricketLeg, undoCricketMatchEvent } from "../src/lib/cricket.ts";

const end = { type: "end-turn" };
function winLeg(match, player) {
  if (getCricketMatchState(match).state.activePlayer !== player) match = recordCricketMatchEvent(match, end);
  for (const target of [20, 19, 18, 17, 16, 15]) {
    match = recordCricketMatchEvent(match, { type: "hit", target, multiplier: 3 });
    match = recordCricketMatchEvent(match, end);
    match = recordCricketMatchEvent(match, end);
  }
  match = recordCricketMatchEvent(match, { type: "hit", target: 25, multiplier: 2 });
  return recordCricketMatchEvent(match, { type: "hit", target: 25, multiplier: 1 });
}

test("one leg wins the match and rejects additional legs and darts", () => {
  const won = winLeg(createCricketMatch(["A", "B"]), 0);
  assert.equal(getCricketMatchState(won).winnerId, "player-1");
  assert.deepEqual(getCricketMatchState(won).wins, [1, 0]);
  assert.equal(nextCricketLeg(won), won);
  assert.throws(() => recordCricketMatchEvent(won, end), /lõppenud/);
  assert.throws(() => createCricketMatch(["A", "B"], 0, 7), /formaat/);
});

test("best of three ends at two wins, including 2–0 and 2–1", () => {
  for (const winners of [[0, 0], [1, 0, 1]]) {
    let match = createCricketMatch(["Same", "Same"], 1, 3);
    winners.forEach((winner, index) => {
      assert.equal(getCricketMatchState(match).state.activePlayer, (1 + index) % 2);
      assert.equal(getCricketMatchState(match).game.events.length, 0);
      match = winLeg(match, winner);
      if (index < winners.length - 1) {
        assert.equal(getCricketMatchState(match).winnerId, null);
        match = nextCricketLeg(match);
      }
    });
    assert.equal(getCricketMatchState(match).winnerId, `player-${winners.at(-1) + 1}`);
    assert.equal(match.legs.length, winners.length);
    assert.equal(nextCricketLeg(match), match);
  }
});

test("undo removes a leg victory, including from an empty following leg", () => {
  const first = createCricketMatch(["A", "B"], 0, 3);
  assert.equal(nextCricketLeg(first), first);
  assert.equal(undoCricketMatchEvent(first), first);
  const won = winLeg(first, 0);
  const reopened = undoCricketMatchEvent(won);
  assert.deepEqual(getCricketMatchState(reopened).wins, [0, 0]);
  assert.equal(getCricketMatchState(reopened).state.winnerId, null);
  assert.deepEqual(undoCricketMatchEvent(nextCricketLeg(won)), reopened);
  const final = winLeg(nextCricketLeg(won), 0);
  const undone = getCricketMatchState(undoCricketMatchEvent(final));
  assert.equal(undone.winnerId, null);
  assert.deepEqual(undone.wins, [1, 0]);
});

test("best of five requires three wins, including 3–0 and 3–2", () => {
  for (const winners of [[0, 0, 0], [1, 0, 1, 0, 1]]) {
    let match = createCricketMatch(["A", "B"], 0, 5);
    winners.forEach((winner, index) => {
      assert.equal(getCricketMatchState(match).state.activePlayer, index % 2);
      match = winLeg(match, winner);
      if (index < winners.length - 1) {
        assert.equal(getCricketMatchState(match).winnerId, null);
        match = nextCricketLeg(match);
      }
    });
    const final = getCricketMatchState(match);
    assert.equal(final.winnerId, `player-${winners.at(-1) + 1}`);
    assert.equal(final.wins[winners.at(-1)], 3);
    assert.equal(nextCricketLeg(match), match);
    const undone = getCricketMatchState(undoCricketMatchEvent(match));
    assert.equal(undone.winnerId, null);
    assert.equal(undone.wins[winners.at(-1)], 2);
  }
});
