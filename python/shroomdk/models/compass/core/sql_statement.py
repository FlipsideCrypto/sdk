from typing import Any, Dict, List, Optional

from pydantic import BaseModel

from .column_metadata import ColumnMetadata
from .tags import Tags


class SqlStatement(BaseModel):
    id: str
    statementHash: str
    sql: str
    columnMetadata: Optional[ColumnMetadata]
    userId: str
    tags: Tags
    createdAt: str
    updatedAt: str
