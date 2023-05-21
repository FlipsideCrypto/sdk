import {
  Query,
  QueryStatusFinished,
  QueryStatusError,
  QueryResultSet,
  CreateQueryRunRpcParams,
  CreateQueryRunRpcResponse,
  mapApiQueryStateToStatus,
  GetQueryRunRpcResponse,
  Filter,
  SortBy,
  QueryRun,
  ResultFormat,
  SqlStatement,
  CompassApiClient,
} from "../../types";
import { getElapsedLinearSeconds, linearBackOff } from "../../utils/sleep";
import {
  QueryRunExecutionError,
  QueryRunTimeoutError,
  ServerError,
  UserError,
  UnexpectedSDKError,
  getExceptionByErrorCode,
  ApiError,
} from "../../errors";
import { QueryResultSetBuilder } from "./query-result-set-builder";
import { DEFAULTS } from "../../defaults";

export class QueryIntegration {
  #api: CompassApiClient;

  constructor(api: CompassApiClient) {
    this.#api = api;
  }

  #getTimeoutMinutes(query: Query): number {
    return query.timeoutMinutes ? query.timeoutMinutes : DEFAULTS.timeoutMinutes;
  }

  #getRetryIntervalSeconds(query: Query): number {
    return query.retryIntervalSeconds ? Number(query.retryIntervalSeconds) : DEFAULTS.retryIntervalSeconds;
  }

  async run(query: Query): Promise<QueryResultSet> {
    let createQueryRunParams: CreateQueryRunRpcParams = {
      resultTTLHours: this.#getTTLHours(query),
      sql: query.sql,
      maxAgeMinutes: this.#getMaxAgeMinutes(query),
      tags: {
        sdk_language: "javascript",
        sdk_package: query.sdkPackage ? query.sdkPackage : DEFAULTS.sdkPackage,
        sdk_version: query.sdkVersion ? query.sdkVersion : DEFAULTS.sdkVersion,
      },
      dataSource: query.dataSource ? query.dataSource : DEFAULTS.dataSource,
      dataProvider: query.dataProvider ? query.dataProvider : DEFAULTS.dataProvider,
    };

    const createQueryRunRpcResponse = await this.#createQuery(createQueryRunParams);
    if (createQueryRunRpcResponse.error) {
      return new QueryResultSetBuilder({
        error: getExceptionByErrorCode(createQueryRunRpcResponse.error.code, createQueryRunRpcResponse.error.message),
      });
    }

    if (!createQueryRunRpcResponse.result?.queryRun) {
      return new QueryResultSetBuilder({
        error: new UnexpectedSDKError("expected a `createQueryRunRpcResponse.result.queryRun` but got null"),
      });
    }

    // loop to get query state
    const [queryRunRpcResp, queryError] = await this.#getQueryRunInLoop({
      queryRunId: createQueryRunRpcResponse.result?.queryRun.id,
      timeoutMinutes: this.#getTimeoutMinutes(query),
      retryIntervalSeconds: this.#getRetryIntervalSeconds(query),
    });

    if (queryError) {
      return new QueryResultSetBuilder({
        error: queryError,
      });
    }

    if (queryRunRpcResp && queryRunRpcResp.error) {
      return new QueryResultSetBuilder({
        error: getExceptionByErrorCode(queryRunRpcResp.error.code, queryRunRpcResp.error.message),
      });
    }

    const queryRun = queryRunRpcResp?.result?.queryRun;
    if (!queryRun) {
      return new QueryResultSetBuilder({
        error: new UnexpectedSDKError("expected a `queryRunRpcResp.result.queryRun` but got null"),
      });
    }

    // get the query results
    const queryResultResp = await this.#api.getQueryResult({
      queryRunId: queryRun.id,
      format: ResultFormat.csv,
      page: {
        number: query.pageNumber || 1,
        size: query.pageSize || 100000,
      },
    });

    if (queryResultResp && queryResultResp.error) {
      return new QueryResultSetBuilder({
        error: getExceptionByErrorCode(queryResultResp.error.code, queryResultResp.error.message),
      });
    }

    const queryResults = queryResultResp.result;
    if (!queryResults) {
      return new QueryResultSetBuilder({
        error: new UnexpectedSDKError("expected a `queryResultResp.result` but got null"),
      });
    }

    return new QueryResultSetBuilder({
      getQueryRunResultsRpcResult: queryResults,
      getQueryRunRpcResult: queryRunRpcResp.result,
      error: null,
    });
  }

  async getQueryResults({
    queryRunId,
    pageNumber = DEFAULTS.pageNumber,
    pageSize = DEFAULTS.pageSize,
    filters,
    sortBy,
  }: {
    queryRunId: string;
    pageNumber?: number;
    pageSize?: number;
    filters?: Filter[];
    sortBy?: SortBy[];
  }): Promise<QueryResultSet> {
    const queryRunResp = await this.#api.getQueryRun({ queryRunId });
    if (queryRunResp.error) {
      return new QueryResultSetBuilder({
        error: getExceptionByErrorCode(queryRunResp.error.code, queryRunResp.error.message),
      });
    }

    if (!queryRunResp.result) {
      return new QueryResultSetBuilder({
        error: new UnexpectedSDKError("expected an `rpc_response.result` but got null"),
      });
    }

    if (!queryRunResp.result?.queryRun) {
      return new QueryResultSetBuilder({
        error: new UnexpectedSDKError("expected an `rpc_response.result.queryRun` but got null"),
      });
    }

    const queryRun = queryRunResp.result.redirectedToQueryRun
      ? queryRunResp.result.redirectedToQueryRun
      : queryRunResp.result.queryRun;

    const queryResultResp = await this.#api.getQueryResult({
      queryRunId: queryRun.id,
      format: ResultFormat.csv,
      page: {
        number: pageNumber,
        size: pageSize,
      },
      filters,
      sortBy,
    });

    if (queryResultResp.error) {
      return new QueryResultSetBuilder({
        error: getExceptionByErrorCode(queryResultResp.error.code, queryResultResp.error.message),
      });
    }

    return new QueryResultSetBuilder({
      getQueryRunResultsRpcResult: queryResultResp.result,
      getQueryRunRpcResult: queryRunResp.result,
      error: null,
    });
  }

  async createQueryRun(query: Query): Promise<QueryRun> {
    let createQueryRunParams: CreateQueryRunRpcParams = {
      resultTTLHours: this.#getTTLHours(query),
      sql: query.sql,
      maxAgeMinutes: this.#getMaxAgeMinutes(query),
      tags: {
        sdk_language: "javascript",
        sdk_package: query.sdkPackage ? query.sdkPackage : DEFAULTS.sdkPackage,
        sdk_version: query.sdkVersion ? query.sdkVersion : DEFAULTS.sdkVersion,
      },
      dataSource: query.dataSource ? query.dataSource : DEFAULTS.dataSource,
      dataProvider: query.dataProvider ? query.dataProvider : DEFAULTS.dataProvider,
    };

    const createQueryRunRpcResponse = await this.#createQuery(createQueryRunParams);
    if (createQueryRunRpcResponse.error) {
      throw getExceptionByErrorCode(createQueryRunRpcResponse.error.code, createQueryRunRpcResponse.error.message);
    }

    if (!createQueryRunRpcResponse.result?.queryRun) {
      throw new UnexpectedSDKError("expected a `createQueryRunRpcResponse.result.queryRun` but got null");
    }

    return createQueryRunRpcResponse.result.queryRun;
  }

  async getQueryRun({ queryRunId }: { queryRunId: string }): Promise<QueryRun> {
    const resp = await this.#api.getQueryRun({ queryRunId });
    if (resp.error) {
      throw getExceptionByErrorCode(resp.error.code, resp.error.message);
    }
    if (!resp.result) {
      throw new UnexpectedSDKError("expected an `rpc_response.result` but got null");
    }

    if (!resp.result?.queryRun) {
      throw new UnexpectedSDKError("expected an `rpc_response.result.queryRun` but got null");
    }

    return resp.result.redirectedToQueryRun ? resp.result.redirectedToQueryRun : resp.result.queryRun;
  }

  async getSqlStatement({ sqlStatementId }: { sqlStatementId: string }): Promise<SqlStatement> {
    const resp = await this.#api.getSqlStatement({ sqlStatementId });
    if (resp.error) {
      throw getExceptionByErrorCode(resp.error.code, resp.error.message);
    }
    if (!resp.result) {
      throw new UnexpectedSDKError("expected an `rpc_response.result` but got null");
    }

    if (!resp.result?.sqlStatement) {
      throw new UnexpectedSDKError("expected an `rpc_response.result.sqlStatement` but got null");
    }
    return resp.result.sqlStatement;
  }

  async cancelQueryRun({ queryRunId }: { queryRunId: string }): Promise<QueryRun> {
    const resp = await this.#api.cancelQueryRun({ queryRunId });
    if (resp.error) {
      throw getExceptionByErrorCode(resp.error.code, resp.error.message);
    }
    if (!resp.result) {
      throw new UnexpectedSDKError("expected an `rpc_response.result` but got null");
    }

    if (!resp.result?.canceledQueryRun) {
      throw new UnexpectedSDKError("expected an `rpc_response.result.canceledQueryRun` but got null");
    }
    return resp.result.canceledQueryRun;
  }

  #getMaxAgeMinutes(query: Query): number {
    if (query.cached === false) {
      return 0;
    }
    return query.maxAgeMinutes ? query.maxAgeMinutes : DEFAULTS.maxAgeMinutes;
  }

  #getTTLHours(query: Query): number {
    const maxAgeMinutes = this.#getMaxAgeMinutes(query);
    const ttlMinutes = maxAgeMinutes > 60 ? maxAgeMinutes : DEFAULTS.ttlMinutes;
    return Math.floor(ttlMinutes / 60);
  }

  async #createQuery(params: CreateQueryRunRpcParams, attempts: number = 0): Promise<CreateQueryRunRpcResponse> {
    return await this.#api.createQuery(params);
  }

  async #getQueryRunInLoop({
    queryRunId,
    timeoutMinutes,
    retryIntervalSeconds,
    attempts = 0,
  }: {
    queryRunId: string;
    timeoutMinutes: number;
    retryIntervalSeconds: number;
    attempts?: number;
  }): Promise<
    [
      GetQueryRunRpcResponse | null,
      QueryRunTimeoutError | QueryRunExecutionError | ServerError | UserError | ApiError | null
    ]
  > {
    let resp = await this.#api.getQueryRun({ queryRunId });
    if (resp.error) {
      return [null, getExceptionByErrorCode(resp.error.code, resp.error.message)];
    }

    const queryRun = resp.result?.redirectedToQueryRun ? resp.result.redirectedToQueryRun : resp.result?.queryRun;
    if (!queryRun) {
      return [null, new UnexpectedSDKError("expected an `rpc_response.result.queryRun` but got null")];
    }

    const queryRunState = mapApiQueryStateToStatus(queryRun.state);
    if (queryRunState === QueryStatusFinished) {
      return [resp, null];
    }

    if (queryRunState === QueryStatusError) {
      return [
        null,
        new QueryRunExecutionError({
          name: queryRun.errorName,
          message: queryRun.errorMessage,
          data: queryRun.errorData,
        }),
      ];
    }

    let shouldContinue = await linearBackOff({
      attempts,
      timeoutMinutes,
      intervalSeconds: retryIntervalSeconds,
    });

    if (!shouldContinue) {
      const elapsedSeconds = getElapsedLinearSeconds({
        attempts,
        timeoutMinutes,
        intervalSeconds: retryIntervalSeconds,
      });
      return [null, new QueryRunTimeoutError(elapsedSeconds * 60)];
    }

    return this.#getQueryRunInLoop({ queryRunId, attempts: attempts + 1, timeoutMinutes, retryIntervalSeconds });
  }
}
