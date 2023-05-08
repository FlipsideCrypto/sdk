from typing import Any, Dict, List, Optional, Union

from pydantic import BaseModel

from .core.page import Page
from .core.page_stats import PageStats
from .core.query_run import QueryRun
from .core.result_format import ResultFormat
from .core.rpc_request import RpcRequest
from .core.rpc_response import RpcResponse


# Request
class Filter(BaseModel):
    column: str
    eq: Optional[str] = None
    neq: Optional[str] = None
    gt: Optional[str] = None
    gte: Optional[str] = None
    lt: Optional[str] = None
    lte: Optional[str] = None
    like: Optional[str] = None
    in_: Optional[List[str]] = None
    notIn: Optional[List[str]] = None

    class Config:
        fields = {"in_": "in"}

    def dict(self, *args, **kwargs) -> dict:
        kwargs.setdefault("exclude_none", True)  # Exclude keys with None values
        return super().dict(*args, **kwargs)


class SortBy(BaseModel):
    column: str
    direction: str


class GetQueryRunResultsRpcParams(BaseModel):
    queryRunId: str
    format: ResultFormat
    filters: Optional[Union[List[Filter], None]] = []
    sortBy: Optional[Union[List[SortBy], None]] = []
    page: Page

    def dict(self, *args, **kwargs) -> dict:
        kwargs.setdefault("exclude_none", True)  # Exclude keys with None values
        return super().dict(*args, **kwargs)


class GetQueryRunResultsRpcRequest(RpcRequest):
    method: str = "getQueryRunResults"
    params: List[GetQueryRunResultsRpcParams]

    def dict(self, *args, **kwargs) -> dict:
        kwargs.setdefault("exclude_none", True)  # Exclude keys with None values
        return super().dict(*args, **kwargs)


# Response
class GetQueryRunResultsRpcResult(BaseModel):
    columnNames: Union[Optional[List[str]], None]
    columnTypes: Union[Optional[List[str]], None]
    rows: Union[List[Any], None]
    page: Union[PageStats, None]
    sql: Union[str, None]
    format: Union[ResultFormat, None]
    originalQueryRun: QueryRun
    redirectedToQueryRun: Union[QueryRun, None]


class GetQueryRunResultsRpcResponse(RpcResponse):
    result: Union[GetQueryRunResultsRpcResult, None]
