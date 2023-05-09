import { QueryRun, RpcRequest, RpcResponse, BaseRpcRequest, BaseRpcResponse } from "./core";

// Request
export interface GetQueryRunRpcRequestParams {
  queryRunId: string;
}

export interface GetQueryRunRpcRequest extends RpcRequest<GetQueryRunRpcRequestParams> {
  method: "getQueryRun";
}

export class GetQueryRunRpcRequestImplementation
  extends BaseRpcRequest<GetQueryRunRpcRequestParams>
  implements GetQueryRunRpcRequest
{
  method: "getQueryRun" = "getQueryRun";
}

// Response
export interface GetQueryRunRpcResult {
  queryRun: QueryRun;
  redirectedToQueryRun?: QueryRun | null;
}

export interface GetQueryRunRpcResponse extends RpcResponse<GetQueryRunRpcResult> {}

export class GetQueryRunRpcResponseImplementation
  extends BaseRpcResponse<GetQueryRunRpcResult>
  implements GetQueryRunRpcResponse {}
