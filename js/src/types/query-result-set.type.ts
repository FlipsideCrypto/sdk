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
}
