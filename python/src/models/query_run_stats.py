from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class QueryRunStats(BaseModel):
    started_at: Optional[datetime] = Field(None, description="The start time of the query run.")
    ended_at: Optional[datetime] = Field(None, description="The end time of the query run.")
    query_exec_started_at: Optional[datetime] = Field(
        None, description="The start time of query execution."
    )
    query_exec_ended_at: Optional[datetime] = Field(
        None, description="The end time of query execution."
    )
    streaming_started_at: Optional[datetime] = Field(
        None, description="The start time of streaming query results."
    )
    streaming_ended_at: Optional[datetime] = Field(
        None, description="The end time of streaming query results."
    )
    elapsed_seconds: Optional[int] = Field(
        None,
        description="The number of seconds elapsed between the start and end times.",
    )
    queued_seconds: Optional[int] = Field(
        None,
        description="The number of seconds elapsed between when the query was created and when execution on the data source began.",
    )
    streaming_seconds: Optional[int] = Field(
        None,
        description="The number of seconds elapsed between when the query execution completed and results were fully streamed to Flipside's servers.",
    )
    query_exec_seconds: Optional[int] = Field(
        None,
        description="The number of seconds elapsed between when the query execution started and when it completed on the data source.",
    )
    record_count: Optional[int] = Field(
        None, description="The number of records returned by the query."
    )
    bytes: Optional[int] = Field(None, description="The number of bytes returned by the query.")
