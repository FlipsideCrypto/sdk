from typing import Optional, Union

from pydantic import BaseModel, Field

from .api_response import ApiResponse


class CreateQueryJson(BaseModel):
    token: str = Field(
        None, description="The server-side token of the query being executed."
    )
    errors: Union[Optional[str], None] = Field(
        False, description="Error that occured when creating the query."
    )
    cached: Optional[bool] = Field(
        False, description="Whether the query is cached or not."
    )


class CreateQueryResp(ApiResponse):
    data: Union[CreateQueryJson, None] = Field(
        False, description="The data payload result after attempting to create a query."
    )
