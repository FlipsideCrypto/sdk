import { QueryResultJson } from "./api";
import {
  QueryRunExecutionError,
  QueryRunRateLimitError,
  QueryRunTimeoutError,
  ServerError,
  UnexpectedSDKError,
} from "../errors";

export type QueryResult = {
  data: QueryResultJson | null;
  error:
    | QueryRunRateLimitError
    | QueryRunTimeoutError
    | QueryRunExecutionError
    | ServerError
    | UnexpectedSDKError
    | null;
};
