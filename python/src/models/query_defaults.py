from typing import Optional
from pydantic import BaseModel, Field


class QueryDefaults(BaseModel):
    ttl_minutes: Optional[int] = Field(
        None, description="The number of minutes to cache the query results"
    )
    max_age_minutes: Optional[int] = Field(
        None,
        description="The max age of query results to accept before deciding to run a query again",
    )
    cached: bool = Field(False, description="Whether or not to cache the query results")
    timeout_minutes: Optional[int] = Field(
        None, description="The number of minutes to timeout the query"
    )
    retry_interval_seconds: Optional[float] = Field(
        None, description="The number of seconds to wait before retrying the query"
    )
    page_size: Optional[int] = Field(None, description="The number of results to return per page")
    page_number: Optional[int] = Field(None, description="The page number to return")
