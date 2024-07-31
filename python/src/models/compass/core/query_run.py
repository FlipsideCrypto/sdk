from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel

from .tags import Tags


class QueryRun(BaseModel):
    id: str
    sqlStatementId: str
    state: str
    path: str
    fileCount: Optional[int] = None
    lastFileNumber: Optional[int] = None
    fileNames: Optional[str] = None
    errorName: Optional[str] = None
    errorMessage: Optional[str] = None
    errorData: Optional[Any] = None
    dataSourceQueryId: Optional[str] = None
    dataSourceSessionId: Optional[str] = None
    startedAt: Optional[str] = None
    queryRunningEndedAt: Optional[str] = None
    queryStreamingEndedAt: Optional[str] = None
    endedAt: Optional[str] = None
    rowCount: Optional[int] = None
    totalSize: Optional[int] = None
    tags: Tags
    dataSourceId: str
    userId: str
    createdAt: str
    updatedAt: datetime
    archivedAt: Optional[datetime] = None
