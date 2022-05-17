import { API } from "../../api";
import {
  Query,
  QueryDefaults,
  QueryStatusFinished,
  QueryStatusError,
  QueryResultJson,
  CreateQueryJson,
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
  UnexpectedSDKError,
} from "../../errors";
import { QueryResultSet } from "./query-result-set";

const GET_RESULTS_INTERVAL_SECONDS = 0.5;
const DEFAULTS: QueryDefaults = {
  ttlMinutes: 60,
  cached: true,
  timeoutMinutes: 20,
};

export class QueryIntegration {
  #api: API;

  constructor(api: API) {
    this.#api = api;
  }

  #setQueryDefaults(query: Query): Query {
    return { ...DEFAULTS, ...query };
  }

  async run(query: Query): Promise<QueryResultSet> {
    query = this.#setQueryDefaults(query);

    const [createQueryJson, createQueryErr] = await this.#createQuery(query);
    if (createQueryErr) {
      return new QueryResultSet({
        queryResultJson: null,
        error: createQueryErr,
      });
    }

    if (!createQueryJson) {
      return new QueryResultSet({
        queryResultJson: null,
        error: new UnexpectedSDKError(
          "expected a `createQueryJson` but got null"
        ),
      });
    }

    const [getQueryResultJson, getQueryErr] = await this.#getQueryResult(
      createQueryJson.token
    );

    if (getQueryErr) {
      return new QueryResultSet({
        queryResultJson: null,
        error: getQueryErr,
      });
    }

    if (!getQueryResultJson) {
      return new QueryResultSet({
        queryResultJson: null,
        error: new UnexpectedSDKError(
          "expected a `getQueryResultJson` but got null"
        ),
      });
    }

    return new QueryResultSet({
      queryResultJson: getQueryResultJson,
      error: null,
    });
  }

  async #createQuery(
    query: Query,
    attempts: number = 0
  ): Promise<
    [CreateQueryJson | null, QueryRunRateLimitError | ServerError | null]
  > {
    const resp = await this.#api.createQuery(query);
    if (resp.status <= 299) {
      const createQueryJson = await resp.json();
      return [createQueryJson, null];
    }

    if (resp.status !== 429) {
      return [null, new ServerError(resp.status, resp.statusText)];
    }

    let shouldContinue = await expBackOff({
      attempts,
      timeoutMinutes: DEFAULTS.timeoutMinutes,
    });

    if (!shouldContinue) {
      return [null, new QueryRunRateLimitError()];
    }

    return this.#createQuery(query, attempts + 1);
  }

  async #getQueryResult(
    queryID: string,
    attempts: number = 0
  ): Promise<
    [QueryResultJson | null, QueryRunTimeoutError | ServerError | null]
  > {
    const resp = await this.#api.getQueryResult(queryID);
    if (resp.status > 299) {
      return [null, new ServerError(resp.status, resp.statusText)];
    }

    let result = await resp.json();
    if (result.status === QueryStatusFinished) {
      return [result, null];
    }

    if (result.status === QueryStatusError) {
      return [null, new QueryRunExecutionError()];
    }

    let shouldContinue = await linearBackOff({
      attempts,
      timeoutMinutes: DEFAULTS.timeoutMinutes,
      intervalSeconds: GET_RESULTS_INTERVAL_SECONDS,
    });

    if (!shouldContinue) {
      const elapsedMinutes = getElapsedLinearSeconds({
        attempts,
        timeoutMinutes: DEFAULTS.timeoutMinutes,
        intervalSeconds: GET_RESULTS_INTERVAL_SECONDS,
      });
      return [null, new QueryRunTimeoutError(elapsedMinutes)];
    }

    return this.#getQueryResult(queryID, attempts + 1);
  }
}
