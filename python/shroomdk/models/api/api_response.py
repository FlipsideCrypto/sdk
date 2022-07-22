from typing import Any, Union

from pydantic import BaseModel


class ApiResponse(BaseModel):
    status_code: int
    status_msg: Union[str, None]
    error_msg: Union[str, None]
    data: Union[Any, None]
