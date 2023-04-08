from typing import Any, Dict, Optional, Union

from pydantic import BaseModel

from .rpc_error import RpcError


class RpcResponse(BaseModel):
    jsonrpc: str
    id: int
    result: Union[Optional[Dict[str, Any]], None]
    error: Optional[RpcError]
