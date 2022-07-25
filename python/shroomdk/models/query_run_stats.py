from datetime import datetime

from pydantic import BaseModel, Field


class QueryRunStats(BaseModel):
    started_at: datetime = Field(None, description="The start time of the query run.")
    ended_at: datetime = Field(None, description="The end time of the query run.")
    elapsed_seconds: int = Field(
        None,
        description="The number of seconds elapsed between the start and end times.",
    )
    record_count: int = Field(None, description="The number of records returned by the query.")
