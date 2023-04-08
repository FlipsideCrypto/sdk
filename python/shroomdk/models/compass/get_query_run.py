from typing import Dict, List, Optional, Union

from pydantic import BaseModel

from .core.query_run import QueryRun
from .core.rpc_request import RpcRequest
from .core.rpc_response import RpcResponse
from .core.tags import Tags


# Request
class GetQueryRunRpcRequestParams(BaseModel):
    queryRunId: str


class GetQueryRunRpcRequest(RpcRequest):
    method: str = "getQueryRun"
    params: List[GetQueryRunRpcRequestParams]


# Response
class GetQueryRunRpcResult(BaseModel):
    queryRun: QueryRun
    redirectedToQueryRun: Optional[QueryRun]


class GetQueryRunRpcResponse(RpcResponse):
    result: Union[GetQueryRunRpcResult, None]
