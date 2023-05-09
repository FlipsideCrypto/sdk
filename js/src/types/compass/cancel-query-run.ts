import { QueryRun, RpcRequest, BaseRpcRequest, RpcResponse, BaseRpcResponse } from "./core";

// Request
export interface CancelQueryRunRpcRequestParams {
  queryRunId: string;
}

export interface CancelQueryRunRpcRequest extends RpcRequest<CancelQueryRunRpcRequestParams> {
  method: "cancelQueryRun";
}

export class CancelQueryRunRpcRequestImplementation
  extends BaseRpcRequest<CancelQueryRunRpcRequestParams>
  implements CancelQueryRunRpcRequest
{
  method: "cancelQueryRun" = "cancelQueryRun";
}

// Response
export interface CancelQueryRunRpcResult {
  queryRun: QueryRun;
}

export interface CancelQueryRunRpcResponse extends RpcResponse<CancelQueryRunRpcResult> {}

export class CancelQueryRunRpcResponseImplementation
  extends BaseRpcResponse<CancelQueryRunRpcResult>
  implements CancelQueryRunRpcResponse {}
