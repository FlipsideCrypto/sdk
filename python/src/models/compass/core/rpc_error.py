from typing import Any, Optional

from pydantic import BaseModel


class RpcError(BaseModel):
    code: int
    message: str
    data: Optional[Any]
