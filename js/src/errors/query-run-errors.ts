import { BaseError } from "./base-error";
import { ERROR_TYPES } from "./error-types";

export class QueryRunRateLimitError extends BaseError {
  constructor() {
    const errorType = ERROR_TYPES.query_run_rate_limit_error;
    super(
      `${errorType}: you have exceeded the rate limit for creating/running new queries.`
    );
    this.errorType = errorType;
  }
}

export class QueryRunTimeoutError extends BaseError {
  constructor(timeoutMinutes: number) {
    const errorType = ERROR_TYPES.query_run_timeout_error;
    super(
      `${errorType}: your query has timed out after ${timeoutMinutes} minutes.`
    );
    this.errorType = errorType;
  }
}

export class QueryRunExecutionError extends BaseError {
  constructor() {
    const errorType = ERROR_TYPES.query_run_execution_error;
    super(`${errorType}: an error has occured while executing your query`);
    this.errorType = errorType;
  }
}
