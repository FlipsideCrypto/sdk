from typing import Dict, List, Optional, Union

from pydantic import BaseModel

from .core.rpc_request import RpcRequest
from .core.rpc_response import RpcResponse
from .core.sql_statement import SqlStatement


# Request
class GetSqlStatementParams(BaseModel):
    sqlStatementId: str


class GetSqlStatementRequest(RpcRequest):
    method: str = "getSqlStatement"
    params: List[GetSqlStatementParams]


# Response
class GetSqlStatemetnResult(BaseModel):
    sqlStatement: SqlStatement


class GetSqlStatementResponse(RpcResponse):
    result: Union[GetSqlStatemetnResult, None]
