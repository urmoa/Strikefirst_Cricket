import test from "node:test";
import assert from "node:assert/strict";
import { createCricketMatch, getCricketMatchState, getCricketMatchStatistics } from "../src/lib/cricket.ts";
import { cricketMatchReducer as reduce } from "../src/app/play/cricket/cricket-match-controller.ts";
import { createCricketSetupValues } from "../src/app/play/cricket/cricket-setup-state.ts";
import { CRICKET_SESSION_KEY, readCricketSession, writeCricketSession } from "../src/app/play/cricket/cricket-session.ts";

function fixture(bestOf = 3) {
  const setup = { ...createCricketSetupValues(), bestOf, targets: [20], alternative1v1View: false,
    players: [{ id: 7, name: "Urmo Arr", marksToClose: 1, playerId: 12 },
      { id: 9, name: "Mart Abel", marksToClose: 2 }] };
  let raw = null;
  const storage = { getItem: key => { assert.equal(key, CRICKET_SESSION_KEY); return raw; },
    setItem: (key, value) => { assert.equal(key, CRICKET_SESSION_KEY); raw = value; },
    removeItem: key => { assert.equal(key, CRICKET_SESSION_KEY); raw = null; } };
  const source = () => storage;
  const history = { match: createCricketMatch(setup.players, 0, bestOf, "standard", setup.targets), redo: [] };
  return { setup, history, source, setRaw: value => { raw = value; }, getRaw: () => raw };
}

const mark = { type: "record", event: { type: "mark", target: 20 } };

test("rotated player order restores with setup identities and subsequent legs", () => {
  const { setup, history, source } = fixture();
  const rotated = reduce(history, { type: "rotate-order" });
  const rotatedSetup = { ...setup, players: [...setup.players.slice(1), setup.players[0]] };
  const played = reduce(reduce(rotated, mark), mark);
  const next = reduce(played, { type: "next-leg" });
  assert.equal(next.match.legs.length, 2);
  writeCricketSession(source, next, rotatedSetup);
  const saved = readCricketSession(source);
  assert.deepEqual(saved.history, next);
  assert.deepEqual(saved.setup.players, rotatedSetup.players);
});

test("session restores setup, player identities, exact state and redo after a reload", () => {
  const { setup, history, source } = fixture();
  const nextLeg = reduce(reduce(history, mark), { type: "next-leg" });
  const played = reduce(nextLeg, { type: "record", event: { type: "miss" } });
  const undone = reduce(played, { type: "undo" });
  writeCricketSession(source, undone, setup);
  const saved = readCricketSession(source);
  assert.equal(saved.version, 1);
  assert.equal(typeof saved.updatedAt, "number");
  assert.deepEqual(saved.setup, setup);
  assert.deepEqual(saved.history, undone);
  assert.deepEqual(getCricketMatchState(saved.history.match), getCricketMatchState(undone.match));
  assert.deepEqual(reduce(saved.history, { type: "redo" }), played);
});

test("new-game setup keeps the old save until the replacement actually starts", () => {
  const { setup, history, source, getRaw } = fixture();
  writeCricketSession(source, history, setup);
  const original = getRaw();
  writeCricketSession(source, reduce(history, { type: "setup" }), { ...setup, players: [] });
  assert.equal(getRaw(), original);
  const replacement = { ...setup, players: setup.players.map(player => ({ ...player, name: `${player.name} uus` })) };
  writeCricketSession(source, { match: createCricketMatch(replacement.players, 0, 3, "standard", [20]), redo: [] }, replacement);
  assert.deepEqual(readCricketSession(source).setup, replacement);
});

test("completed legs and matches retain results after reload, including undo and redo", () => {
  const { setup, history, source } = fixture();
  const legWon = reduce(history, mark);
  writeCricketSession(source, legWon, setup);
  assert.ok(readCricketSession(source));
  const next = reduce(legWon, { type: "next-leg" });
  const passed = reduce(next, { type: "record", event: { type: "end-turn" } });
  const won = reduce(passed, mark);
  assert.equal(getCricketMatchState(won.match).winnerId, "player-1");
  writeCricketSession(source, won, setup);
  const restored = readCricketSession(source);
  assert.deepEqual(restored.history, won);
  assert.deepEqual(getCricketMatchStatistics(restored.history.match), getCricketMatchStatistics(won.match));
  const undone = reduce(won, { type: "undo" });
  writeCricketSession(source, undone, setup);
  assert.deepEqual(readCricketSession(source).history, undone);
  const redone = reduce(readCricketSession(source).history, { type: "redo" });
  assert.deepEqual(redone, won);
});

test("invalid and incompatible saves are discarded", () => {
  const { setup, history, source, setRaw, getRaw } = fixture();
  writeCricketSession(source, history, setup);
  const valid = JSON.parse(getRaw());
  const mutations = [
    saved => { saved.version = 2; },
    saved => { saved.setup.players = []; },
    saved => { saved.setup.alternative1v1View = "false"; },
    saved => { saved.history.match.bestOf = 2; },
    saved => { saved.history.match.legs = []; },
    saved => { saved.history.match.legs[0].players[0].name = "Other"; },
    saved => { saved.history.match.legs[0].events = [{ type: "hit", target: 20, multiplier: 7 }]; },
    saved => { saved.history.match.legs.push(structuredClone(saved.history.match.legs[0])); },
    saved => { saved.history.redo = [{}]; },
  ];
  for (const mutate of mutations) {
    const saved = structuredClone(valid);
    mutate(saved);
    setRaw(JSON.stringify(saved));
    assert.equal(readCricketSession(source), null);
    assert.equal(getRaw(), null);
  }
  setRaw("{broken");
  assert.equal(readCricketSession(source), null);
});

test("unavailable storage, failed reads, quota errors and failed cleanup do not interrupt play", () => {
  const { setup, history } = fixture();
  const blocked = () => { throw new Error("SecurityError"); };
  assert.equal(readCricketSession(blocked), null);
  assert.doesNotThrow(() => writeCricketSession(blocked, history, setup));
  const broken = () => ({ getItem: blocked, setItem: blocked, removeItem: blocked });
  assert.equal(readCricketSession(broken), null);
  assert.doesNotThrow(() => writeCricketSession(broken, history, setup));
  assert.doesNotThrow(() => writeCricketSession(broken, reduce(history, { type: "setup" }), setup));
});

test("independent storage sessions do not share matches", () => {
  const first = fixture();
  const second = fixture();
  writeCricketSession(first.source, first.history, first.setup);
  assert.equal(readCricketSession(second.source), null);
  assert.ok(readCricketSession(first.source));
});

test("multiplayer series can restore more legs than the best-of format number", () => {
  const { source } = fixture();
  const setup = { ...createCricketSetupValues(), bestOf: 3, targets: [20],
    players: ["A", "B", "C", "D"].map((name, id) => ({ id, name, marksToClose: 1 })) };
  let history = { match: createCricketMatch(setup.players, 0, 3, "cutthroat", [20]), redo: [] };
  for (let index = 0; index < 4; index++) {
    history = reduce(history, mark);
    history = reduce(history, { type: "next-leg" });
  }
  assert.equal(history.match.legs.length, 5);
  assert.equal(getCricketMatchState(history.match).winnerId, null);
  writeCricketSession(source, history, setup);
  assert.deepEqual(readCricketSession(source).history, history);
});
