import {
  QueryRequest,
  QueryRun,
  RpcRequest,
  RpcResponse,
  SqlStatement,
  Tags,
  BaseRpcRequest,
  BaseRpcResponse,
} from "./core";

// Request

// CreateQueryRunRpcRequest.ts
export interface CreateQueryRunRpcParams {
  resultTTLHours: number;
  maxAgeMinutes: number;
  sql: string;
  tags: Tags;
  dataSource: string;
  dataProvider: string;
}

export interface CreateQueryRunRpcRequest extends RpcRequest<CreateQueryRunRpcParams> {
  method: "createQueryRun";
}

export class CreateQueryRunRpcRequestImplementation
  extends BaseRpcRequest<CreateQueryRunRpcParams>
  implements CreateQueryRunRpcRequest
{
  method: "createQueryRun" = "createQueryRun";
}

// Response
export interface CreateQueryRunRpcResult {
  queryRequest: QueryRequest;
  queryRun: QueryRun;
  sqlStatement: SqlStatement;
}

export interface CreateQueryRunRpcResponse extends RpcResponse<CreateQueryRunRpcResult> {}

export class CreateQueryRunRpcResponseImplementation
  extends BaseRpcResponse<CreateQueryRunRpcResult>
  implements CreateQueryRunRpcResponse {}
