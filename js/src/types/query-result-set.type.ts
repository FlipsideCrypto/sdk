import { Row } from "./api";
import {
  QueryRunExecutionError,
  QueryRunRateLimitError,
  QueryRunTimeoutError,
  ServerError,
  UserError,
  UnexpectedSDKError,
} from "../errors";
import { QueryRunStats } from "./query-run-stats.type";
import { QueryStatus } from "./query-status.type";
import { QueryResultRecord } from "./query-result-record.type";

export interface QueryResultSet {
  // The server id of the query
  queryId: string | null;

  // The status of the query (`PENDING`, `FINISHED`, `ERROR`)
  status: QueryStatus | null;

  // The names of the columns in the result set
  columns: string[] | null;

  // The type of the columns in the result set
  columnTypes: string[] | null;

  // The results of the query
  rows: Row[] | null;

  // Summary stats on the query run (i.e. the number of rows returned, the elapsed time, etc)
  runStats: QueryRunStats | null;

  // The results of the query transformed as an array of objects
  records: QueryResultRecord[] | null;

  // If the query failed, this will contain the error
  error:
    | QueryRunRateLimitError
    | QueryRunTimeoutError
    | QueryRunExecutionError
    | ServerError
    | UserError
    | UnexpectedSDKError
    | null;
}
