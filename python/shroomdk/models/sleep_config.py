from typing import Optional
from pydantic import BaseModel, Field


class SleepConfig(BaseModel):
    attempts: int
    timeout_minutes: int
    interval_seconds: Optional[float]
