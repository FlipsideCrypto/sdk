import { assert, it } from "vitest";
import { minToMs, msToMin, msToSec, secToMs } from "../utils/time";

it("milliseconds to minutes", () => {
  const minutes = msToMin(60000);
  assert.equal(minutes, 1);
});

it("minutes to milliseconds", () => {
  const ms = minToMs(1);
  assert.equal(ms, 60000);
});

it("milliseconds to seconds", () => {
  const seconds = msToSec(60000);
  assert.equal(seconds, 60);
});

it("seconds to milliseconds", () => {
  const ms = secToMs(60);
  assert.equal(ms, 60000);
});
