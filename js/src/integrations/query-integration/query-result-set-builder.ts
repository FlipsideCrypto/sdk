import {
  QueryRunExecutionError,
  QueryRunRateLimitError,
  QueryRunTimeoutError,
  ServerError,
  UserError,
  UnexpectedSDKError,
} from "../../errors";
import {
  QueryResultJson,
  QueryResultSet,
  Row,
  QueryResultRecord,
  QueryRunStats,
  QueryStatus,
} from "../../types";
import { QueryResultSetBuilderInput } from "../../types/query-result-set-input.type";

export class QueryResultSetBuilder implements QueryResultSet {
  queryId: string | null;
  status: QueryStatus | null;
  columns: string[] | null;
  columnTypes: string[] | null;
  rows: Row[] | null;
  runStats: QueryRunStats | null;
  records: QueryResultRecord[] | null;

  error:
    | QueryRunRateLimitError
    | QueryRunTimeoutError
    | QueryRunExecutionError
    | ServerError
    | UserError
    | UnexpectedSDKError
    | null;

  constructor(data: QueryResultSetBuilderInput) {
    this.error = data.error;
    const queryResultJson = data.queryResultJson;
    if (!queryResultJson) {
      this.queryId = null;
      this.status = null;
      this.columns = null;
      this.columnTypes = null;
      this.rows = null;
      this.runStats = null;
      this.records = null;
      return;
    }

    this.queryId = queryResultJson.queryId;
    this.status = queryResultJson.status;
    this.columns = queryResultJson.columnLabels;
    this.columnTypes = queryResultJson.columnTypes;
    this.rows = queryResultJson.results;
    this.runStats = this.#computeRunStats(queryResultJson);
    this.records = this.#createRecords(queryResultJson);
  }

  #computeRunStats(
    queryResultJson: QueryResultJson | null
  ): QueryRunStats | null {
    if (!queryResultJson) {
      return null;
    }

    let startedAt = new Date(queryResultJson.startedAt);
    let endedAt = new Date(queryResultJson.endedAt);
    let elapsedSeconds = (endedAt.getTime() - startedAt.getTime()) / 1000;
    return {
      startedAt,
      endedAt,
      elapsedSeconds,
      recordCount: queryResultJson.results.length,
    };
  }

  #createRecords(
    queryResultJson: QueryResultJson | null
  ): QueryResultRecord[] | null {
    if (!queryResultJson) {
      return null;
    }

    let columnLabels = queryResultJson.columnLabels;
    if (!columnLabels) {
      return null;
    }

    return queryResultJson.results.map((result) => {
      let record: QueryResultRecord = {};
      result.forEach((value, index) => {
        record[columnLabels[index].toLowerCase()] = value;
      });
      return record;
    });
  }
}
