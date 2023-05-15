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
} from "../../types";
import { getElapsedLinearSeconds, linearBackOff } from "../../utils/sleep";
import {
  QueryRunExecutionError,
  QueryRunTimeoutError,
  ServerError,
  UserError,
  UnexpectedSDKError,
  getExceptionByErrorCode,
} from "../../errors";
import { QueryResultSetBuilder } from "./query-result-set-builder";
import { Api } from "../../api";
import { DEFAULTS } from "../../defaults";

export class QueryIntegration {
  #api: Api;

  constructor(api: Api) {
    this.#api = api;
  }

  async run(query: Query): Promise<QueryResultSet> {
    let createQueryRunParams: CreateQueryRunRpcParams = {
      resultTTLHours: query.ttlMinutes ? Math.floor(query.ttlMinutes / 60) : DEFAULTS.ttlMinutes,
      sql: query.sql,
      maxAgeMinutes: query.maxAgeMinutes ? query.maxAgeMinutes : DEFAULTS.maxAgeMinutes,
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

    if (!resp.result?.queryRun) {
      throw new UnexpectedSDKError("expected an `rpc_response.result.queryRun` but got null");
    }
    return resp.result.queryRun;
  }

  async #createQuery(params: CreateQueryRunRpcParams, attempts: number = 0): Promise<CreateQueryRunRpcResponse> {
    return await this.#api.createQuery(params);
  }

  async #getQueryRunInLoop({
    queryRunId,
    attempts = 0,
  }: {
    queryRunId: string;
    attempts?: number;
  }): Promise<
    [GetQueryRunRpcResponse | null, QueryRunTimeoutError | QueryRunExecutionError | ServerError | UserError | null]
  > {
    let resp = await this.#api.getQueryRun({ queryRunId });
    if (resp.error) {
    }
    const queryRun = resp.result?.redirectedToQueryRun ? resp.result.redirectedToQueryRun : resp.result?.queryRun;
    if (!queryRun) {
      throw new Error("query run not found");
    }

    const queryRunState = mapApiQueryStateToStatus(queryRun.state);
    if (queryRunState === QueryStatusFinished) {
      return [resp, null];
    }

    if (queryRunState === QueryStatusError) {
      return [null, new QueryRunExecutionError()];
    }

    let shouldContinue = await linearBackOff({
      attempts,
      timeoutMinutes: DEFAULTS.timeoutMinutes,
      intervalSeconds: DEFAULTS.retryIntervalSeconds,
    });

    if (!shouldContinue) {
      const elapsedSeconds = getElapsedLinearSeconds({
        attempts,
        timeoutMinutes: DEFAULTS.timeoutMinutes,
        intervalSeconds: DEFAULTS.retryIntervalSeconds,
      });
      return [null, new QueryRunTimeoutError(elapsedSeconds * 60)];
    }

    return this.#getQueryRunInLoop({ queryRunId, attempts: attempts + 1 });
  }
}
