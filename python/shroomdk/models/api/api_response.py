from typing import Any
from pydantic import BaseModel, Field


class ApiResponse(BaseModel):
  status_code: int = Field(None, description="The server-side token of the query being executed.")
  status_msg: str | None
  error_msg: str | None
  data: Any | None
