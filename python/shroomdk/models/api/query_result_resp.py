from typing import Any, List, Optional, Union

from pydantic import BaseModel

from .api_response import ApiResponse


class QueryResultJson(BaseModel):
    queryId: Optional[str]
    status: str
    results: Optional[List[Any]]
    startedAt: Optional[str]
    endedAt: Optional[str]
    columnLabels: Optional[List[str]]
    columnTypes: Optional[List[str]]
    message: Optional[str]
    errors: Optional[str]
    pageNumber: Optional[int]
    pageSize: Optional[int]
    recordCount: Optional[int]


class QueryResultResp(ApiResponse):
    data: Union[QueryResultJson, None]
