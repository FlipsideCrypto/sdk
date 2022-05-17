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
import { QueryResult } from "../types/query-result.type";

const GET_RESULTS_INTERVAL_SECONDS = 2;
const DEFAULTS: QueryRunDefaults = {
  ttlMinutes: 60,
  cached: true,
  timeoutMinutes: 20,
};

export class Query {
  private declare _api: API;

  constructor(api: API) {
    this._api = api;
  }

  private _setQueryRunDefaults(queryRun: QueryRun): QueryRun {
    return { ...DEFAULTS, ...queryRun };
  }

  public async run(queryRun: QueryRun): Promise<QueryResult> {
    queryRun = this._setQueryRunDefaults(queryRun);

    const [createQueryJson, createQueryErr] = await this._createQuery(queryRun);
    if (createQueryErr) {
      return { data: null, error: createQueryErr };
    }

    if (!createQueryJson) {
      return {
        data: null,
        error: new UnexpectedSDKError(
          "expected a `createQueryJson` but got null"
        ),
      };
    }

    const [getQueryResultJson, getQueryErr] = await this._getQueryResult(
      createQueryJson.token
    );

    if (getQueryErr) {
      return { data: null, error: getQueryErr };
    }

    if (!getQueryResultJson) {
      return {
        data: null,
        error: new UnexpectedSDKError(
          "expected a `getQueryResultJson` but got null"
        ),
      };
    }

    return { data: getQueryResultJson, error: null };
  }

  private async _createQuery(
    queryRun: QueryRun,
    attempts: number = 0
  ): Promise<
    [CreateQueryJson | null, QueryRunRateLimitError | ServerError | null]
  > {
    const resp = await this._api.createQuery(queryRun);
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

    return this._createQuery(queryRun, attempts + 1);
  }

  private async _getQueryResult(
    queryID: string,
    attempts: number = 0
  ): Promise<
    [QueryResultJson | null, QueryRunTimeoutError | ServerError | null]
  > {
    const resp = await this._api.getQueryResult(queryID);
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

    return this._getQueryResult(queryID, attempts + 1);
  }
}
