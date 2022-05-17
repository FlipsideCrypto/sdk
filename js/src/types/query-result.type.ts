import { QueryResultJson } from "./api";
import {
  QueryRunExecutionError,
  QueryRunRateLimitError,
  QueryRunTimeoutError,
  ServerError,
  UnexpectedSDKError,
} from "../errors";

export interface QueryResultInterface {
  data: QueryResultJson | null;
  error:
    | QueryRunRateLimitError
    | QueryRunTimeoutError
    | QueryRunExecutionError
    | ServerError
    | UnexpectedSDKError
    | null;

  all(): Record<string, string | number | null | boolean>[] | null;
}
