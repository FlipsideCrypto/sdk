from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class RpcRequest(BaseModel):
    jsonrpc: str = "2.0"
    method: str
    params: List[Dict[str, Any]]
    id: int = 1
