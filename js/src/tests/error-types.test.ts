import { assert, describe, it } from "vitest";
import { ERROR_TYPES } from "../errors/error-types";

describe("error type checks", () => {
  it("ERROR_TYPES.default === GENERIC_FLIPSIDE_ERROR", async () => {
    assert.equal(ERROR_TYPES.default, "GENERIC_FLIPSIDE_ERROR");
  });

  it("ERROR_TYPES.sdk_error === UNEXPECTED_SDK_ERROR", async () => {
    assert.equal(ERROR_TYPES.sdk_error, "UNEXPECTED_SDK_ERROR");
  });

  it("ERROR_TYPES.server_error === SERVER_ERROR", async () => {
    assert.equal(ERROR_TYPES.server_error, "SERVER_ERROR");
  });

  it("ERROR_TYPES.query_run_rate_limit_error === QUERY_RUN_RATE_LIMIT_ERROR", async () => {
    assert.equal(
      ERROR_TYPES.query_run_rate_limit_error,
      "QUERY_RUN_RATE_LIMIT_ERROR"
    );
  });

  it("ERROR_TYPES.query_run_timeout_error === QUERY_RUN_TIMEOUT_ERROR", async () => {
    assert.equal(
      ERROR_TYPES.query_run_timeout_error,
      "QUERY_RUN_TIMEOUT_ERROR"
    );
  });

  it("ERROR_TYPES.query_run_execution_error === QUERY_RUN_EXECUTION_ERROR", async () => {
    assert.equal(
      ERROR_TYPES.query_run_execution_error,
      "QUERY_RUN_EXECUTION_ERROR"
    );
  });

  it("ERROR_TYPES.user_error === USER_ERROR", async () => {
    assert.equal(ERROR_TYPES.user_error, "USER_ERROR");
  });
});
