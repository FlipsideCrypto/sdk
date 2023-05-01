from typing import Dict, List

from pydantic import BaseModel

from .core.page import Page
from .core.page_stats import PageStats
from .core.query_run import QueryRun
from .core.result_format import ResultFormat
from .core.rpc_request import RpcRequest
from .core.rpc_response import RpcResponse


# Request
class QueryResultsRpcParams(BaseModel):
    query: str
    format: ResultFormat
    page: Page


class QueryResultsRpcRequest(RpcRequest):
    method: str = "queryResults"
    params: List[QueryResultsRpcParams]


# Response
class QueryResultsRpcResult(BaseModel):
    columnNames: List[str]
    columnTypes: List[str]
    rows: List[Dict]
    page: PageStats
    sql: str
    format: ResultFormat
    originalQueryRun: QueryRun
    redirectedToQueryRun: QueryRun


class QueryResultsRpcResponse(RpcResponse):
    result: QueryResultsRpcResult
