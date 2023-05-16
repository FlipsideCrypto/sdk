import { BaseError } from "./base-error";
import { ERROR_TYPES } from "./error-types";

export class QueryRunRateLimitError extends BaseError {
  constructor() {
    const errorType = ERROR_TYPES.query_run_rate_limit_error;
    super(`${errorType}: you have exceeded the rate limit for creating/running new queries.`);
    this.errorType = errorType;
  }
}

export class QueryRunTimeoutError extends BaseError {
  constructor(timeoutMinutes: number) {
    const errorType = ERROR_TYPES.query_run_timeout_error;
    super(`${errorType}: your query has timed out after ${timeoutMinutes} minutes.`);
    this.errorType = errorType;
  }
}

export class QueryRunExecutionError extends BaseError {
  constructor({
    name,
    message,
    data,
  }: {
    name?: string | undefined | null;
    message?: string | undefined | null;
    data?: Record<any, any> | undefined | null;
  }) {
    const errorType = ERROR_TYPES.query_run_execution_error;
    if (!name && !message && !data) {
      super(`${errorType}: an error has occured while executing your query.`);
    } else {
      super(
        `${errorType}: an error has occured while executing your query: name=${name} - message=${message} - data=${data}`
      );
    }
    this.errorType = errorType;
    if (name) {
      this.name = name;
    }
    if (message) {
      this.message = message;
    }
    if (data) {
      this.data = data;
    }
  }
}
