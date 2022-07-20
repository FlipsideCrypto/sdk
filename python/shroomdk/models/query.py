from typing import Optional
from pydantic import BaseModel, Field


class Query(BaseModel):
    sql: str = Field(None, description="SQL query to execute")
    ttl_minutes: Optional[int] = Field(False, description="The number of minutes to cache the query results")
    timeout_minutes: Optional[int] = Field(None, description="The number of minutes to timeout the query")
    cached: Optional[bool] = Field(False, description="An override on the cahce. A value of true will reexecute the query.")
    page_size: int = Field(None, description="The number of results to return per page")
    page_number: int = Field(None, description="The page number to return")
