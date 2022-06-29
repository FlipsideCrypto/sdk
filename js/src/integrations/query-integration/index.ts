import {
  Query,
  QueryDefaults,
  QueryStatusFinished,
  QueryStatusError,
  QueryResultJson,
  CreateQueryJson,
  ApiClient,
  QueryResultSet,
} from "../../types";
import {
  expBackOff,
  getElapsedLinearSeconds,
  linearBackOff,
} from "../../utils/sleep";
import {
  QueryRunExecutionError,
  QueryRunRateLimitError,
  QueryRunTimeoutError,
  ServerError,
  UserError,
  UnexpectedSDKError,
} from "../../errors";
import { QueryResultSetBuilder } from "./query-result-set-builder";

const DEFAULTS: QueryDefaults = {
  ttlMinutes: 60,
  cached: true,
  timeoutMinutes: 20,
  retryIntervalSeconds: 0.5,
  pageSize: 100000,
  pageNumber: 1,
};

export class QueryIntegration {
  #api: ApiClient;
  #defaults: QueryDefaults;

  constructor(api: ApiClient, defaults: QueryDefaults = DEFAULTS) {
    this.#api = api;
    this.#defaults = defaults;
  }

  #setQueryDefaults(query: Query): Query {
    return { ...this.#defaults, ...query };
  }

  async run(query: Query): Promise<QueryResultSet> {
    query = this.#setQueryDefaults(query);

    const [createQueryJson, createQueryErr] = await this.#createQuery(query);
    if (createQueryErr) {
      return new QueryResultSetBuilder({
        queryResultJson: null,
        error: createQueryErr,
      });
    }

    if (!createQueryJson) {
      return new QueryResultSetBuilder({
        queryResultJson: null,
        error: new UnexpectedSDKError(
          "expected a `createQueryJson` but got null"
        ),
      });
    }

    const [getQueryResultJson, getQueryErr] = await this.#getQueryResult(
      createQueryJson.token,
      query.pageNumber || 1,
      query.pageSize || 100000,
    );

    if (getQueryErr) {
      return new QueryResultSetBuilder({
        queryResultJson: null,
        error: getQueryErr,
      });
    }


    if (!getQueryResultJson) {
      return new QueryResultSetBuilder({
        queryResultJson: null,
        error: new UnexpectedSDKError(
          "expected a `getQueryResultJson` but got null"
        ),
      });
    }

    return new QueryResultSetBuilder({
      queryResultJson: getQueryResultJson,
      error: null,
    });
  }

  async #createQuery(
    query: Query,
    attempts: number = 0
  ): Promise<
    [
      CreateQueryJson | null,
      QueryRunRateLimitError | ServerError | UserError | null
    ]
  > {
    const resp = await this.#api.createQuery(query);
    if (resp.statusCode <= 299) {
      return [resp.data, null];
    }

    if (resp.statusCode !== 429) {
      if (resp.statusCode >= 400 && resp.statusCode <= 499) {
        let errorMsg = resp.statusMsg || "user error";
        if (resp.errorMsg) {
          errorMsg = resp.errorMsg;
        }
        return [null, new UserError(resp.statusCode, errorMsg)];
      }
      return [
        null,
        new ServerError(resp.statusCode, resp.statusMsg || "server error"),
      ];
    }

    let shouldContinue = await expBackOff({
      attempts,
      timeoutMinutes: this.#defaults.timeoutMinutes,
      intervalSeconds: this.#defaults.retryIntervalSeconds,
    });

    if (!shouldContinue) {
      return [null, new QueryRunRateLimitError()];
    }

    return this.#createQuery(query, attempts + 1);
  }

  async #getQueryResult(
    queryID: string,
    pageNumber: number,
    pageSize: number,
    attempts: number = 0
  ): Promise<
    [
      QueryResultJson | null,
      QueryRunTimeoutError | ServerError | UserError | null
    ]
  > {
    const resp = await this.#api.getQueryResult(queryID, pageNumber, pageSize);
    if (resp.statusCode > 299) {
      if (resp.statusCode >= 400 && resp.statusCode <= 499) {
        let errorMsg = resp.statusMsg || "user input error";
        if (resp.errorMsg) {
          errorMsg = resp.errorMsg;
        }
        return [null, new UserError(resp.statusCode, errorMsg)];
      }
      return [
        null,
        new ServerError(resp.statusCode, resp.statusMsg || "server error"),
      ];
    }

    if (!resp.data) {
      throw new Error(
        "valid status msg returned from server but no data exists in the response"
      );
    }

    if (resp.data.status === QueryStatusFinished) {
      return [resp.data, null];
    }

    if (resp.data.status === QueryStatusError) {
      return [null, new QueryRunExecutionError()];
    }

    let shouldContinue = await linearBackOff({
      attempts,
      timeoutMinutes: this.#defaults.timeoutMinutes,
      intervalSeconds: this.#defaults.retryIntervalSeconds,
    });

    if (!shouldContinue) {
      const elapsedSeconds = getElapsedLinearSeconds({
        attempts,
        timeoutMinutes: this.#defaults.timeoutMinutes,
        intervalSeconds: this.#defaults.retryIntervalSeconds,
      });
      return [null, new QueryRunTimeoutError(elapsedSeconds * 60)];
    }

    return this.#getQueryResult(queryID, pageNumber, pageSize, attempts + 1);
  }
}
