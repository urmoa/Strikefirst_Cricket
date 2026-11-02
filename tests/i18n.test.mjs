import test from "node:test";
import assert from "node:assert/strict";
import { createTranslator, currentLocale, t } from "../src/lib/i18n.ts";
import { et } from "../src/lib/locales/et.ts";

test("Estonian is the default and every static translation is available", () => {
  assert.equal(currentLocale, "et");
  for (const [key, value] of Object.entries(et)) {
    if (!value.includes("{")) assert.equal(t(key), value);
  }
  assert.equal(createTranslator("et")("cricket.start"), "Alusta mängu");
});

test("named placeholders accept numbers and preserve user text literally", () => {
  assert.equal(t("cricket.bestOf", { legs: 5, wins: 3 }), "5 legi (3 võitu)");
  assert.equal(t("cricket.won", { name: "$& {name} Õnne" }), "Võitis $& {name} Õnne!");
  assert.equal(t("cricket.dartLabel", { number: 2, result: "D20" }), "Nool 2: D20");
});
