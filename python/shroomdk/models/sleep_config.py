from typing import Optional, Union

from pydantic import BaseModel


class SleepConfig(BaseModel):
    attempts: int
    timeout_minutes: Union[int, float]
    interval_seconds: Optional[float]
