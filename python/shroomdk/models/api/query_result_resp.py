from typing import Optional, List, Any, Union
from pydantic import BaseModel, Field

from .api_response import ApiResponse


class QueryResultJson(BaseModel):
    queryId: Optional[str] = Field(None, description="The id of the query.")
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


class QueryResultResp(ApiResponse):
  data: Union[QueryResultJson, None] = Field(False, description="The data payload result after attempting to retrieve the query results.")
