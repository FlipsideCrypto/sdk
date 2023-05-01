from typing import Any, Dict, List, Optional

from pydantic import BaseModel

from .tags import Tags


class QueryRequest(BaseModel):
    id: str
    sqlStatementId: str
    userId: str
    tags: Tags
    maxAgeMinutes: int
    resultTTLHours: int
    userSkipCache: bool
    triggeredQueryRun: bool
    queryRunId: str
    createdAt: str
    updatedAt: str
