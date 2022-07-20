from typing import Optional, List
from pydantic import BaseModel, Field, UUID4, PrivateAttr

from .api_response import ApiResponse


class CreateQueryJson(BaseModel):
    token: str = Field(None, description="The server-side token of the query being executed.")
    errors: Optional[str] | None = Field(False, description="Error that occured when creating the query.")


class CreateQueryResp(ApiResponse):
  data: CreateQueryJson | None = Field(False, description="The data payload result after attempting to create a query.")
