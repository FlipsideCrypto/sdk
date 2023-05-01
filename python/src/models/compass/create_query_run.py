from typing import Any, Dict, List, Union

from pydantic import BaseModel

from .core.query_request import QueryRequest
from .core.query_run import QueryRun
from .core.rpc_request import RpcRequest
from .core.rpc_response import RpcResponse
from .core.sql_statement import SqlStatement
from .core.tags import Tags


# Request
class CreateQueryRunRpcParams(BaseModel):
    resultTTLHours: int
    maxAgeMinutes: int
    sql: str
    tags: Tags
    dataSource: str
    dataProvider: str


class CreateQueryRunRpcRequest(RpcRequest):
    method: str = "createQueryRun"
    params: List[CreateQueryRunRpcParams]


# Response
class CreateQueryRunRpcResult(BaseModel):
    queryRequest: QueryRequest
    queryRun: QueryRun
    sqlStatement: SqlStatement


class CreateQueryRunRpcResponse(RpcResponse):
    result: Union[CreateQueryRunRpcResult, None]
