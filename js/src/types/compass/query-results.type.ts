import {
  Page,
  PageStats,
  QueryRun,
  ResultFormat,
  RpcRequest,
  RpcResponse,
  BaseRpcRequest,
  BaseRpcResponse,
} from "./core";

// Request
export interface QueryResultsRpcParams {
  query: string;
  format: ResultFormat;
  page: Page;
}

export interface QueryResultsRpcRequest extends RpcRequest<QueryResultsRpcParams> {
  method: "queryResults";
}

export class QueryResultsRpcRequestImplementation
  extends BaseRpcRequest<QueryResultsRpcParams>
  implements QueryResultsRpcRequest
{
  method: "queryResults" = "queryResults";
}

// Response
export interface QueryResultsRpcResult {
  columnNames: string[];
  columnTypes: string[];
  rows: Record<string, unknown>[];
  page: PageStats;
  sql: string;
  format: ResultFormat;
  originalQueryRun: QueryRun;
  redirectedToQueryRun: QueryRun;
}

export interface QueryResultsRpcResponse extends RpcResponse<QueryResultsRpcResult> {}

export class QueryResultsRpcResponseImplementation
  extends BaseRpcResponse<QueryResultsRpcResult>
  implements QueryResultsRpcResponse {}
