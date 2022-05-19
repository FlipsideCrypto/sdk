import { assert, describe, it } from "vitest";
import {
  expBackOff,
  getElapsedExpSeconds,
  getElapsedLinearSeconds,
  linearBackOff,
} from "../utils/sleep";

describe("getElapsedLinearSeconds", () => {
  it("1 attempt", () => {
    const config = {
      attempts: 1,
      timeoutMinutes: 5,
      intervalSeconds: 5,
    };
    const elapsed = getElapsedLinearSeconds(config);
    assert.equal(elapsed, 5);
  });

  it("2 attempts", () => {
    const config = {
      attempts: 2,
      timeoutMinutes: 5,
      intervalSeconds: 5,
    };
    const elapsed = getElapsedLinearSeconds(config);
    assert.equal(elapsed, 15);
  });

  it("3 attempts", () => {
    const config = {
      attempts: 3,
      timeoutMinutes: 5,
      intervalSeconds: 5,
    };
    const elapsed = getElapsedLinearSeconds(config);
    assert.equal(elapsed, 30);
  });
});

describe("linearBackOff", () => {
  it("should continue", async () => {
    const config = {
      attempts: 1,
      timeoutMinutes: 5,
      intervalSeconds: 0.1,
    };
    const shouldContinue = await linearBackOff(config);
    assert.equal(shouldContinue, true);
  });

  it("should stop", async () => {
    const config = {
      attempts: 1,
      timeoutMinutes: 0.0001,
      intervalSeconds: 0.1,
    };
    const shouldContinue = await linearBackOff(config);
    assert.equal(shouldContinue, false);
  });
});

describe("getElapsedExpSeconds", () => {
  it("1 attempt", () => {
    const config = {
      attempts: 1,
      timeoutMinutes: 5,
      intervalSeconds: 5,
    };
    const elapsed = getElapsedExpSeconds(config);
    assert.equal(elapsed, 1);
  });

  it("2 attempts", () => {
    const config = {
      attempts: 2,
      timeoutMinutes: 5,
      intervalSeconds: 5,
    };
    const elapsed = getElapsedExpSeconds(config);
    assert.equal(elapsed, 3);
  });

  it("3 attempts", () => {
    const config = {
      attempts: 3,
      timeoutMinutes: 5,
      intervalSeconds: 5,
    };
    const elapsed = getElapsedExpSeconds(config);
    assert.equal(elapsed, 7);
  });
});
describe("expBackOff", () => {
  it("should continue", async () => {
    const config = {
      attempts: 1,
      timeoutMinutes: 5,
      intervalSeconds: 0.1,
    };
    const shouldContinue = await expBackOff(config);
    assert.equal(shouldContinue, true);
  });

  it("should stop", async () => {
    const config = {
      attempts: 1,
      timeoutMinutes: 0.0001,
      intervalSeconds: 0.1,
    };
    const shouldContinue = await expBackOff(config);
    assert.equal(shouldContinue, false);
  });
});
