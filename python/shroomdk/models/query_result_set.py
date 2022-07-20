from typing import Optional, List, Any
from pydantic import BaseModel, Field, UUID4, PrivateAttr

from .query_run_stats import QueryRunStats


class QueryResultSet(BaseModel):
    query_id: str | None = Field(None, description="The server id of the query")
    status: str = Field(False, description="The status of the query (`PENDING`, `FINISHED`, `ERROR`)")
    columns: List[str] | None = Field(None, description="The names of the columns in the result set")
    column_types: List[str] | None = Field(None, description="The type of the columns in the result set")
    rows: List[Any] | None = Field(None, description="The results of the query")
    run_stats: QueryRunStats | None = Field(None, description="Summary stats on the query run (i.e. the number of rows returned, the elapsed time, etc)")
    records: List[Any] | None = Field(None, description="The results of the query transformed as an array of objects")
    error: Any
