from typing import List, Union

from pydantic import BaseModel

from .core.query_run import QueryRun
from .core.rpc_request import RpcRequest
from .core.rpc_response import RpcResponse


# Request
class CancelQueryRunRpcRequestParams(BaseModel):
    queryRunId: str


class CancelQueryRunRpcRequest(RpcRequest):
    method: str = "cancelQueryRun"
    params: List[CancelQueryRunRpcRequestParams]


# Response
class CancelQueryRunRpcResult(BaseModel):
    queryRun: QueryRun


class CancelQueryRunRpcResponse(RpcResponse):
    result: Union[CancelQueryRunRpcResult, None]
