from typing import Any, List, Optional
from pydantic import BaseModel, Field

from .compass.core.page_stats import PageStats
from .query_run_stats import QueryRunStats


class QueryResultSet(BaseModel):
    query_id: Optional[str] = Field(
        None, description="The server id of the query"
    )
    status: str = Field(
        ..., description="The status of the query (`PENDING`, `FINISHED`, `ERROR`)"
    )
    columns: Optional[List[str]] = Field(
        None, description="The names of the columns in the result set"
    )
    column_types: Optional[List[str]] = Field(
        None, description="The type of the columns in the result set"
    )
    rows: Optional[List[Any]] = Field(
        None, description="The results of the query"
    )
    run_stats: Optional[QueryRunStats] = Field(
        None,
        description="Summary stats on the query run (i.e. the number of rows returned, the elapsed time, etc)",
    )
    records: Optional[List[Any]] = Field(
        None, description="The results of the query transformed as an array of objects"
    )
    page: Optional[PageStats] = Field(
        None, description="Summary of page stats for this query result set"
    )
    error: Any = Field(
        ..., description="The error information if the query fails"
    )
