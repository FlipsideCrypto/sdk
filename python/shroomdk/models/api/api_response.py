from typing import Any, Union

from pydantic import BaseModel, Field


class ApiResponse(BaseModel):
    status_code: int = Field(
        None, description="The server-side token of the query being executed."
    )
    status_msg: Union[str, None]
    error_msg: Union[str, None]
    data: Union[Any, None]
