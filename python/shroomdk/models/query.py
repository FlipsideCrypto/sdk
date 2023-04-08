from typing import Optional, Union

from pydantic import BaseModel, Field


class Query(BaseModel):
    sql: str = Field(None, description="SQL query to execute")
    ttl_minutes: Optional[int] = Field(
        None, description="The number of minutes to cache the query results"
    )
    max_age_minutes: Optional[int] = Field(
        5, description="The max age of the query results in minutes"
    )
    timeout_minutes: Optional[int] = Field(
        None, description="The number of minutes to timeout the query"
    )
    retry_interval_seconds: Optional[Union[int, float]] = Field(
        1, description="The number of seconds to use between retries"
    )
    cached: Optional[bool] = Field(
        None,
        description="An override on the cache. A value of true will Re-Execute the query.",
    )
    page_size: int = Field(None, description="The number of results to return per page")
    page_number: int = Field(None, description="The page number to return")
    sdk_package: Optional[str] = Field(
        None, description="The SDK package used for the query"
    )
    sdk_version: Optional[str] = Field(
        None, description="The SDK version used for the query"
    )
    data_source: Optional[str] = Field(
        None, description="The data source to execute the query against"
    )
    data_provider: Optional[str] = Field(
        None, description="The owner of the data source"
    )
