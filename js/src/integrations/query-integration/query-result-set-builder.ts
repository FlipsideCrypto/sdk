import {
  QueryRunExecutionError,
  QueryRunRateLimitError,
  QueryRunTimeoutError,
  ServerError,
  UserError,
  UnexpectedSDKError,
  ApiError,
} from "../../errors";
import {
  QueryResultSet,
  QueryResultRecord,
  QueryRunStats,
  QueryStatus,
  GetQueryRunResultsRpcResult,
  GetQueryRunRpcResult,
  mapApiQueryStateToStatus,
  PageStats,
} from "../../types";

interface QueryResultSetBuilderData {
  getQueryRunResultsRpcResult?: GetQueryRunResultsRpcResult | null;
  getQueryRunRpcResult?: GetQueryRunRpcResult | null;
  error:
    | ApiError
    | QueryRunRateLimitError
    | QueryRunTimeoutError
    | QueryRunExecutionError
    | ServerError
    | UserError
    | UnexpectedSDKError
    | null;
}

export class QueryResultSetBuilder implements QueryResultSet {
  queryId: string | null;
  status: QueryStatus | null;
  columns: string[] | null;
  columnTypes: string[] | null;
  rows: any[] | null;
  runStats: QueryRunStats | null;
  records: QueryResultRecord[] | null;
  page: PageStats | null;

  error:
    | ApiError
    | QueryRunRateLimitError
    | QueryRunTimeoutError
    | QueryRunExecutionError
    | ServerError
    | UserError
    | UnexpectedSDKError
    | null;

  constructor({ getQueryRunResultsRpcResult, getQueryRunRpcResult, error }: QueryResultSetBuilderData) {
    this.error = error;

    if (!getQueryRunResultsRpcResult || !getQueryRunRpcResult) {
      this.queryId = null;
      this.status = null;
      this.columns = null;
      this.columnTypes = null;
      this.rows = null;
      this.runStats = null;
      this.records = null;
      this.page = null;
      return;
    }

    this.queryId = getQueryRunRpcResult.queryRun.id;
    this.status = mapApiQueryStateToStatus(getQueryRunRpcResult.queryRun.state);
    this.columns = getQueryRunResultsRpcResult.columnNames;
    this.columnTypes = getQueryRunResultsRpcResult.columnTypes;
    this.rows = getQueryRunResultsRpcResult.rows;
    this.runStats = this.#computeRunStats(getQueryRunRpcResult);
    this.records = this.#createRecords(getQueryRunResultsRpcResult);
    this.page = getQueryRunResultsRpcResult.page;
  }

  #createRecords(getQueryRunResultsRpcResult: GetQueryRunResultsRpcResult | null): QueryResultRecord[] | null {
    if (!getQueryRunResultsRpcResult || !getQueryRunResultsRpcResult.columnNames || !getQueryRunResultsRpcResult.rows) {
      return null;
    }

    let columnNames = getQueryRunResultsRpcResult.columnNames;

    return getQueryRunResultsRpcResult.rows.map((row) => {
      let record: QueryResultRecord = {};
      row.forEach((value: any, index: number) => {
        record[columnNames[index].toLowerCase()] = value;
      });
      return record;
    });
  }

  #computeRunStats(getQueryRunRpcResult: GetQueryRunRpcResult): QueryRunStats {
    const queryRun = getQueryRunRpcResult.queryRun;

    if (
      !queryRun.startedAt ||
      !queryRun.endedAt ||
      !queryRun.createdAt ||
      !queryRun.queryStreamingEndedAt ||
      !queryRun.queryRunningEndedAt
    ) {
      throw new UnexpectedSDKError(
        "Query run is missing required fields: `startedAt`, `endedAt`, `createdAt`, `queryStreamingEndedAt`, `queryRunningEndedAt`"
      );
    }

    const createdAt = new Date(queryRun.createdAt);
    const startTime = new Date(queryRun.startedAt);
    const endTime = new Date(queryRun.endedAt);
    const streamingEndTime = new Date(queryRun.queryStreamingEndedAt);
    const queryExecEndAt = new Date(queryRun.queryRunningEndedAt);

    return {
      startedAt: startTime,
      endedAt: endTime,
      elapsedSeconds: (endTime.getTime() - startTime.getTime()) / 1000,
      queryExecStartedAt: startTime,
      queryExecEndedAt: queryExecEndAt,
      streamingStartedAt: queryExecEndAt,
      streamingEndedAt: streamingEndTime,
      queuedSeconds: (startTime.getTime() - createdAt.getTime()) / 1000,
      streamingSeconds: (streamingEndTime.getTime() - queryExecEndAt.getTime()) / 1000,
      queryExecSeconds: (queryExecEndAt.getTime() - startTime.getTime()) / 1000,
      bytes: queryRun.totalSize ? queryRun.totalSize : 0,
      recordCount: queryRun.rowCount ? queryRun.rowCount : 0,
    };
  }
}
