from typing import Any, Dict, List, Optional

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


class SortBy(BaseModel):
    column: str
    direction: str


class GetQueryRunResultsRpcParams(BaseModel):
    queryRunId: str
    format: ResultFormat
    filters: Optional[List[Filter | None]] = []
    sortBy: Optional[List[SortBy] | None] = []
    page: Page


class GetQueryRunResultsRpcRequest(RpcRequest):
    method: str = "getQueryRunResults"
    params: List[GetQueryRunResultsRpcParams]


# Response
class GetQueryRunResultsRpcResult(BaseModel):
    columnNames: Optional[List[str]]
    columnTypes: Optional[List[str]]
    rows: List[Any]
    page: PageStats
    sql: str
    format: ResultFormat
    originalQueryRun: QueryRun
    redirectedToQueryRun: QueryRun | None


class GetQueryRunResultsRpcResponse(RpcResponse):
    result: GetQueryRunResultsRpcResult | None
