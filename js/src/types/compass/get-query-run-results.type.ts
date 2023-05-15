import {
  Page,
  PageStats,
  QueryRun,
  ResultFormat,
  RpcResponse,
  RpcRequest,
  BaseRpcRequest,
  BaseRpcResponse,
} from "./core";

// Request
export interface Filter {
  column: string;
  eq?: string | number | null;
  neq?: string | number | null;
  gt?: number | null;
  gte?: number | null;
  lt?: number | null;
  lte?: number | null;
  like?: string | number | null;
  in?: any[] | null;
  notIn?: any[] | null;
}

export interface SortBy {
  column: string;
  direction: "desc" | "asc";
}

export interface GetQueryRunResultsRpcParams {
  queryRunId: string;
  format: ResultFormat;
  filters?: Filter[] | null;
  sortBy?: SortBy[] | null;
  page: Page;
}

export interface GetQueryRunResultsRpcRequest extends RpcRequest<GetQueryRunResultsRpcParams> {
  method: "getQueryRunResults";
}

export class GetQueryRunResultsRpcRequestImplementation
  extends BaseRpcRequest<GetQueryRunResultsRpcParams>
  implements GetQueryRunResultsRpcRequest
{
  method: "getQueryRunResults" = "getQueryRunResults";
}

// Response
export interface GetQueryRunResultsRpcResult {
  columnNames: string[] | null;
  columnTypes: string[] | null;
  rows: any[] | null;
  page: PageStats | null;
  sql: string | null;
  format: ResultFormat | null;
  originalQueryRun: QueryRun;
  redirectedToQueryRun: QueryRun | null;
}

export interface GetQueryRunResultsRpcResponse extends RpcResponse<GetQueryRunResultsRpcResult> {}

export class GetQueryRunResultsRpcResponseImplementation
  extends BaseRpcResponse<GetQueryRunResultsRpcResult>
  implements GetQueryRunResultsRpcResponse {}
