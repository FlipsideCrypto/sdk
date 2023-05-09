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
  eq?: string | null;
  neq?: string | null;
  gt?: string | null;
  gte?: string | null;
  lt?: string | null;
  lte?: string | null;
  like?: string | null;
  in_?: string[] | null;
  notIn?: string[] | null;
}

export interface SortBy {
  column: string;
  direction: string;
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
