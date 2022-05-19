import { assert, describe, it } from "vitest";
import {
  QueryStatusError,
  QueryStatusFinished,
  QueryStatusPending,
} from "../types";

describe("queryStatus checks", () => {
  it("QueryStatusFinished === finished", async () => {
    assert.equal(QueryStatusFinished, "finished");
  });
  it("QueryStatusPending === pending", async () => {
    assert.equal(QueryStatusPending, "pending");
  });
  it("QueryStatusError === error", async () => {
    assert.equal(QueryStatusError, "error");
  });
});
