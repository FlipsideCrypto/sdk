from typing import Any, Dict, Optional

from pydantic import BaseModel

from .rpc_error import RpcError


class RpcResponse(BaseModel):
    jsonrpc: str
    id: int
    result: Optional[Dict[str, Any]] | None
    error: Optional[RpcError]
