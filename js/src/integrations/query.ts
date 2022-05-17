import { API } from "../api";
import {
  QueryRun,
  CreateQueryResp,
  QueryResultResp,
  QueryStatusFinished,
  QueryStatusError,
  QueryRunDefaults,
  QueryResultJson,
  CreateQueryJson,
} from "../types";
import {
  expBackOff,
  getElapsedLinearSeconds,
  linearBackOff,
} from "../utils/sleep";
import {
  QueryRunExecutionError,
  QueryRunRateLimitError,
  QueryRunTimeoutError,
  ServerError,
  UnexpectedSDKError,
} from "../errors";
import { QueryResultInterface } from "../types/query-result.type";

const GET_RESULTS_INTERVAL_SECONDS = 0.5;
const DEFAULTS: QueryRunDefaults = {
  ttlMinutes: 60,
  cached: true,
  timeoutMinutes: 20,
};

export class Query {
  #api: API;

  constructor(api: API) {
    this.#api = api;
  }

  #setQueryRunDefaults(queryRun: QueryRun): QueryRun {
    return { ...DEFAULTS, ...queryRun };
  }

  async run(queryRun: QueryRun): Promise<QueryResult> {
    queryRun = this.#setQueryRunDefaults(queryRun);

    const [createQueryJson, createQueryErr] = await this.#createQuery(queryRun);
    if (createQueryErr) {
      return new QueryResult(null, createQueryErr);
    }

    if (!createQueryJson) {
      return new QueryResult(
        null,
        new UnexpectedSDKError("expected a `createQueryJson` but got null")
      );
    }

    const [getQueryResultJson, getQueryErr] = await this.#getQueryResult(
      createQueryJson.token
    );

    if (getQueryErr) {
      return new QueryResult(null, getQueryErr);
    }

    if (!getQueryResultJson) {
      return new QueryResult(
        null,
        new UnexpectedSDKError("expected a `getQueryResultJson` but got null")
      );
    }

    return new QueryResult(getQueryResultJson, null);
  }

  async #createQuery(
    queryRun: QueryRun,
    attempts: number = 0
  ): Promise<
    [CreateQueryJson | null, QueryRunRateLimitError | ServerError | null]
  > {
    const resp = await this.#api.createQuery(queryRun);
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

    return this.#createQuery(queryRun, attempts + 1);
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
    console.log("result", result);
    console.log(
      "result.status === QueryStatusFinished",
      result.status === QueryStatusFinished
    );
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

export class QueryResult implements QueryResultInterface {
  data: QueryResultJson | null;
  error:
    | QueryRunRateLimitError
    | QueryRunTimeoutError
    | QueryRunExecutionError
    | ServerError
    | UnexpectedSDKError
    | null;

  constructor(data: QueryResultJson | null, error: any) {
    this.data = data;
    this.error = error;
  }

  all(): Record<string, string | number | null | boolean>[] | null {
    if (!this.data) {
      return null;
    }

    let columnLabels = this.data.columnLabels;
    if (!columnLabels) {
      return null;
    }

    return this.data.results.map((result) => {
      let row: Record<string, string | number | null | boolean> = {};
      result.forEach((value, index) => {
        row[columnLabels[index]] = value;
      });
      return row;
    });
  }
}
