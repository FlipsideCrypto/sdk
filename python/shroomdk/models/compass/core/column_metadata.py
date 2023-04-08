from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class ColumnMetadata(BaseModel):
    types: List[str]
    columns: List[str]
    colTypeMap: Dict[str, str]
