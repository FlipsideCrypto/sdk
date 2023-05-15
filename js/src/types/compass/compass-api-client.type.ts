import { CreateQueryRunRpcParams, CreateQueryRunRpcResponse } from "./create-query-run.type";
import { GetQueryRunRpcRequestParams, GetQueryRunRpcResponse } from "./get-query-run.type";
import { GetQueryRunResultsRpcParams, GetQueryRunResultsRpcResponse } from "./get-query-run-results.type";
import { GetSqlStatementParams, GetSqlStatementResponse } from "./get-sql-statement.type";
import { CancelQueryRunRpcRequestParams, CancelQueryRunRpcResponse } from "./cancel-query-run.type";

export interface CompassApiClient {
  url: string;
  getUrl(): string;
  createQuery(params: CreateQueryRunRpcParams): Promise<CreateQueryRunRpcResponse>;
  getQueryRun(params: GetQueryRunRpcRequestParams): Promise<GetQueryRunRpcResponse>;
  getQueryResult(params: GetQueryRunResultsRpcParams): Promise<GetQueryRunResultsRpcResponse>;
  getSqlStatement(params: GetSqlStatementParams): Promise<GetSqlStatementResponse>;
  cancelQueryRun(params: CancelQueryRunRpcRequestParams): Promise<CancelQueryRunRpcResponse>;
}
