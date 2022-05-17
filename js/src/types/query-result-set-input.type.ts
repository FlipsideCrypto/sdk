import {
  QueryRunExecutionError,
  QueryRunRateLimitError,
  QueryRunTimeoutError,
  ServerError,
  UnexpectedSDKError,
} from "../errors";
import { QueryResultJson } from "./api/query-result-resp.type";

export type QueryResultSetInput = {
  queryResultJson: QueryResultJson | null;
  error:
    | QueryRunExecutionError
    | QueryRunRateLimitError
    | QueryRunTimeoutError
    | ServerError
    | UnexpectedSDKError
    | null;
};
