from typing import Any, List, Union

from pydantic import BaseModel, Field

from .query_run_stats import QueryRunStats


class QueryResultSet(BaseModel):
    query_id: Union[str, None] = Field(None, description="The server id of the query")

    status: str = Field(
        False, description="The status of the query (`PENDING`, `FINISHED`, `ERROR`)"
    )
    columns: Union[List[str], None] = Field(
        None, description="The names of the columns in the result set"
    )
    column_types: Union[List[str], None] = Field(
        None, description="The type of the columns in the result set"
    )
    rows: Union[List[Any], None] = Field(None, description="The results of the query")
    run_stats: Union[QueryRunStats, None] = Field(
        None,
        description="Summary stats on the query run (i.e. the number of rows returned, the elapsed time, etc)",
    )
    records: Union[List[Any], None] = Field(
        None, description="The results of the query transformed as an array of objects"
    )
    error: Any
