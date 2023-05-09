import { SqlStatement, RpcRequest, RpcResponse, BaseRpcRequest, BaseRpcResponse } from "./core";

// Request
export interface GetSqlStatementParams {
  sqlStatementId: string;
}

export interface GetSqlStatementRequest extends RpcRequest<GetSqlStatementParams> {
  method: "getSqlStatement";
}

export class GetSqlStatementRequestImplementation
  extends BaseRpcRequest<GetSqlStatementParams>
  implements GetSqlStatementRequest
{
  method: "getSqlStatement" = "getSqlStatement";
}

// Response
export interface GetSqlStatementResult {
  sqlStatement: SqlStatement;
}

export interface GetSqlStatementResponse extends RpcResponse<GetSqlStatementResult> {}

export class GetSqlStatementResponseImplementation
  extends BaseRpcResponse<GetSqlStatementResult>
  implements GetSqlStatementResponse {}
