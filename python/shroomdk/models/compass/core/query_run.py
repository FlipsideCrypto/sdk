from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel

from .tags import Tags


class QueryRun(BaseModel):
    id: str
    sqlStatementId: str
    state: str
    path: str
    fileCount: Optional[int]
    lastFileNumber: Optional[int]
    fileNames: Optional[str]
    errorName: Optional[str]
    errorMessage: Optional[str]
    errorData: Optional[Any]
    dataSourceQueryId: Optional[str]
    dataSourceSessionId: Optional[str]
    startedAt: Optional[str]
    queryRunningEndedAt: Optional[str]
    queryStreamingEndedAt: Optional[str]
    endedAt: Optional[str]
    rowCount: Optional[int]
    totalSize: Optional[int]
    tags: Tags
    dataSourceId: str
    userId: str
    createdAt: str
    updatedAt: datetime
    archivedAt: Optional[datetime]
